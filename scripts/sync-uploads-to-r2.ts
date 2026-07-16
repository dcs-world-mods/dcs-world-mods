/**
 * One-time sync of the local ./uploads directory to S3-compatible storage
 * (Cloudflare R2). Run after setting the S3_* environment variables:
 *
 *   npm run sync-uploads
 */
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
};

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    if ((await stat(full)).isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function main() {
  const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    console.error("Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY first (see DEPLOY.md).");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });

  const root = path.join(process.cwd(), "uploads");
  let count = 0;
  for await (const file of walk(root)) {
    const key = path.relative(root, file).split(path.sep).join("/");
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: await readFile(file),
        ContentType: CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      })
    );
    console.log(`uploaded ${key}`);
    count++;
  }
  console.log(`Done — ${count} files synced to ${S3_BUCKET}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
