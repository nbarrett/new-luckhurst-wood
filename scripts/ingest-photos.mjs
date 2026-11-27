import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {video} from "./diary-skip.mjs";
import {fetchDiaryList, putDiaryList} from "./diary-list.mjs";
import {PREFIX, siteAwsEnv} from "./s3-env.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const dropDir = join(root, "public/photos");
const diaryDir = join(root, "public/assets/diary");
const maxEdge = 2560;
const fitEdge = 1600;
const jpegQuality = "88";
const fitQuality = "78";
const stillPattern = /\.(jpe?g|heic|png|webp|tif|tiff)$/i;
// avconvert ships with macOS. Its H.264 presets turn iPhone HDR into SDR, and
// its metadata filter strips GPS from the output, which matters on a public bucket.
const videoPreset = "Preset1280x720";
const posterEdge = 1600;
const videoStampsPath = join(dropDir, ".video-stamps.json");

mkdirSync(dropDir, {recursive: true});
mkdirSync(diaryDir, {recursive: true});

function uuid8(name) {
  const fromStamp = name.match(/-([0-9a-f]{8})(?:\.[^.]+)?$/i);
  if (fromStamp) {
    return fromStamp[1].toLowerCase();
  }
  return createHash("sha1").update(name).digest("hex").slice(0, 8);
}

