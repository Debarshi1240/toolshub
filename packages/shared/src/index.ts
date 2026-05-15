export * from './types';

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Format bytes to human-readable string */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Generate a UUID v4 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Get expiry timestamp (default 1 hour) */
export function getExpiryTimestamp(hoursFromNow = 1): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursFromNow);
  return expiry.toISOString();
}

/** Validate URL */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Count words in a string */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Supported video platforms */
export const SUPPORTED_PLATFORMS = ['youtube.com', 'youtu.be', 'instagram.com', 'twitter.com', 'x.com'];

export function isSupportedUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return SUPPORTED_PLATFORMS.some((p) => hostname.includes(p));
  } catch {
    return false;
  }
}

/** PDF tool metadata */
export const PDF_TOOLS = [
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: '🔗', color: 'from-red-500 to-orange-500' },
  { id: 'split-pdf', title: 'Split PDF', description: 'Extract pages or split by range', icon: '✂️', color: 'from-orange-500 to-yellow-500' },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce file size', icon: '🗜️', color: 'from-yellow-500 to-green-500' },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF to .docx', icon: '📝', color: 'from-blue-500 to-indigo-500' },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert .docx to PDF', icon: '📄', color: 'from-indigo-500 to-purple-500' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Extract pages as images', icon: '🖼️', color: 'from-purple-500 to-pink-500' },
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Images to PDF', icon: '📸', color: 'from-pink-500 to-red-500' },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate pages', icon: '🔄', color: 'from-teal-500 to-cyan-500' },
  { id: 'watermark-pdf', title: 'Add Watermark', description: 'Text/image watermark', icon: '💧', color: 'from-cyan-500 to-blue-500' },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Add password protection', icon: '🔒', color: 'from-green-500 to-teal-500' },
  { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Remove password', icon: '🔓', color: 'from-amber-500 to-orange-500' },
  { id: 'reorder-pdf', title: 'Reorder Pages', description: 'Drag to reorder pages', icon: '📋', color: 'from-violet-500 to-purple-500' },
] as const;
