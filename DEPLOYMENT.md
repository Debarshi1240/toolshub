# DEPLOYMENT.md — ToolsHub Production Deployment Guide

## Prerequisites

- GitHub account with repository created
- Node.js 18+ installed locally
- Python 3.10+ installed locally
- Accounts created on: **Vercel**, **Railway**, **Render**, **Supabase**, **Cloudflare**

---

## Step 1: Cloudflare R2 Setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage** → **Create bucket** → name it `toolshub-files`
3. Go to **R2 → Manage R2 API tokens** → **Create API token**
   - Permissions: **Object Read & Write**
   - Copy: `Access Key ID` and `Secret Access Key`
4. Enable **Public Access** on the bucket for download links
5. Note your Account ID from the R2 overview page
6. Your endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## Step 2: Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `infra/supabase-schema.sql` → **Run**
3. Go to **Settings → API**:
   - Copy `Project URL` → `SUPABASE_URL`
   - Copy `anon public` key → `SUPABASE_ANON_KEY`

---

## Step 3: Deploy Frontend (Vercel)

```bash
cd apps/frontend
npm install -g vercel
vercel login
vercel link    # link to your Vercel project
vercel env add NEXT_PUBLIC_API_URL production
# enter: https://your-railway-backend.up.railway.app
vercel --prod
```

**Environment variables to add in Vercel dashboard:**
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Step 4: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repo → choose `apps/backend` as root directory
3. Add environment variables:

```env
ANTHROPIC_API_KEY=sk-ant-...
CLOUDFLARE_R2_BUCKET=toolshub-files
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-HASH.r2.dev
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=...
DOWNLOADER_SERVICE_URL=https://your-render-service.onrender.com
FRONTEND_URL=https://your-app.vercel.app
PORT=4000
NODE_ENV=production
```

4. Railway will auto-detect `npm run start` and deploy.
5. Copy the generated Railway URL → use for `NEXT_PUBLIC_API_URL` in Vercel.

---

## Step 5: Deploy Python Downloader (Render)

1. Go to [render.com](https://render.com) → **New Web Service** → connect GitHub
2. Set:
   - **Root Directory**: `apps/downloader`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2`
3. Add environment variables:

```env
CLOUDFLARE_R2_BUCKET=toolshub-files
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-HASH.r2.dev
FLASK_ENV=production
```

4. Copy Render URL → add as `DOWNLOADER_SERVICE_URL` in Railway backend.

---

## Step 6: CI/CD GitHub Actions

Add these secrets in **GitHub → Settings → Secrets → Actions**:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `RAILWAY_TOKEN` | Railway → Account → Tokens |
| `RENDER_DEPLOY_HOOK` | Render → Service → Settings → Deploy Hook URL |

Push to `main` → CI/CD will automatically lint, build, and deploy all services.

---

## Step 7: Verify Deployment

```bash
# Health check
curl https://your-railway-backend.up.railway.app/api/health

# Downloader health
curl https://your-render-service.onrender.com/health
```

Expected response:
```json
{ "status": "healthy", "service": "ToolsHub API" }
```

---

## Optional: Custom Domain

1. **Vercel**: Settings → Domains → Add your domain
2. **Railway**: Settings → Networking → Custom Domain
3. Update `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` environment variables accordingly.

---

## Production Checklist

- [ ] Cloudflare R2 bucket created with public access
- [ ] Supabase schema applied
- [ ] All environment variables set in each service
- [ ] GitHub secrets added for CI/CD
- [ ] Health checks passing on all services
- [ ] Custom domain configured (optional)
- [ ] LibreOffice installed on Railway instance (for PDF↔Word conversion)
- [ ] ffmpeg installed on Render instance (for media processing)
