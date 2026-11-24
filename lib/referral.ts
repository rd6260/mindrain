import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Server-only constants — never show these to users ───────────────────────

/** Value of 1 MR POINT in rupees. Internal only: the frontend must never reveal it. */
export const RUPEES_PER_POINT = 0.5;

/** Fixed rate used to turn USD payments into points. Update when the rate moves meaningfully. */
export const USD_TO_INR = 88;

/** Minimum points an earn account needs before it can request a redemption (also enforced in SQL). */
export const MIN_REDEEM_POINTS = 3000;

// ─── Settings ────────────────────────────────────────────────────────────────

export type RewardType = 'percent' | 'fixed';

export interface ReferralSettings {
  enabled: boolean;
  /** D1: what the referrer earns */
  d1_type: RewardType;
  d1_percent: number;
  d1_inr: number;
  d1_usd: number;
  /** D2: discount for the payer */
  d2_type: RewardType;
  d2_percent: number;
  d2_inr: number;
  d2_usd: number;
}

export const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  enabled: true,
  d1_type: 'percent',
  d1_percent: 10,
  d1_inr: 0,
  d1_usd: 0,
  d2_type: 'percent',
  d2_percent: 5,
  d2_inr: 0,
  d2_usd: 0,
};

export async function getReferralSettings(supabase: SupabaseClient, eventId: string): Promise<ReferralSettings> {
  const { data } = await supabase.from('referral_settings').select('*').eq('event_id', eventId).maybeSingle();
  if (!data) return DEFAULT_REFERRAL_SETTINGS;
  const n = (v: unknown) => Number(v) || 0;
  return {
    enabled: data.enabled !== false,
    d1_type: data.d1_type === 'fixed' ? 'fixed' : 'percent',
    d1_percent: n(data.d1_percent),
    d1_inr: n(data.d1_inr),
    d1_usd: n(data.d1_usd),
    d2_type: data.d2_type === 'fixed' ? 'fixed' : 'percent',
    d2_percent: n(data.d2_percent),
    d2_inr: n(data.d2_inr),
    d2_usd: n(data.d2_usd),
  };
}

// ─── Maths (amounts in minor units: paise / cents) ───────────────────────────

type Currency = 'INR' | 'USD';

/** Smallest amount Razorpay accepts; a discount never takes the price below this. */
const MIN_CHARGE_MINOR = 100;

/** D2: discount in minor units off `originalMinor`. */
export function referralDiscountMinor(s: ReferralSettings, originalMinor: number, currency: Currency): number {
  const raw = s.d2_type === 'percent'
    ? Math.round((originalMinor * s.d2_percent) / 100)
    : Math.round((currency === 'INR' ? s.d2_inr : s.d2_usd) * 100);
  return Math.max(0, Math.min(raw, originalMinor - MIN_CHARGE_MINOR));
}

/** D1: points the referrer earns for a payment whose original (pre-discount) price is `originalMinor`. */
export function referralPoints(s: ReferralSettings, originalMinor: number, currency: Currency): number {
  const rewardMajor = s.d1_type === 'percent'
    ? (originalMinor / 100) * (s.d1_percent / 100)
    : currency === 'INR' ? s.d1_inr : s.d1_usd;
  const rupees = currency === 'USD' ? rewardMajor * USD_TO_INR : rewardMajor;
  return Math.max(0, Math.floor(rupees / RUPEES_PER_POINT));
}

// ─── Code lookup ─────────────────────────────────────────────────────────────

export type ReferralLookup =
  | { ok: true; referralId: string }
  | { ok: false; error: string };

/** A code is usable when its earn account exists, isn't blocked, and doesn't belong to the payer. */
export async function lookupReferralCode(supabase: SupabaseClient, code: string, userId: string): Promise<ReferralLookup> {
  const { data } = await supabase
    .from('referral_account')
    .select('id, is_blocked')
    .eq('referral_code', code.trim().toUpperCase())
    .maybeSingle();
  if (!data || data.is_blocked) return { ok: false, error: 'Invalid coupon or referral code.' };
  if (data.id === userId) return { ok: false, error: 'You can’t use your own referral code.' };
  return { ok: true, referralId: data.id };
}
