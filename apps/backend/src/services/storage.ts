import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'toolshub-files';
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

interface UploadResult {
  key: string;
  publicUrl: string;
  presignedUrl: string;
}

async function uploadFile(filePath: string): Promise<UploadResult> {
  const fileName = `${uuidv4()}${path.extname(filePath)}`;
  const key = `outputs/${fileName}`;
  const fileBuffer = fs.readFileSync(filePath);
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: { 'uploaded-at': new Date().toISOString() },
    })
  );

  // Clean up local temp file
  try { fs.unlinkSync(filePath); } catch {}

  const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${BUCKET}/${key}`;
  const presignedUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  );

  return { key, publicUrl, presignedUrl };
}

async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export const storageService = { uploadFile, deleteFile };