function sips(args) {
  return execFileSync("sips", args, {encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
}

function parseSipsDate(text) {
  // sips prints EXIF local time as "2026:09:15 18:40:27".
  const match = text.match(/creation:\s+(\d{4})[:-](\d{2})[:-](\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (!match) {
    return null;
  }
  const value = Date.parse(`${match[1]}-${match[2]}-${match[3]}T${match[4]}`);
  return Number.isNaN(value) ? null : new Date(value);
}

function parseMdlsDate(path) {
  const text = execFileSync(
    "mdls",
    ["-name", "kMDItemContentCreationDate", "-name", "kMDItemFSCreationDate", "-raw", path],
    {encoding: "utf8"}
  );
  // mdls prints UTC with an offset, e.g. "2026-09-15 17:40:27 +0000".
  const match = text.match(/(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?: ([+-])(\d{2})(\d{2}))?/);
  if (!match) {
    return null;
  }
  const offset = match[3] ? `${match[3]}${match[4]}:${match[5]}` : "";
  const value = Date.parse(`${match[1]}T${match[2]}${offset}`);
  return Number.isNaN(value) ? null : new Date(value);
}

function creationDate(path) {
  try {
    const fromSips = parseSipsDate(sips(["-g", "creation", path]));
    if (fromSips) {
      return fromSips;
    }
  } catch {}
  return parseMdlsDate(path) || new Date(statSync(path).mtimeMs);
}

function stamp(date, id, extension = "jpg") {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}-${hh}${mm}-${id}.${extension}`;
}

function convertToJpeg(src, dest, edge = maxEdge, quality = jpegQuality) {
  const tmp = join(tmpdir(), `luckhurst-${Math.random().toString(16).slice(2)}.jpg`);
  sips(["-s", "format", "jpeg", "-s", "formatOptions", quality, "-Z", String(edge), src, "--out", tmp]);
  renameSync(tmp, dest);
}

function makeFit(fullPath, dest) {
  convertToJpeg(fullPath, dest, fitEdge, fitQuality);
}

function diaryIds() {
  const ids = new Map();
  for (const name of readdirSync(diaryDir)) {
    const match = name.match(/-([0-9a-f]{8})\.(?:jpg|mp4)$/i);
    if (match) {
      ids.set(match[1].toLowerCase(), name);
    }
  }
  return ids;
}

function baseName(name) {
  return name.replace(/\.[^.]+$/, "").toLowerCase();
}

function dropFiles() {
  const names = readdirSync(dropDir)
    .filter((name) => !name.startsWith("."))
    .filter((name) => statSync(join(dropDir, name)).isFile());
  const stills = names.filter((name) => stillPattern.test(name));
  const stillBases = new Set(stills.map(baseName));
  const videos = [];
  for (const name of names.filter((name) => video.test(name))) {
    // A clip sharing a still's name is the motion half of a Live Photo.
    if (stillBases.has(baseName(name))) {
      unlinkSync(join(dropDir, name));
      console.log(`dropped Live Photo clip ${name}`);
      continue;
    }
    videos.push(name);
  }
  return [...stills, ...videos].map((name) => join(dropDir, name));
}

function videoStamps() {
  if (!existsSync(videoStampsPath)) {
    return {};
  }
  return JSON.parse(readFileSync(videoStampsPath, "utf8"));
}

function dateFromStamp(value) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}

function videoDate(path, stamps) {
  // An edited export can come back as .mov or .mp4 rather than .MOV, so match on the base name.
  const wanted = baseName(path.split("/").pop());
  const key = Object.keys(stamps).find((name) => baseName(name) === wanted);
  const fromPhotos = dateFromStamp(key ? stamps[key] : undefined);
  if (fromPhotos) {
    return fromPhotos;
  }
  try {
    const fromSpotlight = parseMdlsDate(path);
    if (fromSpotlight) {
      return fromSpotlight;
    }
  } catch {}
  return new Date(statSync(path).mtimeMs);
}

function convertVideo(src, dest) {
  const tmp = join(tmpdir(), `luckhurst-${Math.random().toString(16).slice(2)}.mp4`);
  execFileSync("avconvert", ["--source", src, "--preset", videoPreset, "--output", tmp, "--replace"], {
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 1800000
  });
  copyFileSync(tmp, dest);
  unlinkSync(tmp);
}

function makePoster(videoPath, dest) {
  const dir = join(tmpdir(), `luckhurst-poster-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, {recursive: true});
  execFileSync("qlmanage", ["-t", "-s", String(posterEdge), "-o", dir, videoPath], {stdio: ["ignore", "pipe", "pipe"]});
  const png = join(dir, `${videoPath.split("/").pop()}.png`);
  if (!existsSync(png)) {
    throw new Error(`Quick Look made no poster for ${videoPath}`);
  }
  convertToJpeg(png, dest, posterEdge, jpegQuality);
  unlinkSync(png);
}

function ingestDrop() {
  const ids = diaryIds();
  const stamps = videoStamps();
  const added = [];
  const replaced = [];
  for (const src of dropFiles()) {
    const isVideo = video.test(src);
    const id = uuid8(src.split("/").pop());
    const destName = isVideo ? stamp(videoDate(src, stamps), id, "mp4") : stamp(creationDate(src), id);
    const dest = join(diaryDir, destName);
    const previous = ids.get(id);
    if (previous && previous !== destName) {
      const oldPath = join(diaryDir, previous);
      try {
        unlinkSync(oldPath);
      } catch {
        /* old name already gone */
      }
    }
    if (isVideo) {
      convertVideo(src, dest);
    } else {
      convertToJpeg(src, dest);
    }
    ids.set(id, destName);
    unlinkSync(src);
    if (isVideo) {
      uploadDiaryVideo(dest);
    } else {
      uploadDiaryFile(dest);
    }
    if (previous) {
      replaced.push(destName);
      console.log(`replaced ${destName}`);
    } else {
      added.push(destName);
      console.log(`added ${destName}`);
    }
  }
  if (existsSync(videoStampsPath)) {
    unlinkSync(videoStampsPath);
  }
  return {added, replaced};
}

function putS3(localPath, key, contentType = "image/jpeg", cacheControl = "public, max-age=31536000, immutable") {
  const aws = siteAwsEnv();
  if (!aws.AWS_ACCESS_KEY_ID || !aws.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing site AWS credentials in .env — run npm run photos:setup-s3");
  }
  execFileSync(
    "aws",
    [
      "s3",
      "cp",
      localPath,
      `s3://${aws.AWS_BUCKET}/${key}`,
      "--content-type",
      contentType,
      "--cache-control",
      cacheControl
    ],
    {encoding: "utf8", env: {...process.env, ...aws}, stdio: ["ignore", "pipe", "pipe"]}
  );
}

function uploadDiaryFile(path) {
  const name = path.split("/").pop();
  putS3(path, `${PREFIX}/${name}`);
  const fit = join(tmpdir(), `luckhurst-fit-${name}`);
  makeFit(path, fit);
  putS3(fit, `${PREFIX}/fit/${name}`);
  unlinkSync(fit);
}

// Videos live at diary/video/<stamp>.mp4 with a still frame at
// diary/poster/<stamp>.jpg, which the diary shows until someone presses play.
function uploadDiaryVideo(path) {
  const name = path.split("/").pop();
  putS3(path, `${PREFIX}/video/${name}`, "video/mp4");
  const poster = join(tmpdir(), `luckhurst-poster-${name.replace(/\.mp4$/, ".jpg")}`);
  makePoster(path, poster);
  putS3(poster, `${PREFIX}/poster/${name.replace(/\.mp4$/, ".jpg")}`);
  unlinkSync(poster);
}

function shrinkDiary() {
  let shrunk = 0;
  for (const name of readdirSync(diaryDir)) {
    if (!name.endsWith(".jpg")) {
      continue;
    }
    const path = join(diaryDir, name);
    const before = statSync(path).size;
    const info = sips(["-g", "pixelWidth", "-g", "pixelHeight", path]);
    const width = Number((info.match(/pixelWidth:\s+(\d+)/) || [])[1] || 0);
    const height = Number((info.match(/pixelHeight:\s+(\d+)/) || [])[1] || 0);
    if (width <= maxEdge && height <= maxEdge) {
      continue;
    }
    const tmp = join(tmpdir(), `luckhurst-shrink-${name}`);
    copyFileSync(path, tmp);
    convertToJpeg(tmp, path);
    unlinkSync(tmp);
    const after = statSync(path).size;
    if (after < before) {
      shrunk += 1;
      console.log(`shrunk ${name} ${Math.round(before / 1024)}k → ${Math.round(after / 1024)}k`);
    }
  }
  return shrunk;
}

function titleFor(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  });
}

