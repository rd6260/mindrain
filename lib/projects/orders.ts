import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Multi-order projects (e.g. The MR Lens Trophy) keep their orders inside
 * `registrations_v3.form_data.orders`:
 *
 *   orders: [{ payment_id, quantity, status: 'pending' | 'captured', created_at }]
 *
 * An order is created as `pending` when the Razorpay order is created and flipped to `captured`
 * once the payment signature is verified. Only captured orders count towards what the participant owns.
 */
export interface StoredOrder {
  payment_id: string;
  quantity: number;
  /** Split of `quantity` by group (e.g. photography category), when the project uses one. */
  breakdown?: Record<string, number>;
  status: 'pending' | 'captured';
  created_at: string;
}

export const readOrders = (stored: Record<string, any> | null | undefined): StoredOrder[] =>
  Array.isArray(stored?.orders) ? (stored!.orders as StoredOrder[]) : [];

/** Units the participant has actually paid for. */
export const capturedQuantity = (stored: Record<string, any> | null | undefined): number =>
  readOrders(stored)
    .filter(o => o.status === 'captured')
    .reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

/** Units paid for, per group (e.g. per photography category). */
export const capturedBreakdown = (stored: Record<string, any> | null | undefined): Record<string, number> => {
  const totals: Record<string, number> = {};
  for (const o of readOrders(stored)) {
    if (o.status !== 'captured') continue;
    for (const [k, v] of Object.entries(o.breakdown ?? {})) totals[k] = (totals[k] ?? 0) + (Number(v) || 0);
  }
  return totals;
};

/**
 * Read-modify-write on a registration's `form_data` that cannot silently overwrite a concurrent change:
 * the write only lands if `updated_at` is still what we read, otherwise we re-read and retry.
 */
export async function mutateFormData(
  supabase: SupabaseClient,
  registrationId: string,
  mutate: (stored: Record<string, any>) => Record<string, any>,
  attempts = 5,
): Promise<{ ok: true; stored: Record<string, any> } | { ok: false; error: string }> {
  for (let i = 0; i < attempts; i++) {
    const { data: row, error: readError } = await supabase
      .from('registrations_v3')
      .select('form_data, updated_at')
      .eq('id', registrationId)
      .maybeSingle();
    if (readError || !row) return { ok: false, error: readError?.message ?? 'Registration not found' };

    const next = mutate(row.form_data ?? {});
    const { data: updated, error: writeError } = await supabase
      .from('registrations_v3')
      .update({ form_data: next, updated_at: new Date().toISOString() })
      .eq('id', registrationId)
      .eq('updated_at', row.updated_at)
      .select('id');
    if (writeError) return { ok: false, error: writeError.message };
    if (updated && updated.length > 0) return { ok: true, stored: next };
    // Someone else changed the row between our read and write: try again with fresh data.
  }
  return { ok: false, error: 'Could not save the order, please try again' };
}
