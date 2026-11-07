import {execFileSync} from "node:child_process";
import {mkdirSync, readdirSync, renameSync, unlinkSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {PREFIX, siteAwsEnv} from "./s3-env.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const diaryDir = join(root, "public/assets/diary");
const fitDir = join(root, "public/assets/diary-fit");
const fitEdge = 1600;
const fitQuality = "78";
const aws = siteAwsEnv();
if (!aws.AWS_ACCESS_KEY_ID || !aws.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing site AWS credentials in .env — run npm run photos:setup-s3");
}

mkdirSync(fitDir, {recursive: true});

function sips(args) {
  return execFileSync("sips", args, {encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
}

const files = readdirSync(diaryDir).filter((name) => name.endsWith(".jpg"));
console.log(`making ${files.length} fit JPEGs`);
for (const name of files) {
  const tmp = join(tmpdir(), `luckhurst-fit-${name}`);
  sips([
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    fitQuality,
    "-Z",
    String(fitEdge),
    join(diaryDir, name),
    "--out",
    tmp
  ]);
  renameSync(tmp, join(fitDir, name));
}

execFileSync(
  "aws",
  [
    "s3",
    "sync",
    fitDir,
    `s3://${aws.AWS_BUCKET}/${PREFIX}/fit/`,
    "--exclude",
    "*",
    "--include",
    "*.jpg",
    "--content-type",
    "image/jpeg",
    "--cache-control",
    "public, max-age=31536000, immutable"
  ],
  {encoding: "utf8", env: {...process.env, ...aws}, stdio: "inherit"}
);
console.log("fit upload done");
