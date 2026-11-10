import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectConfig, fromStoredFormData } from '@/config/projects';
import { getProject } from '@/lib/projects';
import type { BaseFee, SummaryRow } from '@/lib/projects';
import { capturedQuantity } from '@/lib/projects/orders';

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
  /** Present for projects where units are bought in several orders (e.g. photo entries). */
  order?: { unit: string; quantity: number; purchased: number; maxTotal: number };
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
  /** Size of the order. Required to add units to an already-paid registration. */
  quantity?: number | null;
}): Promise<QuoteResult> {
  const { supabase, userId, registrationId } = args;

  const { data: reg } = await supabase
    .from('registrations_v3')
    .select('id, event_id, form_data, paid, registration_by, events(title)')
    .eq('id', registrationId)
    .maybeSingle();

  if (!reg) return { ok: false, status: 404, error: 'Registration not found' };
  if (reg.registration_by !== userId) return { ok: false, status: 403, error: 'Unauthorized' };

  const project = getProject(reg.event_id);
  if (!project || !getProjectConfig(reg.event_id)?.paymentEnabled) return { ok: false, status: 400, error: 'Payments are not available for this event' };

  // A paid registration can only be charged again for projects that sell units in multiple orders.
  if (reg.paid && !project.orders) return { ok: false, status: 400, error: 'Registration already paid' };

  const now = new Date();
  if (project.isOpen && !project.isOpen(now)) {
    return { ok: false, status: 400, error: 'Registration is closed for this event' };
  }

  const formData = fromStoredFormData(reg.event_id, reg.form_data);

  // Multi-order projects: this order's size decides its price, not the participant's running total.
  let quantity: number | undefined;
  let order: Quote['order'];
  if (project.orders) {
    const purchased = capturedQuantity(reg.form_data);

    quantity = reg.paid ? Number(args.quantity) : project.orders.initialQuantity(formData);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, status: 400, error: `Choose how many ${project.orders.unit}s to add` };
    }
    if (purchased + quantity > project.orders.maxTotal) {
      const remaining = Math.max(0, project.orders.maxTotal - purchased);
      return {
        ok: false,
        status: 400,
        error: remaining === 0
          ? `You already have the maximum of ${project.orders.maxTotal} ${project.orders.unit}s.`
          : `You can add at most ${remaining} more ${project.orders.unit}${remaining === 1 ? '' : 's'} (limit ${project.orders.maxTotal}).`,
      };
    }
    order = { unit: project.orders.unit, quantity, purchased, maxTotal: project.orders.maxTotal };
  }

  let base: BaseFee;
  try {
    base = project.getBaseFee(formData, now, quantity);
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
      summary: project.getSummary(formData, fee, quantity),
      eventTitle,
      discountPercent,
      applied,
      order,
    },
  };
}
