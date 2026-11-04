import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectConfig, fromStoredFormData } from '@/config/projects';
import { getProject } from '@/lib/projects';
import type { BaseFee, SummaryRow } from '@/lib/projects';

export interface Quote {
  amountMinor: number;
  originalAmountMinor: number;
  currency: 'INR' | 'USD';
  badge?: string;
  description: string;
  summary: SummaryRow[];
  eventTitle: string;
  discountPercent?: number;
  /** Present when a coupon / referral was applied. */
  applied?: { title: string; message: string };
}

export type QuoteResult =
  | { ok: true; quote: Quote; referralId: string | null }
  | { ok: false; status: number; error: string };

/**
 * Single source of truth for what a registration costs. Used by both the
 * payment page (display) and create-order (what Razorpay is actually charged),
 * so the client never dictates the amount.
 */
export async function quoteRegistration(args: {
  supabase: SupabaseClient;
  userId: string;
  registrationId: string;
  code?: string | null;
}): Promise<QuoteResult> {
  const { supabase, userId, registrationId } = args;

  const { data: reg } = await supabase
    .from('registrations_v3')
    .select('id, event_id, form_data, paid, registration_by, events(title)')
    .eq('id', registrationId)
    .maybeSingle();

  if (!reg) return { ok: false, status: 404, error: 'Registration not found' };
  if (reg.registration_by !== userId) return { ok: false, status: 403, error: 'Unauthorized' };
  if (reg.paid) return { ok: false, status: 400, error: 'Registration already paid' };

  const project = getProject(reg.event_id);
  if (!project || !getProjectConfig(reg.event_id)?.paymentEnabled) return { ok: false, status: 400, error: 'Payments are not available for this event' };

  const now = new Date();
  const formData = fromStoredFormData(reg.event_id, reg.form_data);
  let base: BaseFee;
  try {
    base = project.getBaseFee(formData, now);
  } catch (e) {
    console.error('Pricing unavailable for event', reg.event_id, e);
    return { ok: false, status: 400, error: 'Payments are not open for this event yet' };
  }
  let fee: BaseFee = base;
  let discountPercent: number | undefined;
  let applied: Quote['applied'];
  let referralId: string | null = null;

  const code = args.code?.trim().toUpperCase();
  if (code) {
    const handler = project.coupons?.[code];
    if (handler) {
      const res = await handler({ formData, userId, base, now, supabase });
      if (!res.ok) return { ok: false, status: 400, error: res.error };
      fee = res.fee ?? base;
      discountPercent = res.discountPercent;
      applied = { title: res.title, message: res.message };
    } else {
      const { data: referral } = await supabase
        .from('referral_account')
        .select('id')
        .eq('code', code)
        .eq('status', 'active')
        .maybeSingle();
      if (!referral) return { ok: false, status: 400, error: 'Invalid coupon or referral code.' };
      referralId = referral.id;
      applied = { title: 'Referral Applied!', message: 'Referral code verified successfully.' };
    }
  }

  const eventTitle = (reg as any).events?.title || project.title;

  return {
    ok: true,
    referralId,
    quote: {
      amountMinor: fee.amountMinor,
      originalAmountMinor: base.amountMinor,
      currency: fee.currency,
      badge: fee.badge,
      description: fee.description,
      summary: project.getSummary(formData, fee),
      eventTitle,
      discountPercent,
      applied,
    },
  };
}
