'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Play, Clock, User, AlertTriangle, Music, Video } from 'lucide-react';
import { ProgressBar, Spinner } from '@/components/ProgressBar';
import type { VideoInfo } from '@toolshub/shared';

const PLATFORMS = [
  { name: 'YouTube', icon: '▶️', color: 'text-red-400' },
  { name: 'Instagram', icon: '📸', color: 'text-pink-400' },
  { name: 'Twitter/X', icon: '🐦', color: 'text-sky-400' },
];

const QUALITIES = [
  { id: '360p', label: '360p SD', icon: <Video className="h-4 w-4" /> },
  { id: '720p', label: '720p HD', icon: <Video className="h-4 w-4" />, badge: 'Popular' },
  { id: '1080p', label: '1080p FHD', icon: <Video className="h-4 w-4" /> },
  { id: 'audio', label: 'Audio Only (MP3)', icon: <Music className="h-4 w-4" /> },
];

export default function DownloaderPage() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [quality, setQuality] = useState('720p');
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState<{ downloadUrl: string; fileName: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchInfo = async () => {
    if (!url.trim()) { toast.error('Please enter a URL'); return; }
    setIsFetching(true);
    setVideoInfo(null);
    setDownloadResult(null);
    try {
      const { data } = await axios.post(`${apiUrl}/api/download/info`, { url });
      setVideoInfo(data.data);
      toast.success('Video info loaded!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not fetch video info');
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((p) => Math.min(p + Math.random() * 8, 85));
    }, 600);
    try {
      const format = quality === 'audio' ? 'mp3' : 'mp4';
      const { data } = await axios.post(`${apiUrl}/api/download`, { url, quality, format });
      clearInterval(interval);
      setDownloadProgress(100);
      setDownloadResult(data.data);
      toast.success('Download ready!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.response?.data?.error || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl shadow-xl">⬇️</div>
        <h1 className="font-display text-3xl font-bold">Media Downloader</h1>
        <p className="mt-2 text-muted-foreground">Download videos and audio from YouTube, Instagram, and Twitter/X</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          {PLATFORMS.map((p) => (
            <span key={p.name} className={`flex items-center gap-1.5 text-sm font-medium ${p.color}`}>
              {p.icon} {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-amber-400">Legal Notice:</span> Only download content you own or have permission to download. Respect copyright laws. ToolsHub is not responsible for misuse.
        </p>
      </div>

      {/* URL Input */}
      <div className="rounded-2xl border border bg-card p-6 space-y-4">
        <div className="flex gap-3">
          <input
            id="video-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
            placeholder="Paste YouTube, Instagram, or Twitter URL…"
            className="flex-1 rounded-xl border border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          <button
            onClick={fetchInfo}
            disabled={isFetching || !url.trim()}
            className="btn-gradient px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* Video Info */}
        <AnimatePresence>
          {videoInfo && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex gap-4 rounded-xl border border bg-background/50 p-4">
                {videoInfo.thumbnail && (
                  <div className="relative h-20 w-32 overflow-hidden rounded-lg shrink-0">
                    <Image src={videoInfo.thumbnail} alt={videoInfo.title} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-8 w-8 text-white drop-shadow" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground line-clamp-2">{videoInfo.title}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{videoInfo.uploader}</span>
                    {videoInfo.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(videoInfo.duration)}</span>}
                  </div>
                </div>
              </div>

              {/* Quality selector */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Select Quality</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QUALITIES.filter((q) => !videoInfo.availableFormats || videoInfo.availableFormats.includes(q.id as any)).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuality(q.id)}
                      className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        quality === q.id
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border bg-card text-muted-foreground hover:border-brand-400/50'
                      }`}
                    >
                      {q.icon} {q.label}
                      {q.badge && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{q.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {isDownloading && <ProgressBar progress={downloadProgress} label="Downloading & processing…" color="from-emerald-500 to-teal-500" />}

              <button onClick={handleDownload} disabled={isDownloading} className="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed">
                {isDownloading ? <><Spinner size="sm" /> Processing…</> : <><Download className="h-4 w-4" /> Download {quality === 'audio' ? 'MP3' : `MP4 ${quality}`}</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Result */}
        <AnimatePresence>
          {downloadResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <a href={downloadResult.downloadUrl} download={downloadResult.fileName} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors">
                <Download className="h-4 w-4" /> {downloadResult.fileName}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">Link expires in 1 hour</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Rate limited to 5 downloads per hour. Files are auto-deleted after 1 hour.
      </p>
    </div>
  );
}