// The diary list on S3 is what the site shows. Titles, notes and hidden
// photos are edited there (the edit page at /__diary/ under npm run dev),
// so they are kept; this only brings the file lists up to date.
function publishDiaryList(listed) {
  const remote = new Map(listed.map((day) => [day.date, day]));
  const byDate = new Map();
  for (const name of readdirSync(diaryDir).sort()) {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})-\d{4}-[0-9a-f]{8}\.(?:jpg|mp4)$/i);
    if (!match) {
      continue;
    }
    const list = byDate.get(match[1]) || [];
    list.push(name);
    byDate.set(match[1], list);
  }
  const dates = [...byDate.keys()].sort().reverse();
  if (dates.length === 0) {
    console.log("no local diary files — left the S3 diary list unchanged");
    return {days: 0, photos: 0};
  }
  const days = dates.map((iso) => {
    const there = remote.get(iso);
    const files = byDate.get(iso);
    return {
      date: iso,
      title: there?.title || titleFor(iso),
      body: there?.body ?? "",
      files,
      hidden: (there?.hidden || []).filter((file) => files.includes(file))
    };
  });
  putDiaryList(days);
  const hidden = days.reduce((n, day) => n + day.hidden.length, 0);
  console.log(`uploaded diary list: ${days.length} days`);
  return {days: days.length, photos: days.reduce((n, day) => n + day.files.length, 0) - hidden};
}

const listed = await fetchDiaryList();
const drop = ingestDrop();
const shrunk = shrinkDiary();
const written = publishDiaryList(listed);
console.log(
  `done added=${drop.added.length} replaced=${drop.replaced.length} shrunk=${shrunk} days=${written.days} photos=${written.photos}`
);
