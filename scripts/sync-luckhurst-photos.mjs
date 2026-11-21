import {execFileSync} from "node:child_process";
import {copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync} from "node:fs";
import {homedir, tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {skipNames, skipStamps, video} from "./diary-skip.mjs";
import {bbox, insideSite} from "./luckhurst-geo.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const dropDir = join(root, "public/photos");
const diaryDir = join(root, "public/assets/diary");
mkdirSync(dropDir, {recursive: true});

const COCOA_EPOCH = 978307200;
// GPS hits only count from the day after the newest diary day. Older walks were
// already picked through the album, and their left-out shots should stay out.
function newestDiaryDay() {
  const days = readdirSync(diaryDir)
    .map((name) => name.match(/^(\d{4}-\d{2}-\d{2})-\d{4}-[0-9a-f]{8}\.(?:jpg|mp4)$/i))
    .filter(Boolean)
    .map((match) => match[1])
    .sort();
  return days.at(-1);
}

const newestDay = newestDiaryDay();
const sinceDate = newestDay ? new Date(`${newestDay}T00:00:00`) : new Date("2026-04-01T00:00:00");
if (newestDay) {
  sinceDate.setDate(sinceDate.getDate() + 1);
}
const SINCE_UNIX = sinceDate.getTime() / 1000;

// Stills and videos are tracked apart so a clip filmed in the same minute as a
// still is not mistaken for it.
function diaryMinutes(extension) {
  const set = new Set();
  const pattern = new RegExp(`^(\\d{4}-\\d{2}-\\d{2})-(\\d{2})(\\d{2})-[0-9a-f]{8}\\.${extension}$`, "i");
  for (const name of readdirSync(diaryDir)) {
    const match = name.match(pattern);
    if (!match) {
      continue;
    }
    const date = match[1];
    const hour = Number(match[2]);
    const minute = match[3];
    set.add(`${date}-${match[2]}${minute}`);
    const plus = String((hour + 1) % 24).padStart(2, "0");
    const minus = String((hour + 23) % 24).padStart(2, "0");
    set.add(`${date}-${plus}${minute}`);
    set.add(`${date}-${minus}${minute}`);
  }
  return set;
}

function stampFromDate(isoLocal) {
  const m = isoLocal.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})/);
  if (!m) {
    return "";
  }
  return `${m[1]}-${m[2]}${m[3]}`;
}

function albumItems() {
  const listing = execFileSync(
    "osascript",
    [
      "-e",
      `tell application "Photos"
  set alb to album "Luckhurst"
  set out to ""
  repeat with photoItem in (every media item of alb)
    set d to date of photoItem
    set fname to filename of photoItem
    set y to year of d as string
    set mo to text -2 thru -1 of ("0" & ((month of d) as integer))
    set da to text -2 thru -1 of ("0" & (day of d))
    set h to text -2 thru -1 of ("0" & (hours of d))
    set mi to text -2 thru -1 of ("0" & (minutes of d))
    set out to out & y & "-" & mo & "-" & da & "-" & h & mi & tab & fname & return
  end repeat
  return out
end tell`
    ],
    {encoding: "utf8", maxBuffer: 10 * 1024 * 1024}
  );
  const items = [];
  for (const line of listing.trim().split(/\r\n|\n|\r/)) {
    const [stamp, filename] = line.split("\t");
    if (filename) {
      items.push({stamp, filename, source: "album", kind: video.test(filename) ? "video" : "still"});
    }
  }
  return items;
}

