import {execFileSync} from "node:child_process";
import {writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  BUCKET,
  IAM_POLICY,
  IAM_USER,
  PREFIX,
  PUBLIC_BASE,
  REGION,
  parentAwsEnv,
  root
} from "./s3-env.mjs";

const parent = parentAwsEnv();
if (!parent.AWS_ACCESS_KEY_ID || !parent.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Parent AWS credentials not found in ngx-ramblers secrets or SETUP_AWS_* env");
}

function aws(args, extraEnv = {}) {
  return execFileSync("aws", args, {
    encoding: "utf8",
    env: {...process.env, ...parent, ...extraEnv},
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function awsJson(args) {
  return JSON.parse(aws(args));
}

const identity = awsJson(["sts", "get-caller-identity"]);
const account = identity.Account;
console.log(`account ${account} as ${identity.Arn}`);

const buckets = aws(["s3api", "list-buckets", "--query", "Buckets[].Name", "--output", "text"])
  .trim()
  .split(/\s+/);
if (!buckets.includes(BUCKET)) {
  aws([
    "s3api",
    "create-bucket",
    "--bucket",
    BUCKET,
    "--region",
    REGION,
    "--create-bucket-configuration",
    `LocationConstraint=${REGION}`
  ]);
  console.log(`created bucket ${BUCKET}`);
} else {
  console.log(`bucket ${BUCKET} already exists`);
}

aws([
  "s3api",
  "put-public-access-block",
  "--bucket",
  BUCKET,
  "--public-access-block-configuration",
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
]);

const bucketPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadDiary",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${BUCKET}/${PREFIX}/*`
    }
  ]
};
aws(["s3api", "put-bucket-policy", "--bucket", BUCKET, "--policy", JSON.stringify(bucketPolicy)]);

const cors = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "HEAD"],
      AllowedOrigins: [
        "https://nbarrett.github.io",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
      ],
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3000
    }
  ]
};
aws(["s3api", "put-bucket-cors", "--bucket", BUCKET, "--cors-configuration", JSON.stringify(cors)]);

let userExists = false;
try {
  aws(["iam", "get-user", "--user-name", IAM_USER]);
  userExists = true;
} catch {
  userExists = false;
}
if (!userExists) {
  aws(["iam", "create-user", "--user-name", IAM_USER, "--tags", "Key=project,Value=new-luckhurst-wood"]);
  console.log(`created IAM user ${IAM_USER}`);
} else {
  console.log(`IAM user ${IAM_USER} already exists`);
}

const iamPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "BucketList",
      Effect: "Allow",
      Action: ["s3:ListBucket", "s3:GetBucketLocation"],
      Resource: `arn:aws:s3:::${BUCKET}`
    },
    {
      Sid: "ObjectWrite",
      Effect: "Allow",
      Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:AbortMultipartUpload"],
      Resource: `arn:aws:s3:::${BUCKET}/*`
    }
  ]
};
const policyArn = `arn:aws:iam::${account}:policy/${IAM_POLICY}`;
let policyExists = false;
try {
  aws(["iam", "get-policy", "--policy-arn", policyArn]);
  policyExists = true;
} catch {
  policyExists = false;
}
if (!policyExists) {
  aws([
    "iam",
    "create-policy",
    "--policy-name",
    IAM_POLICY,
    "--policy-document",
    JSON.stringify(iamPolicy),
    "--description",
    "Luckhurst Wood diary bucket only"
  ]);
  console.log(`created policy ${IAM_POLICY}`);
} else {
  aws(["iam", "create-policy-version", "--policy-arn", policyArn, "--policy-document", JSON.stringify(iamPolicy), "--set-as-default"]);
  console.log(`updated policy ${IAM_POLICY}`);
}

const attached = awsJson(["iam", "list-attached-user-policies", "--user-name", IAM_USER]);
const already = (attached.AttachedPolicies || []).some((p) => p.PolicyArn === policyArn);
if (!already) {
  aws(["iam", "attach-user-policy", "--user-name", IAM_USER, "--policy-arn", policyArn]);
  console.log("attached policy to user");
}

const keys = awsJson(["iam", "list-access-keys", "--user-name", IAM_USER]);
const existing = keys.AccessKeyMetadata || [];
let accessKeyId;
let secretAccessKey;
if (existing.length >= 2) {
  for (const key of existing.slice(1)) {
    aws(["iam", "delete-access-key", "--user-name", IAM_USER, "--access-key-id", key.AccessKeyId]);
  }
}
if (existing.length === 0) {
  const created = awsJson(["iam", "create-access-key", "--user-name", IAM_USER]);
  accessKeyId = created.AccessKey.AccessKeyId;
  secretAccessKey = created.AccessKey.SecretAccessKey;
  console.log("created access key");
} else {
  const created = awsJson(["iam", "create-access-key", "--user-name", IAM_USER]);
  accessKeyId = created.AccessKey.AccessKeyId;
  secretAccessKey = created.AccessKey.SecretAccessKey;
  for (const key of existing) {
    aws(["iam", "delete-access-key", "--user-name", IAM_USER, "--access-key-id", key.AccessKeyId]);
  }
  console.log("rotated access key");
}

const envPath = join(root, ".env");
writeFileSync(
  envPath,
  [
    `AWS_ACCESS_KEY_ID=${accessKeyId}`,
    `AWS_SECRET_ACCESS_KEY=${secretAccessKey}`,
    `AWS_REGION=${REGION}`,
    `AWS_BUCKET=${BUCKET}`,
    ""
  ].join("\n"),
  {mode: 0o600}
);
console.log(`wrote ${envPath}`);
console.log(`public diary base ${PUBLIC_BASE}`);
