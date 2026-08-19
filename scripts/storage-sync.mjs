// One-off utility: inventory / copy objects between two S3-compatible buckets.
//
//   node scripts/storage-sync.mjs inventory   # read-only: list both buckets, show collisions
//   node scripts/storage-sync.mjs copy        # stream every object PROD -> STAGING
//
// Source = production storage, Destination = staging storage. Config is read
// from .env.production and .env.staging (STORAGE_* vars).
import { readFileSync } from "node:fs";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

function readEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=['"]?(.*?)['"]?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function makeClient(env) {
  return new S3Client({
    region: env.STORAGE_REGION || "auto",
    endpoint: env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: !!env.STORAGE_ENDPOINT,
  });
}

async function listAll(client, bucket) {
  const objects = [];
  let ContinuationToken;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken }),
    );
    for (const o of res.Contents || []) objects.push({ key: o.Key, size: o.Size });
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objects;
}

const fmt = (b) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

async function main() {
  const mode = process.argv[2] || "inventory";
  const srcEnv = readEnv(".env.production");
  const dstEnv = readEnv(".env.staging");

  const src = makeClient(srcEnv);
  const dst = makeClient(dstEnv);
  const srcBucket = srcEnv.STORAGE_BUCKET;
  const dstBucket = dstEnv.STORAGE_BUCKET;

  console.log(`SOURCE (prod):  ${srcBucket}  @ ${srcEnv.STORAGE_ENDPOINT}`);
  console.log(`DEST  (staging):${dstBucket}  @ ${dstEnv.STORAGE_ENDPOINT}`);
  if (srcBucket === dstBucket) {
    console.error("\nABORT: source and destination bucket are identical.");
    process.exit(1);
  }

  console.log("\nListing source...");
  const srcObjs = await listAll(src, srcBucket);
  console.log("Listing destination...");
  const dstObjs = await listAll(dst, dstBucket);

  const srcBytes = srcObjs.reduce((a, o) => a + (o.size || 0), 0);
  const dstKeys = new Set(dstObjs.map((o) => o.key));
  const collisions = srcObjs.filter((o) => dstKeys.has(o.key));

  console.log(`\nSOURCE:      ${srcObjs.length} objects, ${fmt(srcBytes)}`);
  console.log(`DEST (now):  ${dstObjs.length} objects`);
  console.log(`COLLISIONS:  ${collisions.length} source keys already exist in dest (would be OVERWRITTEN)`);
  if (collisions.length) {
    console.log("  e.g. " + collisions.slice(0, 8).map((o) => o.key).join(", "));
  }
  console.log("\nSample source keys:");
  for (const o of srcObjs.slice(0, 12)) console.log(`  ${o.key}  (${fmt(o.size || 0)})`);

  if (mode === "inventory") {
    console.log("\n[inventory only] No objects were written. Run with 'copy' to perform the sync.");
    return;
  }

  if (mode !== "copy") {
    console.error(`Unknown mode '${mode}'. Use 'inventory' or 'copy'.`);
    process.exit(1);
  }

  console.log(`\nCopying ${srcObjs.length} objects PROD -> STAGING...`);
  let done = 0, copiedBytes = 0, failed = 0;
  for (const o of srcObjs) {
    try {
      const got = await src.send(new GetObjectCommand({ Bucket: srcBucket, Key: o.key }));
      const body = await streamToBuffer(got.Body);
      await dst.send(
        new PutObjectCommand({
          Bucket: dstBucket,
          Key: o.key,
          Body: body,
          ContentType: got.ContentType,
          CacheControl: got.CacheControl,
          ContentDisposition: got.ContentDisposition,
        }),
      );
      done++;
      copiedBytes += body.length;
      if (done % 25 === 0 || done === srcObjs.length) {
        console.log(`  ${done}/${srcObjs.length}  (${fmt(copiedBytes)})`);
      }
    } catch (e) {
      failed++;
      console.error(`  FAIL ${o.key}: ${e.message}`);
    }
  }
  console.log(`\nDone. Copied ${done}/${srcObjs.length} (${fmt(copiedBytes)}), ${failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
