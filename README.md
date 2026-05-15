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

## 🚀 "Zero Config" Local Mode
ToolsHub is designed to work **immediately** without any external API keys or cloud storage.
- **Storage:** Falls back to local disk if Cloudflare R2 keys are missing.
- **AI:** Plagiarism checker requires an Anthropic key, but the UI gracefully handles its absence.
- **Downloader:** Uses a bundled FFmpeg binary for most operations.

---

## 📦 Installation

```bash
# Install all Node dependencies
npm install

# Setup Downloader
cd apps/downloader
pip install -r requirements.txt
```

### Optional: Helper Binaries
For full PDF conversion support (Word↔PDF), install:
- **LibreOffice** (PDF↔Word)
- **Ghostscript** (Advanced compression)
- **qpdf** (PDF protection/encryption)

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
