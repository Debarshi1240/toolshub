import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// ── PDF API calls ──────────────────────────────────────────────────────────────
export async function processPdf(route: string, formData: FormData) {
  const { data } = await api.post(`/api/pdf/${route}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ── Downloader API calls ───────────────────────────────────────────────────────
export async function getVideoInfo(url: string) {
  const { data } = await api.post('/api/download/info', { url });
  return data.data;
}

export async function downloadMedia(url: string, quality: string, format: string) {
  const { data } = await api.post('/api/download', { url, quality, format });
  return data.data;
}

// ── Plagiarism API calls ───────────────────────────────────────────────────────
export async function checkPlagiarism(text: string) {
  const formData = new FormData();
  formData.append('text', text);
  const { data } = await api.post('/api/plagiarism', formData);
  return data.data;
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function healthCheck() {
  const { data } = await api.get('/api/health');
  return data;
}
