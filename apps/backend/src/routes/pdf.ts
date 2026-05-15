import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { uploadMultiple, upload } from '../middleware/upload';
import { createError } from '../middleware/errorHandler';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storage';
import { trackUsage } from '../services/analytics';
import { saveJob } from '../services/jobs';

export const pdfRouter = Router();

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many PDF requests. Please slow down.' },
});

pdfRouter.use(pdfLimiter);

// ─── Merge PDF ────────────────────────────────────────────────────────────────
pdfRouter.post('/merge', uploadMultiple.array('files', 20), async (req, res, next) => {
  await handlePdfTool('merge-pdf', req, res, next, async (files) => {
    return pdfService.mergePdfs(files.map((f) => f.path));
  });
});

// ─── Split PDF ────────────────────────────────────────────────────────────────
pdfRouter.post('/split', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('split-pdf', req, res, next, async (files) => {
    const { ranges } = req.body;
    return pdfService.splitPdf(files[0].path, ranges ? JSON.parse(ranges) : undefined);
  });
});

// ─── Compress PDF ─────────────────────────────────────────────────────────────
pdfRouter.post('/compress', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('compress-pdf', req, res, next, async (files) => {
    return pdfService.compressPdf(files[0].path);
  });
});

// ─── PDF to Word ──────────────────────────────────────────────────────────────
pdfRouter.post('/pdf-to-word', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('pdf-to-word', req, res, next, async (files) => {
    return pdfService.pdfToWord(files[0].path);
  });
});

// ─── Word to PDF ──────────────────────────────────────────────────────────────
pdfRouter.post('/word-to-pdf', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('word-to-pdf', req, res, next, async (files) => {
    return pdfService.wordToPdf(files[0].path);
  });
});

// ─── PDF to JPG ───────────────────────────────────────────────────────────────
pdfRouter.post('/pdf-to-jpg', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('pdf-to-jpg', req, res, next, async (files) => {
    return pdfService.pdfToJpg(files[0].path);
  });
});

// ─── JPG to PDF ───────────────────────────────────────────────────────────────
pdfRouter.post('/jpg-to-pdf', uploadMultiple.array('files', 20), async (req, res, next) => {
  await handlePdfTool('jpg-to-pdf', req, res, next, async (files) => {
    return pdfService.jpgToPdf(files.map((f) => f.path));
  });
});

// ─── Rotate PDF ───────────────────────────────────────────────────────────────
pdfRouter.post('/rotate', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('rotate-pdf', req, res, next, async (files) => {
    const degrees = parseInt(req.body.degrees || '90');
    const pages = req.body.pages ? JSON.parse(req.body.pages) : undefined;
    return pdfService.rotatePdf(files[0].path, degrees, pages);
  });
});

// ─── Watermark PDF ────────────────────────────────────────────────────────────
pdfRouter.post('/watermark', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('watermark-pdf', req, res, next, async (files) => {
    const { text, opacity, color, fontSize } = req.body;
    return pdfService.addWatermark(files[0].path, {
      text: text || 'CONFIDENTIAL',
      opacity: parseFloat(opacity || '0.3'),
      color: color || '#FF0000',
      fontSize: parseInt(fontSize || '48'),
    });
  });
});

// ─── Protect PDF ──────────────────────────────────────────────────────────────
pdfRouter.post('/protect', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('protect-pdf', req, res, next, async (files) => {
    const { password } = req.body;
    if (!password) throw createError('Password is required', 400);
    return pdfService.protectPdf(files[0].path, password);
  });
});

// ─── Unlock PDF ───────────────────────────────────────────────────────────────
pdfRouter.post('/unlock', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('unlock-pdf', req, res, next, async (files) => {
    const { password } = req.body;
    return pdfService.unlockPdf(files[0].path, password);
  });
});

// ─── Reorder PDF ──────────────────────────────────────────────────────────────
pdfRouter.post('/reorder', upload.single('file'), async (req, res, next) => {
  await handlePdfTool('reorder-pdf', req, res, next, async (files) => {
    const { order } = req.body;
    if (!order) throw createError('Page order is required', 400);
    return pdfService.reorderPages(files[0].path, JSON.parse(order));
  });
});

// ─── Helper: unified PDF tool handler ────────────────────────────────────────
async function handlePdfTool(
  toolName: string,
  req: Request,
  res: Response,
  next: NextFunction,
  processor: (files: Express.Multer.File[]) => Promise<string | string[]>
) {
  const files = req.file ? [req.file] : (req.files as Express.Multer.File[]) || [];
  try {
    if (!files.length) throw createError('No file(s) uploaded', 400);

    const outputPath = await processor(files);
    const outputPaths = Array.isArray(outputPath) ? outputPath : [outputPath];

    // Upload to R2 and get presigned URLs
    const uploadResults = await Promise.all(
      outputPaths.map((p) => storageService.uploadFile(p))
    );

    // Save job to DB
    const job = await saveJob({
      type: toolName as any,
      status: 'completed',
      file_url: uploadResults[0].publicUrl,
    });

    await trackUsage(toolName);

    res.json({
      success: true,
      data: {
        jobId: job.id,
        downloadUrls: uploadResults.map((r) => r.publicUrl),
        downloadUrl: uploadResults[0].publicUrl,
        expiresAt: job.expires_at,
        fileCount: outputPaths.length,
      },
    });
  } catch (err: any) {
    if (err.isOperational) return next(err);
    next(createError(err.message || `${toolName} failed`, 500));
  } finally {
    // Clean up uploaded input files
    files.forEach((f) => {
      try { require('fs').unlinkSync(f.path); } catch {}
    });
  }
}
