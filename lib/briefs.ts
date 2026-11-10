import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrief, type BriefFile } from '@/config/projects';

/**
 * Brief files for an event: hard-coded ones from config if present (legacy events),
 * otherwise the rows of `event_briefs` (oldest first). Works with the browser or server client.
 */
export async function getBriefFiles(supabase: SupabaseClient, eventId: string): Promise<BriefFile[]> {
  const staticFiles = getBrief(eventId)?.files;
  if (staticFiles) return [...staticFiles];

  const { data, error } = await supabase
    .from('event_briefs')
    .select('name, description, url')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load event briefs:', error);
    return [];
  }
  return (data ?? []).map(r => ({ name: r.name, description: r.description ?? '', url: r.url }));
}
