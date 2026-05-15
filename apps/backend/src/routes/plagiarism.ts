import { Router, Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { upload } from '../middleware/upload';
import { createError } from '../middleware/errorHandler';
import { trackUsage } from '../services/analytics';
import fs from 'fs';

export const plagiarismRouter = Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a plagiarism detection expert. Analyze the provided text and:
1) Estimate the plagiarism percentage,
2) Identify potentially copied sentences,
3) Suggest possible original sources,
4) Give an originality score from 0-100.
Format your response as JSON: { "score": number, "flaggedSentences": string[], "possibleSources": string[], "summary": string }`;

const MAX_WORDS = 5000;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// POST /api/plagiarism — check text for plagiarism
plagiarismRouter.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let text = req.body.text || '';

      // Handle file upload (txt or docx)
      if (req.file) {
        if (req.file.mimetype === 'text/plain') {
          text = fs.readFileSync(req.file.path, 'utf-8');
        } else {
          throw createError('Only .txt file uploads are supported directly. Paste text for .docx.', 400);
        }
        fs.unlinkSync(req.file.path);
      }

      if (!text || text.trim().length === 0) {
        throw createError('Text content is required', 400);
      }

      const wordCount = countWords(text);
      if (wordCount > MAX_WORDS) {
        throw createError(`Text exceeds ${MAX_WORDS} word limit (${wordCount} words submitted)`, 400);
      }

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please analyze this text for plagiarism:\n\n${text}`,
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
        },
      });
    } catch (err: any) {
      if (err.isOperational) return next(err);
      next(createError(err.message || 'Plagiarism check failed', 500));
    }
  }
);
