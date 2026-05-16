import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Job, JobType, JobStatus } from '@toolshub/shared';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function saveJob(params: {
  type: JobType;
  status: JobStatus;
  file_url?: string;
}): Promise<Job> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const job: Job = {
    id: uuidv4(),
    type: params.type,
    status: params.status,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    file_url: params.file_url,
  };

  if (!supabase) {
    console.warn(`[Jobs] Missing Supabase keys. Job ${job.id} not saved to DB.`);
    return job;
  }

  try {
    const { error } = await supabase.from('jobs').insert([job]);
    if (error) console.error('[Supabase] Failed to save job:', error.message);
  } catch (err) {
    console.error('[Supabase] Connection error:', err);
  }

  return job;
}

export async function getExpiredJobs(): Promise<Job[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'completed');

    if (error) return [];
    return data as Job[];
  } catch {
    return [];
  }
}

export async function deleteJob(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('jobs').delete().eq('id', id);
  } catch {}
}
