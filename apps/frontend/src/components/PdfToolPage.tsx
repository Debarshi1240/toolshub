'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, CheckCircle, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileUploader } from '@/components/FileUploader';
import { ProgressBar, Spinner } from '@/components/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfToolPageProps {
  toolId: string;
  title: string;
  description: string;
  icon: string;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  extraFields?: React.ReactNode;
  getFormData?: (files: File[], extraState: Record<string, string>) => FormData;
  hint?: string;
  gradient: string;
}

export function PdfToolPage({
  toolId, title, description, icon, accept, multiple = false,
  maxFiles = 1, extraFields, getFormData, hint, gradient,
}: PdfToolPageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extraState] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ downloadUrls: string[]; fileCount: number } | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleCreateZip = async () => {
    if (!result || !result.downloadUrls.length) return;
    setIsZipping(true);
    const toastId = toast.loading('Creating ZIP folder...');
    try {
      const zip = new JSZip();
      const promises = result.downloadUrls.map(async (url, i) => {
        const response = await fetch(url);
        const blob = await response.blob();
        let fileName = `file-${i + 1}`;
        try {
          const urlObj = new URL(url);
          const name = urlObj.pathname.split('/').pop();
          if (name && name.includes('.')) {
            fileName = name;
          } else {
            const ext = blob.type.split('/')[1]?.split('+')[0] || 'pdf';
            fileName += `.${ext.replace('jpeg', 'jpg').replace('plain', 'txt')}`;
          }
        } catch (e) { }
        zip.file(fileName, blob);
      });
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${toolId}-results.zip`);
      toast.success('ZIP folder created!', { id: toastId });
    } catch (err) {
      toast.error('Failed to create ZIP folder. CORS or network error.', { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const buildFormData = () => {
    const fd = getFormData ? getFormData(files, extraState) : new FormData();
    if (!getFormData) {
      if (multiple) files.forEach((f) => fd.append('files', f));
      else if (files[0]) fd.append('file', files[0]);
    }
    return fd;
  };

  const handleProcess = async () => {
    if (!files.length) { toast.error('Please upload at least one file.'); return; }
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 85));
    }, 400);

    try {
      const formData = buildFormData();
      const { data } = await axios.post(`${apiUrl}/api/pdf/${toolId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      clearInterval(interval);
      setProgress(100);
      setResult(data.data);
      toast.success('File processed successfully!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || 'Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-xl`}>
          {icon}
        </div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border border bg-card p-6 space-y-6">
        <FileUploader
          accept={accept || { 'application/pdf': ['.pdf'] }}
          multiple={multiple}
          maxFiles={maxFiles}
          onFilesChange={setFiles}
          hint={hint}
        />

        {extraFields}

        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressBar progress={progress} label="Processing…" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleProcess}
          disabled={isProcessing || !files.length}
          className="btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? (
            <><Spinner size="sm" /> Processing…</>
          ) : (
            <>{icon} {title}</>
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold text-foreground">
                Done! {result.fileCount > 1 ? `${result.fileCount} files ready` : 'File ready'}
              </h3>
            </div>
            <div className="space-y-2">
              {result.downloadUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {result.fileCount > 1 ? `Download file ${i + 1}` : 'Download Result'}
                </a>
              ))}
            </div>
            {result.fileCount > 1 && (
              <button
                onClick={handleCreateZip}
                disabled={isZipping}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm font-medium text-brand-400 hover:bg-brand-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isZipping ? <Spinner size="sm" /> : <Archive className="h-4 w-4" />}
                {isZipping ? 'Zipping Files...' : 'Create ZIP Folder'}
              </button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">⏱ Link expires in 1 hour</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="mt-8 rounded-2xl border border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Your files are processed securely and automatically deleted after 1 hour. We never store your data.
        </p>
      </div>
    </div>
  );
}
