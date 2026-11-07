import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

export const root = join(fileURLToPath(new URL("..", import.meta.url)));

export const BUCKET = "nbarrett-luckhurst-wood";
export const REGION = "eu-west-1";
export const PREFIX = "diary";
export const IAM_USER = "luckhurst-wood-user";
export const IAM_POLICY = "luckhurst-wood-policy";
export const PUBLIC_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${PREFIX}`;

export function loadEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function parentAwsEnv() {
  const fromProcess = {
    AWS_ACCESS_KEY_ID: process.env.SETUP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.SETUP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: process.env.SETUP_AWS_REGION || process.env.AWS_REGION || REGION
  };
  if (fromProcess.AWS_ACCESS_KEY_ID && fromProcess.AWS_SECRET_ACCESS_KEY) {
    return fromProcess;
  }
  const secretsPath =
    process.env.NGX_RAMBLERS_SECRETS ||
    join(root, "../ngx-ramblers/non-vcs/secrets/secrets.ngx-ramblers.env");
  const file = loadEnvFile(secretsPath);
  return {
    AWS_ACCESS_KEY_ID: file.SETUP_AWS_ACCESS_KEY_ID || file.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: file.SETUP_AWS_SECRET_ACCESS_KEY || file.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: file.SETUP_AWS_REGION || file.AWS_REGION || REGION
  };
}

export function siteAwsEnv() {
  const local = loadEnvFile(join(root, ".env"));
  return {
    AWS_ACCESS_KEY_ID: local.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: local.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: local.AWS_REGION || process.env.AWS_REGION || REGION,
    AWS_BUCKET: local.AWS_BUCKET || process.env.AWS_BUCKET || BUCKET
  };
}
