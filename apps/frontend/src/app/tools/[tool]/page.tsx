'use client';
 
import { PdfToolPage } from '@/components/PdfToolPage';
import { PDF_TOOLS } from '@toolshub/shared';
import { notFound } from 'next/navigation';

interface Props {
  params: { tool: string };
}

const TOOL_CONFIG: Record<string, {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  hint?: string;
  extraFields?: (state: Record<string, string>, update: (k: string, v: string) => void) => React.ReactNode;
}> = {
  'merge-pdf':    { multiple: true, maxFiles: 20, hint: 'Upload multiple PDFs to merge' },
  'split-pdf':    {
    extraFields: (state, update) => (
      <div className="space-y-2">
        <label className="text-sm font-medium">Page Ranges:</label>
        <input 
          type="text" 
          placeholder="e.g. [[0,2], [3,5]]"
          value={state.ranges || ''}
          onChange={(e) => update('ranges', e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <p className="text-[10px] text-muted-foreground">JSON array of [start, end] indices (0-indexed)</p>
      </div>
    )
  },
  'compress-pdf': { multiple: true, maxFiles: 20, hint: 'Upload one or multiple PDFs to compress' },
  'pdf-to-word':  {},
  'word-to-pdf':  { accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }, hint: 'Upload a .docx or .doc file' },
  'pdf-to-jpg':   {},
  'jpg-to-pdf':   { accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }, multiple: true, maxFiles: 20, hint: 'Upload images to convert to PDF' },
  'rotate-pdf':   {
    extraFields: (state, update) => (
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Rotation:</label>
        <select 
          value={state.degrees || '90'} 
          onChange={(e) => update('degrees', e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="90">90° Right</option>
          <option value="180">180°</option>
          <option value="270">90° Left</option>
        </select>
      </div>
    )
  },
  'watermark-pdf':{
    extraFields: (state, update) => (
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Watermark Text:</label>
          <input 
            type="text" 
            placeholder="e.g. CONFIDENTIAL"
            value={state.text || ''}
            onChange={(e) => update('text', e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Opacity (0.1 - 1.0)</label>
            <input 
              type="number" step="0.1" min="0.1" max="1.0"
              value={state.opacity || '0.3'}
              onChange={(e) => update('opacity', e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Color</label>
            <input 
              type="color"
              value={state.color || '#FF0000'}
              onChange={(e) => update('color', e.target.value)}
              className="w-full h-9 rounded-lg border bg-background p-1 cursor-pointer"
            />
          </div>
        </div>
      </div>
    )
  },
  'protect-pdf':  {
    extraFields: (state, update) => (
      <div className="space-y-2">
        <label className="text-sm font-medium">Set Password:</label>
        <input 
          type="password" 
          placeholder="Enter password..."
          value={state.password || ''}
          onChange={(e) => update('password', e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
    )
  },
  'unlock-pdf':   {
    extraFields: (state, update) => (
      <div className="space-y-2">
        <label className="text-sm font-medium">Password (if encrypted):</label>
        <input 
          type="password" 
          placeholder="Enter password..."
          value={state.password || ''}
          onChange={(e) => update('password', e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
    )
  },
  'reorder-pdf':  {
    extraFields: (state, update) => (
      <div className="space-y-2">
        <label className="text-sm font-medium">New Page Order:</label>
        <input 
          type="text" 
          placeholder="e.g. [2, 0, 1]"
          value={state.order || ''}
          onChange={(e) => update('order', e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <p className="text-[10px] text-muted-foreground">JSON array of page indices (0-indexed)</p>
      </div>
    )
  },
  'compress-all': { multiple: true, maxFiles: 20, hint: 'Upload multiple PDFs to compress' },
  'create-zip':   { multiple: true, maxFiles: 50, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, hint: 'Upload files to create a ZIP archive' },
};



export default function ToolPage({ params }: Props) {
  const tool = PDF_TOOLS.find((t) => t.id === params.tool);
  if (!tool) notFound();

  const config = TOOL_CONFIG[tool.id] || {};

  return (
    <PdfToolPage
      toolId={tool.id}
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      gradient={tool.color}
      {...config}
    />
  );
}
