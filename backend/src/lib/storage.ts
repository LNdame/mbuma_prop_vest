import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * S3-compatible storage client.
 * Works with: AWS S3, Cloudflare R2, MinIO (Railway), Backblaze B2.
 *
 * Required env vars:
 *   STORAGE_ENDPOINT    – e.g. https://<accountid>.r2.cloudflarestorage.com  (omit for AWS)
 *   STORAGE_REGION      – e.g. auto (R2) | us-east-1 (AWS)
 *   STORAGE_ACCESS_KEY  – access key / key ID
 *   STORAGE_SECRET_KEY  – secret key
 *   STORAGE_BUCKET      – bucket name
 *   STORAGE_PUBLIC_URL  – public base URL, e.g. https://assets.mbumapropvest.co.za
 */

export function getS3Client(): S3Client {
  return new S3Client({
    region:   process.env.STORAGE_REGION ?? 'auto',
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId:     process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
    forcePathStyle: !!process.env.STORAGE_ENDPOINT, // required for MinIO / R2
  });
}

export const BUCKET = process.env.STORAGE_BUCKET ?? 'mbuma-propvest';

export function publicUrl(s3Key: string): string {
  const base = (process.env.STORAGE_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/${s3Key}`;
}

/**
 * Generate a presigned GET URL for reading a private object.
 * The Railway/Tigris bucket does not allow anonymous public reads, so every
 * image must be served through a short-lived signed URL re-issued on read.
 */
export async function presignDownload(s3Key: string, expiresIn = 60 * 60 * 24): Promise<string> {
  const client = getS3Client();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }), { expiresIn });
}

/** Generate a presigned POST — browser uploads directly, no proxy through server */
export async function presignUpload(s3Key: string, mimeType: string, maxSizeBytes = 10 * 1024 * 1024) {
  const client = getS3Client();
  const { url, fields } = await createPresignedPost(client, {
    Bucket: BUCKET,
    Key:    s3Key,
    Conditions: [
      ['content-length-range', 0, maxSizeBytes],
      ['eq', '$Content-Type', mimeType],
    ],
    Fields: { 'Content-Type': mimeType },
    Expires: 120, // 2 minutes
  });
  return { url, fields };
}

/** Delete an object from the bucket */
export async function deleteObject(s3Key: string): Promise<void> {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
}
