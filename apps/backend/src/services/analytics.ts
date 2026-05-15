import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function trackUsage(toolName: string): Promise<void> {
  if (!supabase) {
    console.warn(`[Analytics] Missing Supabase keys. Usage of ${toolName} not tracked.`);
    return;
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('analytics')
      .select('*')
      .eq('tool_name', toolName)
      .eq('date', today)
      .single();

    if (data) {
      await supabase
        .from('analytics')
        .update({ usage_count: data.usage_count + 1 })
        .eq('tool_name', toolName)
        .eq('date', today);
    } else {
      await supabase
        .from('analytics')
        .insert([{ tool_name: toolName, usage_count: 1, date: today }]);
    }
  } catch (err) {
    console.error('[Analytics] Failed to track usage:', err);
  }
}