function geoItems() {
  const library = join(homedir(), "Pictures/Photos Library.photoslibrary/database/Photos.sqlite");
  const copy = join(tmpdir(), `luckhurst-photos-${Date.now()}.sqlite`);
  try {
    copyFileSync(library, copy);
  } catch (error) {
    if (error.code !== "EPERM") {
      throw error;
    }
    console.warn("No access to the Photos database (this terminal app lacks Full Disk Access).");
    console.warn("Asking Photos for locations instead; this scans the whole library and takes a minute.");
    return geoItemsViaPhotos();
  }
  const box = bbox();
  const sql = `
SELECT
  COALESCE(aa.ZORIGINALFILENAME, a.ZFILENAME),
  a.ZFILENAME,
  a.ZDIRECTORY,
  datetime(a.ZDATECREATED + ${COCOA_EPOCH}, 'unixepoch', 'localtime'),
  a.ZLATITUDE,
  a.ZLONGITUDE,
  a.ZKIND
FROM ZASSET a
LEFT JOIN ZADDITIONALASSETATTRIBUTES aa ON aa.Z_PK = a.ZADDITIONALATTRIBUTES
WHERE a.ZTRASHEDSTATE = 0 AND a.ZHIDDEN = 0 AND a.ZKIND IN (0, 1)
  AND a.ZLATITUDE != -180.0
  AND a.ZLATITUDE BETWEEN ${box.minLat} AND ${box.maxLat}
  AND a.ZLONGITUDE BETWEEN ${box.minLon} AND ${box.maxLon}
  AND (a.ZDATECREATED + ${COCOA_EPOCH}) >= ${SINCE_UNIX};
`;
  let raw;
  try {
    raw = execFileSync("sqlite3", ["-separator", "\t", copy, sql], {encoding: "utf8"});
  } finally {
    try {
      unlinkSync(copy);
    } catch {
      /* ignore */
    }
  }
  const items = [];
  for (const line of raw.trim().split(/\n/).filter(Boolean)) {
    const [original, stored, directory, taken, lat, lon, kind] = line.split("\t");
    if (!insideSite(Number(lat), Number(lon))) {
      continue;
    }
    items.push({
      stamp: stampFromDate(taken),
      filename: original || stored,
      stored,
      directory,
      source: "geo",
      kind: kind === "1" ? "video" : "still"
    });
  }
  return items;
}

// Slower fallback for a terminal without Full Disk Access: Photos itself
// reports each item's date and location. Hits export through Photos by id.
function geoItemsViaPhotos() {
  const listing = execFileSync(
    "osascript",
    [
      "-e",
      `set fromDay to current date
set year of fromDay to ${sinceDate.getFullYear()}
set day of fromDay to 1
set month of fromDay to ${sinceDate.getMonth() + 1}
set day of fromDay to ${sinceDate.getDate()}
set time of fromDay to 0
tell application "Photos"
  set allDates to date of every media item
  set allIds to id of every media item
  set out to ""
  repeat with i from 1 to count of allDates
    set d to item i of allDates
    if d ≥ fromDay then
      try
      set m to media item id (item i of allIds)
      set loc to location of m
      on error
      set loc to {missing value, missing value}
      end try
      if (item 1 of loc) is not missing value then
        set y to year of d as string
        set mo to text -2 thru -1 of ("0" & ((month of d) as integer))
        set da to text -2 thru -1 of ("0" & (day of d))
        set h to text -2 thru -1 of ("0" & (hours of d))
        set mi to text -2 thru -1 of ("0" & (minutes of d))
        set out to out & (item i of allIds) & tab & (filename of m) & tab & y & "-" & mo & "-" & da & "-" & h & mi & tab & (item 1 of loc as string) & tab & (item 2 of loc as string) & linefeed
      end if
    end if
  end repeat
  return out
end tell`
    ],
    {encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 600000}
  );
  const items = [];
  for (const line of listing.trim().split(/\r\n|\n|\r/).filter(Boolean)) {
    const [photosId, filename, stamp, lat, lon] = line.split("\t");
    if (!insideSite(Number(lat.replace(",", ".")), Number(lon.replace(",", ".")))) {
      continue;
    }
    items.push({stamp, filename, photosId, source: "geo", kind: video.test(filename) ? "video" : "still"});
  }
  return items;
}

function exportByIds(ids, {originals}) {
  if (ids.length === 0) {
    return;
  }
  const listPath = join(dropDir, ".export-ids.txt");
  writeFileSync(listPath, ids.join("\n"));
  const script = `
set dest to POSIX file "${dropDir}"
set wantedIds to paragraphs of (read POSIX file "${listPath}" as «class utf8»)
tell application "Photos"
  set exportList to {}
  repeat with wantedId in wantedIds
    if length of wantedId > 0 then set end of exportList to media item id (contents of wantedId)
  end repeat
  export exportList to dest${originals ? " with using originals" : ""}
end tell
`;
  execFileSync("osascript", ["-e", script], {stdio: "inherit", timeout: 600000});
  unlinkSync(listPath);
}

function copyOriginals(items) {
  const originalsRoot = join(homedir(), "Pictures/Photos Library.photoslibrary/originals");
  let copied = 0;
  for (const item of items) {
    if (!item.directory || !item.stored) {
      continue;
    }
    const src = join(originalsRoot, item.directory, item.stored);
    if (!existsSync(src)) {
      console.log(`missing original ${src}`);
      continue;
    }
    const destName = item.filename.replace(/[^\w.\-]+/g, "_");
    copyFileSync(src, join(dropDir, destName));
    item.dropName = destName;
    copied += 1;
  }
  return copied;
}

