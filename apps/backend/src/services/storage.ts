import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 only if keys are present
const isR2Configured = !!(
  process.env.CLOUDFLARE_R2_ENDPOINT &&
  process.env.CLOUDFLARE_R2_ACCESS_KEY &&
  process.env.CLOUDFLARE_R2_SECRET_KEY
);

let s3: S3Client | null = null;
if (isR2Configured) {
  s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
    },
  });
}

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
  const ext = path.extname(filePath).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (s3 && isR2Configured) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      // Clean up local temp file after upload
      try { fs.unlinkSync(filePath); } catch {}

      const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `${process.env.CLOUDFLARE_R2_ENDPOINT}/${BUCKET}/${key}`;
      return { key, publicUrl, presignedUrl: publicUrl };
    } catch (err) {
      console.warn('[STORAGE] R2 upload failed, falling back to local:', err);
    }
  }

  // Fallback: local serving
  // We don't delete the file, we just return a URL that the server can serve
  // The server has app.use('/files', express.static(TEMP_DIR))
  const port = process.env.PORT || 4000;
  const localUrl = `http://localhost:${port}/files/${path.basename(filePath)}`;
  
  return { 
    key: `local/${path.basename(filePath)}`, 
    publicUrl: localUrl, 
    presignedUrl: localUrl 
  };
}

async function deleteFile(key: string): Promise<void> {
  if (s3 && isR2Configured && key.startsWith('outputs/')) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch (err) {
      console.error('[STORAGE] Delete failed:', err);
    }
  }
}

export const storageService = { uploadFile, deleteFile };
