// ─── Job & Analytics Types ───────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobType =
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'rotate-pdf'
  | 'watermark-pdf'
  | 'protect-pdf'
  | 'unlock-pdf'
  | 'reorder-pdf'
  | 'download'
  | 'plagiarism';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  created_at: string;
  expires_at: string;
  file_url?: string;
  error?: string;
}

export interface AnalyticsRecord {
  tool_name: string;
  usage_count: number;
  date: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PdfToolRequest {
  tool: JobType;
  options?: Record<string, unknown>;
}

export interface PdfToolResponse {
  jobId: string;
  downloadUrl: string;
  expiresAt: string;
}

// ─── Media Downloader Types ───────────────────────────────────────────────────

export type VideoQuality = '360p' | '720p' | '1080p' | 'audio';
export type VideoFormat = 'mp4' | 'mp3';

export interface DownloadRequest {
  url: string;
  quality: VideoQuality;
  format: VideoFormat;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  availableFormats: VideoQuality[];
}

export interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

// ─── Plagiarism Checker Types ────────────────────────────────────────────────

export interface PlagiarismRequest {
  text: string;
}

export interface PlagiarismResult {
  score: number;
  flaggedSentences: string[];
  possibleSources: string[];
  summary: string;
}

export interface PlagiarismResponse {
  jobId: string;
  result: PlagiarismResult;
}

// ─── Tool Card Types (Frontend) ───────────────────────────────────────────────

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  category: 'pdf' | 'media' | 'ai';
  color: string;
}
