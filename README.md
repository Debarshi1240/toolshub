# ToolsHub — All-in-One Productivity Platform

> A production-ready monorepo featuring PDF tools, media downloader, and AI plagiarism checker.

---

## 📁 Monorepo Structure

```
toolshub/
├── apps/
│   ├── frontend/        # Next.js 14 + Tailwind + shadcn/ui
│   ├── backend/         # Node.js + Express API
│   └── downloader/      # Python Flask + yt-dlp microservice
├── packages/
│   └── shared/          # TypeScript types & utilities
├── infra/               # Infrastructure configs
├── .github/
│   └── workflows/       # CI/CD GitHub Actions
└── DEPLOYMENT.md
```

---

## 🚀 Prerequisites

- Node.js >= 18
- Python >= 3.10
- npm >= 9
- pip >= 23
- LibreOffice (for PDF↔Word conversion)
- ffmpeg (for media processing)

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/toolshub.git
cd toolshub

# Install Node dependencies (all workspaces)
npm install

# Install Python dependencies
cd apps/downloader
pip install -r requirements.txt
cd ../..
```

### 2. Configure Environment Variables

```bash
# Copy example env files
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
cp apps/downloader/.env.example apps/downloader/.env
```

Fill in all values in each `.env` file. See `.env.example` files for required keys.

### 3. Run in Development

Open **three terminals**:

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd apps/frontend
npm run dev
```

**Terminal 3 — Downloader:**
```bash
cd apps/downloader
python app.py
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Downloader: http://localhost:5000

---

## 🔧 Environment Variables

| Variable | Service | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend | Claude API key |
| `CLOUDFLARE_R2_BUCKET` | Backend/Downloader | R2 bucket name |
| `CLOUDFLARE_R2_ACCESS_KEY` | Backend/Downloader | R2 access key |
| `CLOUDFLARE_R2_SECRET_KEY` | Backend/Downloader | R2 secret key |
| `CLOUDFLARE_R2_ENDPOINT` | Backend/Downloader | R2 endpoint URL |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | Backend | Supabase anon key |
| `DOWNLOADER_SERVICE_URL` | Backend | Python service URL |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, Multer, Helmet |
| Downloader | Python, Flask, yt-dlp |
| Storage | Cloudflare R2 |
| Database | Supabase (PostgreSQL) |
| PDF Processing | pdf-lib, LibreOffice |
| AI | Claude (Anthropic) |
| CI/CD | GitHub Actions |

---

## 📖 See DEPLOYMENT.md for production deployment steps.
