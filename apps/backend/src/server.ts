import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';

import { pdfRouter } from './routes/pdf';
import { downloadRouter } from './routes/download';
import { plagiarismRouter } from './routes/plagiarism';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { cleanupExpiredFiles } from './services/cleanup';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Ensure temp dirs exist ───────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const TEMP_DIR = path.join(__dirname, '..', 'temp');
[UPLOAD_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    // In production, check env var
    const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim());
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Global Rate Limit ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static files (processed outputs) ────────────────────────────────────────
app.use('/files', express.static(TEMP_DIR));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/download', downloadRouter);
app.use('/api/plagiarism', plagiarismRouter);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Cron: Clean up expired files every 30 minutes ───────────────────────────
cron.schedule('*/30 * * * *', () => {
  console.log('[CRON] Running file cleanup...');
  cleanupExpiredFiles();
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ ToolsHub API running on http://localhost:${PORT}`);
});

export default app;
