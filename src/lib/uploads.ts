import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_MOD_FILE_EXTENSIONS,
  MAX_IMAGE_BYTES,
  MAX_MOD_FILE_BYTES,
} from "./constants";

// ---------------------------------------------------------------------------
// Storage backends
//
// Local (default): files are written to ./uploads and served by
//   /api/files/[...path]. Good for development and VPS deployments.
//
// S3-compatible cloud storage (Cloudflare R2, AWS S3, ...): enabled when the
// following environment variables are set. Required for serverless hosts
// like Vercel, where the local filesystem is ephemeral.
//   S3_ENDPOINT     e.g. https://<account-id>.r2.cloudflarestorage.com
//   S3_BUCKET       bucket name, e.g. dcs-world-mods
//   S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
//   S3_PUBLIC_URL   public base URL, e.g. https://pub-xxxx.r2.dev
// ---------------------------------------------------------------------------

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function s3Config() {
  const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL } =
    process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_PUBLIC_URL) {
    return null;
  }
  return {
    bucket: S3_BUCKET,
    publicUrl: S3_PUBLIC_URL.replace(/\/$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    }),
  };
}

export class UploadError extends Error {}

function randomName(original: string): string {
  const ext = path.extname(original).toLowerCase();
  return `${crypto.randomBytes(12).toString("hex")}${ext}`;
}

async function save(
  subdir: string,
  name: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const s3 = s3Config();
  if (s3) {
    const key = `${subdir}/${name}`;
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );
    return `${s3.publicUrl}/${key}`;
  }

  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return `/api/files/${subdir}/${name}`;
}

/** Validates and stores an image; returns the public URL. */
export async function saveImage(file: File, subdir: "avatars" | "mods"): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadError("Image must be PNG, JPEG or WebP");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadError("Image must be under 5 MB");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return save(subdir, randomName(file.name || "image.png"), buffer, file.type);
}

const ARCHIVE_CONTENT_TYPES: Record<string, string> = {
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
};

/** Validates and stores a mod archive; returns the public URL. */
export async function saveModFile(file: File): Promise<string> {
  const ext = path.extname(file.name || "").toLowerCase();
  if (!ALLOWED_MOD_FILE_EXTENSIONS.includes(ext)) {
    throw new UploadError("Mod file must be a .zip, .rar or .7z archive");
  }
  if (file.size > MAX_MOD_FILE_BYTES) {
    throw new UploadError("Mod file must be under 500 MB");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return save(
    "files",
    randomName(file.name),
    buffer,
    ARCHIVE_CONTENT_TYPES[ext] ?? "application/octet-stream"
  );
}

/** Resolve a stored file path safely (prevents path traversal). Local backend only. */
export function resolveUploadPath(segments: string[]): string | null {
  const resolved = path.resolve(UPLOAD_ROOT, ...segments);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT) + path.sep)) return null;
  return resolved;
}
