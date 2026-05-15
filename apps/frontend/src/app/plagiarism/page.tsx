'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Upload, AlertCircle, Download, FileText } from 'lucide-react';
import { ProgressBar, Spinner } from '@/components/ProgressBar';
import type { PlagiarismResult } from '@toolshub/shared';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Original' : score >= 40 ? 'Partially Original' : 'High Plagiarism Risk';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={color} strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Originality Score</p>
      </div>
    </div>
  );
}

export default function PlagiarismPage() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setFile(null);
    setWordCount(countWords(e.target.value));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setText(`File selected: ${selectedFile.name}`);
    setWordCount(0); // We'll get the count from the backend
  };

  const handleCheck = async () => {
    if (!text.trim() && !file) { toast.error('Please enter text or upload a file to check.'); return; }

    setIsChecking(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 5, 90));
    }, 800);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }
      
      const { data } = await axios.post(`${apiUrl}/api/plagiarism`, formData);
      clearInterval(interval);
      setProgress(100);
      setResult(data.data.result);
      setWordCount(data.data.wordCount);
      toast.success('Analysis complete!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText('Plagiarism Analysis Report', { x: 50, y: height - 50, size: 24, font: boldFont, color: rgb(0.48, 0.22, 0.92) });
      page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 50, y: height - 80, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

      const scoreColor = result.score >= 70 ? rgb(0.13, 0.77, 0.36) : result.score >= 40 ? rgb(0.96, 0.62, 0.04) : rgb(0.93, 0.26, 0.26);
      page.drawText('Originality Score:', { x: 50, y: height - 130, size: 14, font: boldFont });
      page.drawText(`${result.score}%`, { x: 180, y: height - 130, size: 18, font: boldFont, color: scoreColor });

      page.drawText('Summary:', { x: 50, y: height - 170, size: 14, font: boldFont });
      const summaryLines = result.summary.match(/.{1,80}/g) || [];
      summaryLines.forEach((line, i) => {
        page.drawText(line, { x: 50, y: height - 190 - (i * 15), size: 10, font });
      });

      let y = height - 230 - (summaryLines.length * 15);
      page.drawText('Flagged Sentences:', { x: 50, y, size: 14, font: boldFont });
      y -= 20;
      result.flaggedSentences.slice(0, 10).forEach((s, i) => {
        const snippet = s.length > 90 ? s.substring(0, 87) + '...' : s;
        page.drawText(`• ${snippet}`, { x: 50, y: y - (i * 15), size: 9, font, color: rgb(0.8, 0.3, 0.3) });
      });

      page.drawText('Generated by ToolsHub — toolshub.dev', { x: 50, y: 30, size: 10, font, color: rgb(0.7, 0.7, 0.7) });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `plagiarism-report-${Date.now()}.pdf`;
      link.click();
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  const highlightFlagged = (inputText: string, flagged: string[]) => {
    if (!flagged.length) return inputText;
    let highlighted = inputText;
    flagged.forEach((sentence) => {
      highlighted = highlighted.replace(
        sentence,
        `<mark class="bg-red-400/20 text-red-300 rounded px-0.5">${sentence}</mark>`
      );
    });
    return highlighted;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-3xl shadow-xl">🤖</div>
        <h1 className="font-display text-3xl font-bold">AI Plagiarism Checker</h1>
        <p className="mt-2 text-muted-foreground">Upload PDF, DOCX, or Paste Text — Unlimited words, free forever.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-brand-400" /> Input Content</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {file ? file.name : `${wordCount.toLocaleString()} words detected`}
                </span>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Upload className="h-3 w-3" /> Upload PDF / DOCX
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            <textarea
              id="plagiarism-text-input"
              value={text}
              onChange={handleTextChange}
              placeholder="Paste your text here or upload a document above..."
              rows={14}
              disabled={!!file}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-60"
            />

            {isChecking && <ProgressBar progress={progress} label="Deep Analysis with Claude AI (this may take a minute for large files)…" color="from-violet-500 to-purple-600" />}

            <button
              id="check-plagiarism-btn"
              onClick={handleCheck}
              disabled={isChecking || (!text.trim() && !file)}
              className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #7c3aed, #9333ea)' }}
            >
              {isChecking ? <><Spinner size="sm" /> Analyzing…</> : <><Brain className="h-4 w-4" /> Check Plagiarism</>}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border bg-card/50 p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-2xl border-2 border-dashed flex items-center justify-center">
                  <Brain className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Upload a document to see the originality report</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="rounded-2xl border bg-card p-6 flex justify-center">
                  <ScoreGauge score={result.score} />
                </div>

                <div className="rounded-2xl border bg-card p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-2">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>

                {result.flaggedSentences.length > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                    <h3 className="font-semibold text-sm text-red-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> {result.flaggedSentences.length} Flagged Matches
                    </h3>
                    <ul className="space-y-2">
                      {result.flaggedSentences.slice(0, 5).map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground border-l-2 border-red-500/40 pl-3 italic">"{s.substring(0, 100)}{s.length > 100 ? '…' : ''}"</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.possibleSources.length > 0 && (
                  <div className="rounded-2xl border bg-card p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">Sources Found</h3>
                    <ul className="space-y-1">
                      {result.possibleSources.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleDownloadReport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4 text-brand-400" /> Download Analysis Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {result && !file && result.flaggedSentences.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Detailed Text Comparison
              <span className="text-xs font-normal text-muted-foreground ml-1">(red = likely plagiarized)</span>
            </h3>
            <div
              className="text-sm text-muted-foreground leading-relaxed max-h-64 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: highlightFlagged(text, result.flaggedSentences) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
