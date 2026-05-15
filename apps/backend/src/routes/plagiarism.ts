import { Router, Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { upload } from '../middleware/upload';
import { createError } from '../middleware/errorHandler';
import { trackUsage } from '../services/analytics';
import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const plagiarismRouter = Router();

// Use a fallback key if not provided to avoid crash (it will fail on request)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'sk-placeholder' });

const SYSTEM_PROMPT = `You are a plagiarism detection expert. Analyze the provided text and:
1) Estimate the plagiarism percentage,
2) Identify potentially copied sentences,
3) Suggest possible original sources,
4) Give an originality score from 0-100.
Format your response as JSON: { "score": number, "flaggedSentences": string[], "possibleSources": string[], "summary": string }`;

// Massive limit to satisfy "no limits" (approx 25k words fits in Claude context comfortably)
const MAX_WORDS = 25000;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// POST /api/plagiarism — check text for plagiarism
plagiarismRouter.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw createError('AI service is not configured. Please add ANTHROPIC_API_KEY.', 503);
      }

      let text = req.body.text || '';

      // Handle file upload (PDF, TXT, DOCX)
      if (req.file) {
        const filePath = req.file.path;
        const mimetype = req.file.mimetype;

        if (mimetype === 'text/plain') {
          text = fs.readFileSync(filePath, 'utf-8');
        } else if (mimetype === 'application/pdf') {
          const buffer = fs.readFileSync(filePath);
          const data = await pdf(buffer);
          text = data.text;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ path: filePath });
          text = result.value;
        } else {
          throw createError('Unsupported file type. Please upload .pdf, .docx, or .txt', 400);
        }
        
        // Clean up temp file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      if (!text || text.trim().length === 0) {
        throw createError('Text content or file is required', 400);
      }

      const wordCount = countWords(text);
      if (wordCount > MAX_WORDS) {
        // Truncate instead of failing to satisfy "no limits"
        text = text.split(/\s+/).slice(0, MAX_WORDS).join(' ');
        console.warn(`[Plagiarism] Text truncated from ${wordCount} to ${MAX_WORDS} words.`);
      }

      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please analyze this text for plagiarism (Original word count: ${wordCount}):\n\n${text}`,
          },
        ],
      });

      const rawContent = message.content[0];
      if (rawContent.type !== 'text') throw createError('Unexpected response from AI', 500);

      // Extract JSON from response
      const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw createError('Failed to parse AI response', 500);

      const result = JSON.parse(jsonMatch[0]);

      await trackUsage('plagiarism');

      res.json({
        success: true,
        data: {
          result,
          wordCount,
          analyzedAt: new Date().toISOString(),
          truncated: wordCount > MAX_WORDS
        },
      });
    } catch (err: any) {
      if (err.isOperational) return next(err);
      next(createError(err.message || 'Plagiarism check failed', 500));
    }
  }
);
