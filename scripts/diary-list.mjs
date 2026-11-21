// The diary list on S3 (diary/index.json). The site reads it on load, the
// photo sync rewrites it, and the edit page (npm run dev, /__diary/) saves it.
//
// Shape, newest day first:
//   [{date: "2026-11-21", title: "21 November", body: "", files: [...], hidden: [...]}]
// files lists every photo and video for the day; hidden lists the ones left out.
import {execFileSync} from "node:child_process";
import {unlinkSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {PREFIX, PUBLIC_BASE, siteAwsEnv} from "./s3-env.mjs";

export const diaryListUrl = `${PUBLIC_BASE}/index.json`;
const fileName = /^\d{4}-\d{2}-\d{2}-\d{4}-[0-9a-f]{8}\.(?:jpg|mp4)$/;
const isoDay = /^\d{4}-\d{2}-\d{2}$/;

// Throws if S3 cannot be reached, so a sync never overwrites hidden photos
// and notes with an empty list. A missing list (403/404 from S3) is empty.
export async function fetchDiaryList() {
  const response = await fetch(`${diaryListUrl}?t=${Date.now()}`, {cache: "no-store"});
  if (response.status === 403 || response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`Could not read the diary list from S3: HTTP ${response.status}`);
  }
  return cleanDiaryList(await response.json());
}

export function cleanDiaryList(days) {
  if (!Array.isArray(days)) {
    throw new Error("diary list must be an array");
  }
  return days
    .filter((day) => day && isoDay.test(day.date) && Array.isArray(day.files))
    .map((day) => {
      const files = day.files.filter((file) => fileName.test(file));
      const hidden = Array.isArray(day.hidden) ? day.hidden.filter((file) => files.includes(file)) : [];
      return {
        date: day.date,
        title: String(day.title ?? "").slice(0, 200),
        body: String(day.body ?? "").slice(0, 4000),
        files,
        hidden
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function putDiaryList(days) {
  const aws = siteAwsEnv();
  if (!aws.AWS_ACCESS_KEY_ID || !aws.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing site AWS credentials in .env");
  }
  const path = join(tmpdir(), `luckhurst-diary-index-${process.pid}.json`);
  writeFileSync(path, JSON.stringify(cleanDiaryList(days)));
  try {
    execFileSync(
      "aws",
      [
        "s3",
        "cp",
        path,
        `s3://${aws.AWS_BUCKET}/${PREFIX}/index.json`,
        "--content-type",
        "application/json",
        "--cache-control",
        "no-cache"
      ],
      {encoding: "utf8", env: {...process.env, ...aws}, stdio: ["ignore", "pipe", "pipe"]}
    );
  } finally {
    unlinkSync(path);
  }
}
