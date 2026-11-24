import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client. Bypasses RLS — server-side only, and only for writes
 * users must not be able to make themselves (e.g. crediting referral points).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_SECRET_KEY is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
