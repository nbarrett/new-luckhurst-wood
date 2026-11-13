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
const SINCE_UNIX = Date.parse("2026-04-01T00:00:00") / 1000;

function diaryMinutes() {
  const set = new Set();
  for (const name of readdirSync(diaryDir)) {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})-[0-9a-f]{8}\.jpg$/i);
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
      items.push({stamp, filename, source: "album"});
    }
  }
  return items;
}

function geoItems() {
  const library = join(homedir(), "Pictures/Photos Library.photoslibrary/database/Photos.sqlite");
  const copy = join(tmpdir(), `luckhurst-photos-${Date.now()}.sqlite`);
  copyFileSync(library, copy);
  const box = bbox();
  const sql = `
SELECT
  COALESCE(aa.ZORIGINALFILENAME, a.ZFILENAME),
  a.ZFILENAME,
  a.ZDIRECTORY,
  datetime(a.ZDATECREATED + ${COCOA_EPOCH}, 'unixepoch', 'localtime'),
  a.ZLATITUDE,
  a.ZLONGITUDE
FROM ZASSET a
LEFT JOIN ZADDITIONALASSETATTRIBUTES aa ON aa.Z_PK = a.ZADDITIONALATTRIBUTES
WHERE a.ZTRASHEDSTATE = 0 AND a.ZHIDDEN = 0 AND a.ZKIND = 0
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
    const [original, stored, directory, taken, lat, lon] = line.split("\t");
    if (!insideSite(Number(lat), Number(lon))) {
      continue;
    }
    items.push({
      stamp: stampFromDate(taken),
      filename: original || stored,
      stored,
      directory,
      source: "geo"
    });
  }
  return items;
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
    copied += 1;
  }
  return copied;
}

function exportAlbum(names) {
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
    export exportList to dest with using originals
  end if
end tell
`;
  execFileSync("osascript", ["-e", script], {stdio: "inherit", timeout: 600000});
}

const known = diaryMinutes();
const wanted = new Map();
for (const item of [...albumItems(), ...geoItems()]) {
  if (!item.filename || video.test(item.filename)) {
    continue;
  }
  if (known.has(item.stamp) || skipStamps.has(item.stamp) || skipNames.has(item.filename)) {
    continue;
  }
  if (!wanted.has(item.filename)) {
    wanted.set(item.filename, item);
  }
}

console.log(`new stills (album ∪ on-site GPS): ${wanted.size}`);
for (const item of wanted.values()) {
  console.log(`  ${item.stamp} ${item.filename} (${item.source})`);
}
if (wanted.size === 0) {
  process.exit(0);
}
const geoOnly = [...wanted.values()].filter((item) => item.source === "geo");
const albumOnly = [...wanted.values()].filter((item) => item.source === "album");
if (geoOnly.length) {
  console.log(`copied ${copyOriginals(geoOnly)} on-site originals`);
}
if (albumOnly.length) {
  exportAlbum(albumOnly.map((item) => item.filename));
}
console.log("export finished");
