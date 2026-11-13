import {execFileSync} from "node:child_process";
import {mkdirSync, readdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {skipNames, skipStamps, video} from "./diary-skip.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const dropDir = join(root, "public/photos");
const diaryDir = join(root, "public/assets/diary");
mkdirSync(dropDir, {recursive: true});

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

const known = diaryMinutes();
const wanted = [];
for (const line of listing.trim().split(/\r\n|\n|\r/)) {
  const [stamp, filename] = line.split("\t");
  if (!filename || video.test(filename)) {
    continue;
  }
  if (known.has(stamp) || skipStamps.has(stamp) || skipNames.has(filename)) {
    continue;
  }
  wanted.push({stamp, filename});
}

console.log(`album stills not already in diary: ${wanted.length}`);
if (wanted.length === 0) {
  process.exit(0);
}

const listPath = join(dropDir, ".export-names.txt");
writeFileSync(listPath, wanted.map((item) => item.filename).join("\n"));

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
console.log("export finished");
