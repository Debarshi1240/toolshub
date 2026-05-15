import { Router, Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import axios from 'axios';
import { createError } from '../middleware/errorHandler';

export const downloadRouter = Router();

const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.ip || 'unknown',
  message: { success: false, error: 'Download limit reached: 5 downloads per hour per IP.' },
});

// POST /api/download/info — get video info before downloading
downloadRouter.post('/info', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    if (!url) throw createError('URL is required', 400);

    const serviceUrl = process.env.DOWNLOADER_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${serviceUrl}/info`, { url }, { timeout: 30000 });

    res.json({ success: true, data: response.data });
  } catch (err: any) {
    if (err.isOperational) return next(err);
    next(createError(err.response?.data?.error || 'Failed to fetch video info', 502));
  }
});

// POST /api/download — proxy to Python downloader microservice
downloadRouter.post('/', downloadLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, quality, format } = req.body;
    if (!url) throw createError('URL is required', 400);
    if (!quality) throw createError('Quality is required', 400);
    if (!format) throw createError('Format is required', 400);

    const serviceUrl = process.env.DOWNLOADER_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(
      `${serviceUrl}/download`,
      { url, quality, format },
      { timeout: 120000 }
    );

    res.json({ success: true, data: response.data });
  } catch (err: any) {
    if (err.isOperational) return next(err);
    next(createError(err.response?.data?.error || 'Download failed', 502));
  }
});
