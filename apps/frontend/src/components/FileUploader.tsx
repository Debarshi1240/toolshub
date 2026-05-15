'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '@toolshub/shared';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  label?: string;
  hint?: string;
}

export function FileUploader({ accept, multiple = false, maxFiles = 1, onFilesChange, label, hint }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = multiple ? [...files, ...acceptedFiles].slice(0, maxFiles) : acceptedFiles.slice(0, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, multiple, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-brand-400" />;
    return <File className="h-5 w-5 text-brand-400" />;
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${isDragActive ? 'bg-brand-500/20 scale-110' : 'bg-brand-500/10'}`}>
          <Upload className={`h-7 w-7 transition-colors ${isDragActive ? 'text-brand-400' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {isDragActive ? 'Drop files here…' : (label || 'Drag & drop files here')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hint || `or click to browse${multiple ? ` (max ${maxFiles} files)` : ''}`}
          </p>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {files.map((file, i) => (
              <motion.li
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
