import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/** The signed-in admin's server client, or null when the caller isn't an admin. */
export async function requireAdmin(): Promise<SupabaseClient | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: me } = await supabase.from('user_info').select('is_admin').eq('id', user.id).maybeSingle();
  return me?.is_admin === true ? supabase : null;
}

/**
 * Undo the MR POINTS credited for these payments: subtract them from each referrer's earned total
 * and delete the ledger rows. Needs the service-role client (the ledger has no delete policy).
 */
export async function reverseReferralEarnings(admin: SupabaseClient, paymentIds: string[]): Promise<void> {
  if (paymentIds.length === 0) return;
  const { data: earnings, error } = await admin
    .from('referral_earnings')
    .select('id, referral_id, points')
    .in('payment_id', paymentIds);
  if (error) throw error;
  if (!earnings?.length) return;

  const byReferrer = new Map<string, number>();
  for (const e of earnings) byReferrer.set(e.referral_id, (byReferrer.get(e.referral_id) ?? 0) + e.points);

  for (const [referralId, points] of byReferrer) {
    const { data: acc, error: accError } = await admin
      .from('referral_account').select('earned_amount').eq('id', referralId).maybeSingle();
    if (accError) throw accError;
    if (!acc) continue;
    const { error: updError } = await admin
      .from('referral_account')
      .update({ earned_amount: Math.max(0, Number(acc.earned_amount) - points) })
      .eq('id', referralId);
    if (updError) throw updError;
  }

  const { error: delError } = await admin.from('referral_earnings').delete().in('id', earnings.map(e => e.id));
  if (delError) throw delError;
}
