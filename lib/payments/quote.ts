import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectConfig, fromStoredFormData, isPaymentUnlocked } from '@/config/projects';
import { getProject } from '@/lib/projects';
import type { BaseFee, SummaryRow } from '@/lib/projects';
import { capturedQuantity } from '@/lib/projects/orders';
import { withGatewayFee, GATEWAY_FEE_PERCENT, GST_PERCENT } from './gatewayFee';
import { getReferralSettings, lookupReferralCode, referralDiscountMinor, referralPoints } from '@/lib/referral';

export interface Quote {
  /** What is charged: base − discount + charges. */
  amountMinor: number;
  /** Base fee before any discount or charges. */
  originalAmountMinor: number;
  discountMinor: number;
  /** Base − discount, before charges. */
  subtotalMinor: number;
  /** Extra charges added on top of the subtotal (gateway fee, GST). */
  charges?: { label: string; amountMinor: number }[];
  /** Price-changing choices offered on the payment page. */
  options?: {
    key: string;
    label: string;
    selected: string;
    choices: { value: string; label: string; description?: string; amountMinor: number }[];
  }[];
  currency: 'INR' | 'USD';
  badge?: string;
  description: string;
  summary: SummaryRow[];
  eventTitle: string;
  discountPercent?: number;
  /** Present when a coupon / referral was applied. */
  applied?: { title: string; message: string };
  /** Present for projects where units are bought in several orders (e.g. photo entries). */
  order?: {
    unit: string;
    quantity: number;
    purchased: number;
    maxTotal: number;
    /** Split of this order by group (e.g. photography category). */
    groups?: { key: string; label: string; count: number }[];
  };
}

/** Server-only details of an applied code. Never sent to the client. */
export interface AppliedCode {
  kind: 'coupon' | 'referral';
  code: string;
  /** Referral only */
  referralId?: string;
  /** Referral only: MR POINTS the referrer gets once this payment is captured. */
  points?: number;
}

