import { Metadata } from 'next';
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
}> = {
  'merge-pdf':    { multiple: true, maxFiles: 20, hint: 'Upload multiple PDFs to merge' },
  'split-pdf':    {},
  'compress-pdf': { multiple: true, maxFiles: 20, hint: 'Upload one or multiple PDFs to compress' },
  'pdf-to-word':  {},
  'word-to-pdf':  { accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }, hint: 'Upload a .docx or .doc file' },
  'pdf-to-jpg':   {},
  'jpg-to-pdf':   { accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }, multiple: true, maxFiles: 20, hint: 'Upload images to convert to PDF' },
  'rotate-pdf':   {},
  'watermark-pdf':{ },
  'protect-pdf':  {},
  'unlock-pdf':   {},
  'reorder-pdf':  {},
  'compress-all': { multiple: true, maxFiles: 20, hint: 'Upload multiple PDFs to compress' },
  'create-zip':   { multiple: true, maxFiles: 50, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, hint: 'Upload files to create a ZIP archive' },
};

export async function generateStaticParams() {
  return PDF_TOOLS.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = PDF_TOOLS.find((t) => t.id === params.tool);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.description,
  };
}

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
