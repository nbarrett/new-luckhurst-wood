import {execFileSync} from "node:child_process";
import {copyFileSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {extname, join} from "node:path";
import {fileURLToPath} from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const dropDir = join(root, "public/photos");
const diaryDir = join(root, "public/assets/diary");
const contentPath = join(root, "src/content.ts");
const maxEdge = 2560;
const jpegQuality = "88";

mkdirSync(dropDir, {recursive: true});
mkdirSync(diaryDir, {recursive: true});

function uuid8(name) {
  const stem = name.replace(/\.[^.]+$/, "");
  const first = stem.split("_")[0];
  return first.replace(/-/g, "").toLowerCase().slice(0, 8);
}

function sips(args) {
  return execFileSync("sips", args, {encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
}

function parseSipsDate(text) {
  const match = text.match(/creation:\s+(\S+\s+\S+)/);
  if (!match) {
    return null;
  }
  const value = Date.parse(match[1].replace(" ", "T"));
  return Number.isNaN(value) ? null : new Date(value);
}

function parseMdlsDate(path) {
  const text = execFileSync(
    "mdls",
    ["-name", "kMDItemContentCreationDate", "-name", "kMDItemFSCreationDate", "-raw", path],
    {encoding: "utf8"}
  );
  const match = text.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  if (!match) {
    return null;
  }
  const value = Date.parse(match[1].replace(" ", "T"));
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

function stamp(date, id) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}-${hh}${mm}-${id}.jpg`;
}

function convertToJpeg(src, dest) {
  const tmp = join(tmpdir(), `luckhurst-${Math.random().toString(16).slice(2)}.jpg`);
  sips(["-s", "format", "jpeg", "-s", "formatOptions", jpegQuality, "-Z", String(maxEdge), src, "--out", tmp]);
  renameSync(tmp, dest);
}

function diaryIds() {
  const ids = new Map();
  for (const name of readdirSync(diaryDir)) {
    const match = name.match(/-([0-9a-f]{8})\.jpg$/i);
    if (match) {
      ids.set(match[1].toLowerCase(), name);
    }
  }
  return ids;
}

function dropFiles() {
  return readdirSync(dropDir)
    .filter((name) => name !== ".gitkeep" && name !== ".DS_Store")
    .map((name) => join(dropDir, name))
    .filter((path) => statSync(path).isFile());
}

function ingestDrop() {
  const ids = diaryIds();
  const added = [];
  const replaced = [];
  for (const src of dropFiles()) {
    const id = uuid8(src.split("/").pop());
    const destName = stamp(creationDate(src), id);
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
    convertToJpeg(src, dest);
    ids.set(id, destName);
    unlinkSync(src);
    if (previous) {
      replaced.push(destName);
      console.log(`replaced ${destName}`);
    } else {
      added.push(destName);
      console.log(`added ${destName}`);
    }
  }
  return {added, replaced};
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

function altFor(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

function rewriteContent() {
  const text = readFileSync(contentPath, "utf8");
  const captions = new Map();
  for (const match of text.matchAll(/\{id: "([^"]+)", date: "([^"]+)", title: "([^"]*)", body: "([^"]*)"/g)) {
    captions.set(match[2], {title: match[3], body: match[4]});
  }
  const byDate = new Map();
  for (const name of readdirSync(diaryDir).sort()) {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})-\d{4}-[0-9a-f]{8}\.jpg$/i);
    if (!match) {
      continue;
    }
    const list = byDate.get(match[1]) || [];
    list.push(name);
    byDate.set(match[1], list);
  }
  const dates = [...byDate.keys()].sort().reverse();
  const entries = dates.map((iso) => {
    const cap = captions.get(iso) || {title: titleFor(iso), body: ""};
    const files = byDate.get(iso).map((file) => `"${file}"`).join(",");
    return `  {id: "${iso}", date: "${iso}", title: "${cap.title}", body: "${cap.body}", photos: shots("${altFor(iso)}", [${files}])}`;
  });
  const next = `export const diary: DiaryEntry[] = [\n${entries.join(",\n")}\n];`;
  const updated = text.replace(/export const diary: DiaryEntry\[] = \[[\s\S]*?\];/, next);
  writeFileSync(contentPath, updated);
  return {days: dates.length, photos: [...byDate.values()].reduce((n, list) => n + list.length, 0)};
}

const drop = ingestDrop();
const shrunk = shrinkDiary();
const written = rewriteContent();
console.log(
  `done added=${drop.added.length} replaced=${drop.replaced.length} shrunk=${shrunk} days=${written.days} photos=${written.photos}`
);
