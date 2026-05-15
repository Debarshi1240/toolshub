import fs from 'fs';
import path from 'path';
import { getExpiredJobs, deleteJob } from './jobs';
import { storageService } from './storage';

const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '1');

export async function cleanupExpiredFiles(): Promise<void> {
  const cutoff = Date.now() - EXPIRY_HOURS * 60 * 60 * 1000;

  // Clean local temp files
  for (const dir of [TEMP_DIR, UPLOAD_DIR]) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          console.log(`[Cleanup] Deleted local file: ${file}`);
        }
      } catch {}
    }
  }

  // Clean R2 files for expired jobs
  const expiredJobs = await getExpiredJobs();
  for (const job of expiredJobs) {
    if (job.file_url) {
      const key = job.file_url.split('/').slice(-2).join('/');
      try {
        await storageService.deleteFile(key);
        console.log(`[Cleanup] Deleted R2 file for job ${job.id}`);
      } catch {}
    }
    await deleteJob(job.id);
  }

  console.log(`[Cleanup] Done. Processed ${expiredJobs.length} expired jobs.`);
}
