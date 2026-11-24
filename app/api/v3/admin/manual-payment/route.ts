import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/projects';
import { fromStoredFormData, getProjectConfig, isPaymentUnlocked, withFormValues } from '@/config/projects';
import { mutateFormData } from '@/lib/projects/orders';
import { MANUAL_PAYMENT_METHODS } from '@/lib/payments/manual';


const toMinor = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
};

/**
 * Admin only: record a payment collected offline / outside the checkout.
 * Inserts a captured `payments_v3` row, marks the registration as paid and approves the fee stage.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: me } = await supabase.from('user_info').select('is_admin').eq('id', user.id).maybeSingle();
    if (me?.is_admin !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { registration_id, method, reference, paid_at } = body ?? {};
    if (!registration_id) return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });
    if (!MANUAL_PAYMENT_METHODS.some(m => m.value === method)) {
      return NextResponse.json({ error: 'Choose a payment method' }, { status: 400 });
    }

    const amount = toMinor(body.amount);
    if (!amount || amount < 100) return NextResponse.json({ error: 'Enter the amount received' }, { status: 400 });
    const gatewayFee = body.gateway_fee == null || body.gateway_fee === '' ? null : toMinor(body.gateway_fee);
    const tax = body.tax == null || body.tax === '' ? null : toMinor(body.tax);
    if ((body.gateway_fee && gatewayFee == null) || (body.tax && tax == null)) {
      return NextResponse.json({ error: 'Invalid fee or GST amount' }, { status: 400 });
    }

    const paidAt = paid_at ? new Date(paid_at) : new Date();
    if (Number.isNaN(paidAt.getTime()) || paidAt.getTime() > Date.now() + 60_000) {
      return NextResponse.json({ error: 'Invalid payment date' }, { status: 400 });
    }

    const { data: reg } = await supabase
      .from('registrations_v3')
      .select('id, event_id, form_data, paid')
      .eq('id', registration_id)
      .maybeSingle();
    if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    if (reg.paid) return NextResponse.json({ error: 'This registration is already paid' }, { status: 400 });

    const project = getProject(reg.event_id);
    const cfg = getProjectConfig(reg.event_id);
    if (!project || !cfg) return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
    if (!isPaymentUnlocked(reg.event_id, reg.form_data)) {
      return NextResponse.json({ error: 'Approve final selection before recording the payment' }, { status: 400 });
    }

    // Price-changing choices (e.g. accommodation) the payment was for.
    const sent = (body.options && typeof body.options === 'object' ? body.options : {}) as Record<string, unknown>;
    const options: Record<string, string> = {};
    for (const opt of project.paymentOptions ?? []) {
      const v = sent[opt.key];
      if (typeof v !== 'string' || !opt.choices.some(c => c.value === v)) {
        return NextResponse.json({ error: `Choose ${opt.label.toLowerCase()}` }, { status: 400 });
      }
      options[opt.key] = v;
    }

    const formData = { ...fromStoredFormData(reg.event_id, reg.form_data), ...options };
    let base;
    try {
      base = project.getBaseFee(formData, paidAt);
    } catch {
      return NextResponse.json({ error: 'Pricing is not configured for this event' }, { status: 400 });
    }

    const ref = typeof reference === 'string' && reference.trim() ? reference.trim().slice(0, 200) : null;
    const { data: payment, error: insertError } = await supabase
      .from('payments_v3')
      .insert({
        registration_id,
        razorpay_payment_id: ref,
        method: `manual_${method}`,
        amount,
        currency: base.currency,
        mindrain_fee: amount,
        razorpay_fee: gatewayFee,
        tax: tax ?? 0,
        status: 'captured',
        original_amount: base.amountMinor,
        discount_amount: Math.max(0, base.amountMinor - amount),
        created_at: paidAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('payment_id')
      .single();
    if (insertError || !payment) {
      console.error('Manual payment insert error:', insertError);
      return NextResponse.json({ error: 'Failed to record the payment' }, { status: 500 });
    }

    const { error: paidError } = await supabase
      .from('registrations_v3')
      .update({ paid: true })
      .eq('id', registration_id)
      .eq('paid', false);
    if (paidError) {
      console.error('Manual payment: failed to mark paid', paidError);
      await supabase.from('payments_v3').delete().eq('payment_id', payment.payment_id);
      return NextResponse.json({ error: 'Failed to mark the registration as paid' }, { status: 500 });
    }

    const stage = cfg.paymentStage;
    const saved = await mutateFormData(supabase, registration_id, stored => {
      const next = withFormValues(reg.event_id, stored, options);
      return stage ? { ...next, progress: { ...(next.progress ?? {}), [stage]: 'approved' } } : next;
    });
    if (!saved.ok) {
      // The payment and paid flag are recorded; only the progress/choice update failed.
      console.error('Manual payment: failed to update form_data', saved.error);
      return NextResponse.json({ payment_id: payment.payment_id, warning: 'Payment recorded, but the fee stage could not be updated' });
    }

    return NextResponse.json({ payment_id: payment.payment_id, form_data: saved.stored });
  } catch (error) {
    console.error('Manual payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
