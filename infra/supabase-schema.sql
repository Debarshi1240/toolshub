-- ToolsHub Supabase Schema
-- Run this in your Supabase SQL editor

-- ── Jobs Table ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  file_url     TEXT,
  error        TEXT
);

CREATE INDEX idx_jobs_expires_at ON jobs (expires_at);
CREATE INDEX idx_jobs_status     ON jobs (status);

-- ── Analytics Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id           BIGSERIAL PRIMARY KEY,
  tool_name    TEXT NOT NULL,
  usage_count  INTEGER NOT NULL DEFAULT 1,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (tool_name, date)
);

CREATE INDEX idx_analytics_date      ON analytics (date);
CREATE INDEX idx_analytics_tool_name ON analytics (tool_name);

-- ── Row Level Security (enable for production) ────────────────────────────────
ALTER TABLE jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on jobs"
  ON jobs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on analytics"
  ON analytics FOR ALL USING (auth.role() = 'service_role');

-- ── Cleanup function (optional — called by pg_cron or backend cron) ───────────
CREATE OR REPLACE FUNCTION cleanup_expired_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM jobs WHERE expires_at < NOW() AND status = 'completed';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
