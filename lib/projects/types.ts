import type { SupabaseClient } from '@supabase/supabase-js';

export type FormData = Record<string, any>;

/** Amount of `amountMinor` is always in the smallest currency unit (paisa / cents). */
export interface BaseFee {
  amountMinor: number;
  currency: 'INR' | 'USD';
  /** Short label shown as a badge, e.g. "Early Bird Registration". */
  badge?: string;
  /** Used for the Razorpay checkout description. */
  description: string;
}

export interface SummaryRow {
  label: string;
  value: string;
}

export interface CouponContext {
  formData: FormData;
  userId: string;
  base: BaseFee;
  now: Date;
  supabase: SupabaseClient;
}

export type CouponResult =
  | {
      ok: true;
      /** Final fee after the coupon. Defaults to the base fee if omitted. */
      fee?: BaseFee;
      discountPercent?: number;
      title: string;
      message: string;
    }
  | { ok: false; error: string };

/**
 * Everything the generic pipeline needs to know about one project
 * (competition / workshop). Server-side and pure — no React in here.
 * The matching form UI lives in `app/components/registration/registry.ts`.
 */
export interface ProjectConfig {
  /** `events.id` this config belongs to. */
  eventId: string;
  title: string;

  /** Return an error message, or null when `form_data` is valid. `ctx.userId` is the submitting user (when known). */
  validateFormData(formData: FormData, ctx?: { userId: string }): string | null;

  /** Team id for the registration. `sequence` is a random 0–9999 number. */
  buildTeamId(args: { codeName: string; formData: FormData; sequence: number }): string;

  /**
   * Price for this registration at `now`. Must be computed server-side only.
   * `quantity` is the size of the order being paid for (projects with `orders`).
   */
  getBaseFee(formData: FormData, now: Date, quantity?: number): BaseFee;

  /** Rows shown in the payment summary. */
  getSummary(formData: FormData, fee: BaseFee, quantity?: number): SummaryRow[];

  /** Return false while registration/payment is closed. Omit for projects that are always open. */
  isOpen?(now: Date): boolean;

  /**
   * Projects where a participant buys units (e.g. photo entries) in several separate orders.
   * Each order is a `payments_v3` row with a `quantity`; the price of an order depends only on
   * its own quantity. The first order's quantity comes from the registration form.
   */
  orders?: {
    unit: string;
    /** Max units one participant may buy across all orders. */
    maxTotal: number;
    initialQuantity(formData: FormData): number;
  };

  /** Project specific coupons, keyed by UPPERCASE code. Unmatched codes fall back to referral codes. */
  coupons?: Record<string, (ctx: CouponContext) => Promise<CouponResult>>;

  /** Top-level form_data keys to hide from the invoice email. */
  invoiceHiddenKeys?: string[];
}
