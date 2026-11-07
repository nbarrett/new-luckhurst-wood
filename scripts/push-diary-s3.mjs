import {execFileSync} from "node:child_process";
import {readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {PREFIX, siteAwsEnv} from "./s3-env.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const diaryDir = join(root, "public/assets/diary");
const aws = siteAwsEnv();
if (!aws.AWS_ACCESS_KEY_ID || !aws.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing site AWS credentials in .env — run npm run photos:setup-s3");
}

const files = readdirSync(diaryDir).filter((name) => name.endsWith(".jpg"));
console.log(`uploading ${files.length} files to s3://${aws.AWS_BUCKET}/${PREFIX}/`);
execFileSync(
  "aws",
  [
    "s3",
    "sync",
    diaryDir,
    `s3://${aws.AWS_BUCKET}/${PREFIX}/`,
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
console.log("done");
