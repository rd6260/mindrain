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

export interface PaymentOption {
  /** form_data key the choice is stored under. */
  key: string;
  label: string;
  choices: { value: string; label: string; description?: string }[];
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
  getSummary(formData: FormData, fee: BaseFee, quantity?: number, breakdown?: Record<string, number>,
    /** How many more units this participant can still buy (cap minus owned), for projects with `orders`. */
    remaining?: number,
  ): SummaryRow[];

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
    /**
     * Optional split of an order into groups (e.g. photography categories). The price is still decided
     * by the order's total quantity; the split is only recorded.
     */
    breakdown?: {
      groups: { key: string; label: string }[];
      /** The split chosen in the registration form (first order). */
      initial(formData: FormData): Record<string, number>;
      /** Validate a split sent for an add-on order. `undefined` input = the default (smallest) order. */
      parse(input: unknown): Record<string, number> | null;
    };
  };

  /**
   * Choices made on the payment page that change the price (e.g. accommodation).
   * The chosen value is saved into the form data under `key` and passed to `getBaseFee`.
   * Every choice must have a different base price (used to tell which one a payment was for).
   */
  paymentOptions?: PaymentOption[];

  /** Add the payment gateway fee + GST on top of the (discounted) fee and show the breakdown. */
  passGatewayFee?: boolean;

  /** Project specific coupons, keyed by UPPERCASE code. Unmatched codes fall back to referral codes. */
  coupons?: Record<string, (ctx: CouponContext) => Promise<CouponResult>>;

  /**
   * Runs after the registration form was saved (insert or update), e.g. to delete uploads the saved
   * form no longer references. Errors are logged, never fail the save.
   */
  afterSave?(ctx: { supabase: SupabaseClient; userId: string; formData: FormData }): Promise<void>;

  /** Top-level form_data keys to hide from the invoice email. */
  invoiceHiddenKeys?: string[];
}