// Stills export as originals (HEIC). Videos export as Photos shows them, so a
// trim or a camera effect such as slow motion is kept; "using originals" would
// write the raw clip plus an .aae sidecar.
function exportAlbum(names, {originals}) {
  if (names.length === 0) {
    return;
  }
  const listPath = join(dropDir, ".export-names.txt");
  writeFileSync(listPath, names.join("\n"));
  const script = `
set dest to POSIX file "${dropDir}"
set names to paragraphs of (read POSIX file "${listPath}" as «class utf8»)
tell application "Photos"
  set alb to album "Luckhurst"
  set exportList to {}
  repeat with photoItem in (every media item of alb)
    set fname to filename of photoItem
    if names contains fname then
      set end of exportList to contents of photoItem
    end if
  end repeat
  if (count of exportList) > 0 then
    export exportList to dest${originals ? " with using originals" : ""}
  end if
end tell
`;
  execFileSync("osascript", ["-e", script], {stdio: "inherit", timeout: 600000});
}

// Exporting a Live Photo "using originals" also writes its short motion clip
// next to the still. Those clips are not diary videos, so drop them.
function removeLivePhotoClips(stillNames, videoNames) {
  const wantedVideos = new Set(videoNames.map((name) => name.toLowerCase()));
  const stillBases = new Set(stillNames.map((name) => name.replace(/\.[^.]+$/, "").toLowerCase()));
  let removed = 0;
  for (const name of readdirSync(dropDir)) {
    if (!video.test(name) || wantedVideos.has(name.toLowerCase())) {
      continue;
    }
    if (stillBases.has(name.replace(/\.[^.]+$/, "").toLowerCase())) {
      unlinkSync(join(dropDir, name));
      removed += 1;
    }
  }
  return removed;
}

// Video files lose their creation date on export, so ingest reads the time
// Photos recorded from here.
function writeVideoStamps(items) {
  const stamps = {};
  for (const item of items) {
    stamps[item.dropName || item.filename] = item.stamp;
  }
  writeFileSync(join(dropDir, ".video-stamps.json"), JSON.stringify(stamps, null, 2));
}

const known = {still: diaryMinutes("jpg"), video: diaryMinutes("mp4")};
const wanted = new Map();
for (const item of [...albumItems(), ...geoItems()]) {
  if (!item.filename) {
    continue;
  }
  if (known[item.kind].has(item.stamp) || skipStamps.has(item.stamp) || skipNames.has(item.filename)) {
    continue;
  }
  if (!wanted.has(item.filename)) {
    wanted.set(item.filename, item);
  }
}

console.log(`new stills and videos (album ∪ on-site GPS): ${wanted.size}`);
for (const item of wanted.values()) {
  console.log(`  ${item.stamp} ${item.filename} (${item.source}, ${item.kind})`);
}
if (wanted.size === 0) {
  process.exit(0);
}
const viaPhotos = [...wanted.values()].filter((item) => item.photosId);
const geoOnly = [...wanted.values()].filter((item) => item.source === "geo" && !item.photosId);
const albumOnly = [...wanted.values()].filter((item) => item.source === "album");
if (geoOnly.length) {
  console.log(`copied ${copyOriginals(geoOnly)} on-site originals`);
}
exportByIds(viaPhotos.filter((item) => item.kind === "still").map((item) => item.photosId), {originals: true});
exportByIds(viaPhotos.filter((item) => item.kind === "video").map((item) => item.photosId), {originals: false});
exportAlbum(albumOnly.filter((item) => item.kind === "still").map((item) => item.filename), {originals: true});
exportAlbum(albumOnly.filter((item) => item.kind === "video").map((item) => item.filename), {originals: false});
for (const name of readdirSync(dropDir)) {
  if (/\.aae$/i.test(name)) {
    unlinkSync(join(dropDir, name));
  }
}
const videos = [...wanted.values()].filter((item) => item.kind === "video");
const stills = [...wanted.values()].filter((item) => item.kind === "still");
const clips = removeLivePhotoClips(
  stills.map((item) => item.filename),
  videos.map((item) => item.dropName || item.filename)
);
if (clips) {
  console.log(`removed ${clips} Live Photo motion clips`);
}
writeVideoStamps(videos);
console.log("export finished");