export type QuoteResult =
  | {
      ok: true;
      quote: Quote;
      applied: AppliedCode | null;
      /** Payment-page choices (key -> value) this quote was priced with; saved into the form on order. */
      options: Record<string, string>;
      eventId: string;
    }
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
  /** Split of the order by group, for projects with `orders.breakdown`. Overrides `quantity`. */
  breakdown?: unknown;
  /** Payment-page choices, e.g. { accommodation: 'without' }. Missing ones use the saved / first choice. */
  options?: unknown;
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
  if (!isPaymentUnlocked(reg.event_id, reg.form_data)) {
    return { ok: false, status: 403, error: 'Payment opens once you are selected in the final round' };
  }

  // A paid registration can only be charged again for projects that sell units in multiple orders.
  if (reg.paid && !project.orders) return { ok: false, status: 400, error: 'Registration already paid' };

  const now = new Date();
  if (project.isOpen && !project.isOpen(now)) {
    return { ok: false, status: 400, error: 'Registration is closed for this event' };
  }

  const storedForm = fromStoredFormData(reg.event_id, reg.form_data);

  // Price-changing choices: validate what the client sent, else keep the saved choice, else the first one.
  const sentOptions = (args.options && typeof args.options === 'object' ? args.options : {}) as Record<string, unknown>;
  const options: Record<string, string> = {};
  for (const opt of project.paymentOptions ?? []) {
    const valid = (v: unknown): v is string => typeof v === 'string' && opt.choices.some(c => c.value === v);
    if (sentOptions[opt.key] !== undefined && !valid(sentOptions[opt.key])) {
      return { ok: false, status: 400, error: `Invalid ${opt.label.toLowerCase()} choice` };
    }
    options[opt.key] = valid(sentOptions[opt.key])
      ? sentOptions[opt.key] as string
      : valid(storedForm[opt.key]) ? storedForm[opt.key] : opt.choices[0].value;
  }
  const formData = { ...storedForm, ...options };

  // Multi-order projects: this order's size decides its price, not the participant's running total.
  let quantity: number | undefined;
  let breakdown: Record<string, number> | undefined;
  let order: Quote['order'];
  if (project.orders) {
    const purchased = capturedQuantity(reg.form_data);

    const split = project.orders.breakdown;
    if (reg.paid) {
      if (split) {
        const parsed = split.parse(args.breakdown);
        if (!parsed) return { ok: false, status: 400, error: 'Invalid selection' };
        breakdown = parsed;
        quantity = Object.values(parsed).reduce((a, b) => a + b, 0);
      } else {
        quantity = Number(args.quantity);
      }
    } else {
      quantity = project.orders.initialQuantity(formData);
      breakdown = split?.initial(formData);
    }
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
    order = {
      unit: project.orders.unit,
      quantity,
      purchased,
      maxTotal: project.orders.maxTotal,
      groups: split?.groups.map(g => ({ ...g, count: breakdown?.[g.key] ?? 0 })),
    };
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
  let appliedCode: AppliedCode | null = null;

  const code = args.code?.trim().toUpperCase();
  if (code) {
    const handler = project.coupons?.[code];
    if (handler) {
      const res = await handler({ formData, userId, base, now, supabase });
      if (!res.ok) return { ok: false, status: 400, error: res.error };
      fee = res.fee ?? base;
      discountPercent = res.discountPercent;
      applied = { title: res.title, message: res.message };
      appliedCode = { kind: 'coupon', code };
    } else {
      // Not a coupon: try it as a referral code. Coupons and referrals don't stack (one code per payment).
      const lookup = await lookupReferralCode(supabase, code, userId);
      if (!lookup.ok) return { ok: false, status: 400, error: lookup.error };

      const settings = await getReferralSettings(supabase, reg.event_id);
      if (!settings.enabled) return { ok: false, status: 400, error: 'Referral codes are not accepted for this event.' };

      const discount = referralDiscountMinor(settings, base.amountMinor, base.currency);
      fee = { ...base, amountMinor: base.amountMinor - discount };
      if (settings.d2_type === 'percent' && discount > 0) discountPercent = settings.d2_percent;
      const symbol = base.currency === 'INR' ? '₹' : '$';
      applied = {
        title: 'Referral Applied!',
        message: discount > 0
          ? `Referral code verified. You save ${symbol}${(discount / 100).toLocaleString()}.`
          : 'Referral code verified successfully.',
      };
      appliedCode = {
        kind: 'referral',
        code,
        referralId: lookup.referralId,
        points: referralPoints(settings, base.amountMinor, base.currency),
      };
    }
  }

  const eventTitle = (reg as any).events?.title || project.title;

  const subtotalMinor = fee.amountMinor;
  let amountMinor = subtotalMinor;
  let charges: Quote['charges'];
  if (project.passGatewayFee) {
    const g = withGatewayFee(subtotalMinor);
    amountMinor = g.totalMinor;
    charges = [
      { label: `Payment gateway fee (${GATEWAY_FEE_PERCENT}%)`, amountMinor: g.gatewayMinor },
      { label: `GST on gateway fee (${GST_PERCENT}%)`, amountMinor: g.gstMinor },
    ];
  }

  const quoteOptions: Quote['options'] = project.paymentOptions?.map(opt => ({
    key: opt.key,
    label: opt.label,
    selected: options[opt.key],
    choices: opt.choices.map(c => ({
      ...c,
      amountMinor: project.getBaseFee({ ...formData, [opt.key]: c.value }, now, quantity).amountMinor,
    })),
  }));

  return {
    ok: true,
    applied: appliedCode,
    options,
    eventId: reg.event_id,
    quote: {
      amountMinor,
      originalAmountMinor: base.amountMinor,
      discountMinor: base.amountMinor - subtotalMinor,
      subtotalMinor,
      charges,
      options: quoteOptions,
      currency: fee.currency,
      badge: fee.badge,
      description: fee.description,
      summary: project.getSummary(formData, fee, quantity, breakdown, order ? order.maxTotal - order.purchased : undefined),
      eventTitle,
      discountPercent,
      applied,
      order,
    },
  };
}
