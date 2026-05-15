'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GripVertical, Download, CheckCircle } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { ProgressBar, Spinner } from '@/components/ProgressBar';
import { PDFDocument } from 'pdf-lib';

interface PageItem { index: number; label: string; }

export default function ReorderPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ downloadUrl: string } | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setPages([]);
    setResult(null);
    if (!newFiles[0]) return;
    setIsLoading(true);
    try {
      const bytes = await newFiles[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, label: `Page ${i + 1}` })));
    } catch { toast.error('Could not read PDF page count'); }
    finally { setIsLoading(false); }
  };

  const handleProcess = async () => {
    if (!files[0] || !pages.length) return;
    setIsProcessing(true); setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 400);
    try {
      const fd = new FormData();
      fd.append('file', files[0]);
      fd.append('order', JSON.stringify(pages.map(p => p.index)));
      const { data } = await axios.post(`${apiUrl}/api/pdf/reorder`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearInterval(interval); setProgress(100);
      setResult(data.data);
      toast.success('Pages reordered!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || 'Reorder failed');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-3xl shadow-xl">📋</div>
        <h1 className="font-display text-3xl font-bold">Reorder PDF Pages</h1>
        <p className="mt-2 text-muted-foreground">Drag pages to rearrange, then download</p>
      </div>

      <div className="rounded-2xl border border bg-card p-6 space-y-6">
        <FileUploader accept={{ 'application/pdf': ['.pdf'] }} onFilesChange={handleFilesChange} />

        {isLoading && <div className="flex justify-center py-4"><Spinner /></div>}

        {pages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Drag to reorder ({pages.length} pages)</p>
            <Reorder.Group axis="y" values={pages} onReorder={setPages} className="space-y-2">
              {pages.map(page => (
                <Reorder.Item key={page.index} value={page} className="flex items-center gap-3 rounded-xl border border bg-background px-4 py-3 cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{page.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">#{page.index + 1}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        <AnimatePresence>
          {isProcessing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ProgressBar progress={progress} label="Reordering pages…" /></motion.div>}
        </AnimatePresence>

        <button onClick={handleProcess} disabled={isProcessing || !pages.length}
          className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {isProcessing ? <><Spinner size="sm" /> Processing…</> : <>📋 Apply New Order</>}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
            <div className="flex items-center gap-3 mb-4"><CheckCircle className="h-6 w-6 text-green-500" /><h3 className="font-semibold">Done! PDF ready</h3></div>
            <a href={result.downloadUrl} download target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors">
              <Download className="h-4 w-4" /> Download Reordered PDF
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
