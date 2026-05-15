import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function trackUsage(toolName: string): Promise<void> {
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
    // Non-critical — don't throw
    console.error('[Analytics] Failed to track usage:', err);
  }
}
