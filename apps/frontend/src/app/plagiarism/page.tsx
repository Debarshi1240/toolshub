'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Upload, AlertCircle, Download, FileText } from 'lucide-react';
import { ProgressBar, Spinner } from '@/components/ProgressBar';
import type { PlagiarismResult } from '@toolshub/shared';

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
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_WORDS = 5000;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setWordCount(countWords(e.target.value));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setWordCount(countWords(content));
    };
    reader.readAsText(file);
  };

  const handleCheck = async () => {
    if (!text.trim()) { toast.error('Please enter or paste text to check.'); return; }
    if (wordCount > MAX_WORDS) { toast.error(`Text exceeds ${MAX_WORDS} word limit.`); return; }

    setIsChecking(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 80));
    }, 500);

    try {
      const formData = new FormData();
      formData.append('text', text);
      const { data } = await axios.post(`${apiUrl}/api/plagiarism`, formData);
      clearInterval(interval);
      setProgress(100);
      setResult(data.data.result);
      toast.success('Analysis complete!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsChecking(false);
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
      {/* Header */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-3xl shadow-xl">🤖</div>
        <h1 className="font-display text-3xl font-bold">AI Plagiarism Checker</h1>
        <p className="mt-2 text-muted-foreground">Powered by Claude AI — get instant originality analysis with sentence-level flagging</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-brand-400" /> Input Text</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${wordCount > MAX_WORDS ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
                </span>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Upload className="h-3 w-3" /> Upload .txt
                </button>
                <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            <textarea
              id="plagiarism-text-input"
              value={text}
              onChange={handleTextChange}
              placeholder="Paste your text here (up to 5,000 words)…"
              rows={14}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />

            {wordCount > MAX_WORDS && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                Text exceeds 5,000 word limit for free plan.
              </div>
            )}

            {isChecking && <ProgressBar progress={progress} label="Analyzing with Claude AI…" color="from-violet-500 to-purple-600" />}

            <button
              id="check-plagiarism-btn"
              onClick={handleCheck}
              disabled={isChecking || !text.trim() || wordCount > MAX_WORDS}
              className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #7c3aed, #9333ea)' }}
            >
              {isChecking ? <><Spinner size="sm" /> Analyzing…</> : <><Brain className="h-4 w-4" /> Check Plagiarism</>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card/50 p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                  <Brain className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Results will appear here after analysis</p>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Score Gauge */}
                <div className="rounded-2xl border border-border bg-card p-6 flex justify-center">
                  <ScoreGauge score={result.score} />
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>

                {/* Flagged Sentences */}
                {result.flaggedSentences.length > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                    <h3 className="font-semibold text-sm text-red-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> {result.flaggedSentences.length} Flagged Sentences
                    </h3>
                    <ul className="space-y-2">
                      {result.flaggedSentences.slice(0, 5).map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground border-l-2 border-red-500/40 pl-3 italic">"{s.substring(0, 100)}{s.length > 100 ? '…' : ''}"</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Possible Sources */}
                {result.possibleSources.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-2">Possible Sources</h3>
                    <ul className="space-y-1">
                      {result.possibleSources.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Highlighted text */}
      <AnimatePresence>
        {result && result.flaggedSentences.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Highlighted Text
              <span className="text-xs font-normal text-muted-foreground ml-1">(red = flagged)</span>
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
