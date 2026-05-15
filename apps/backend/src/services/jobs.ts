import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Job, JobType, JobStatus } from '../../../packages/shared/src/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

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

  try {
    const { error } = await supabase.from('jobs').insert([job]);
    if (error) console.error('[Supabase] Failed to save job:', error.message);
  } catch (err) {
    console.error('[Supabase] Connection error:', err);
  }

  return job;
}

export async function getExpiredJobs(): Promise<Job[]> {
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
  try {
    await supabase.from('jobs').delete().eq('id', id);
  } catch {}
}
