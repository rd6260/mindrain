import { NextRequest, NextResponse } from 'next/server';
import { getProjectConfig } from '@/config/projects';
import { mutateFormData } from '@/lib/projects/orders';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, reverseReferralEarnings } from '@/lib/payments/admin';

/**
 * Admin only: remove a registration's payment (projects with a fee stage, e.g. Function Follows Form).
 * Deletes its captured payments_v3 row(s), takes back referral points credited for them,
 * marks the registration unpaid and sets the fee stage back to pending.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { registration_id } = await req.json();
    if (!registration_id) return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });

    const { data: reg } = await supabase
      .from('registrations_v3').select('id, event_id, paid').eq('id', registration_id).maybeSingle();
    if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

    const stage = getProjectConfig(reg.event_id)?.paymentStage;
    if (!stage) return NextResponse.json({ error: 'Payments for this event cannot be removed here' }, { status: 400 });

    const { data: payments, error: listError } = await supabase
      .from('payments_v3').select('payment_id').eq('registration_id', registration_id).eq('status', 'captured');
    if (listError) throw listError;
    const ids = (payments ?? []).map(p => p.payment_id);

    if (ids.length) {
      await reverseReferralEarnings(createAdminClient(), ids);
      const { error: delError } = await supabase.from('payments_v3').delete().in('payment_id', ids);
      if (delError) throw delError;
    }

    const { error: paidError } = await supabase.from('registrations_v3').update({ paid: false }).eq('id', registration_id);
    if (paidError) throw paidError;

    const saved = await mutateFormData(supabase, registration_id, stored => ({
      ...stored,
      progress: { ...(stored.progress ?? {}), [stage]: 'pending' },
    }));
    if (!saved.ok) throw new Error(saved.error);

    return NextResponse.json({ removed: ids.length, form_data: saved.stored });
  } catch (error) {
    console.error('Remove payment error:', error);
    return NextResponse.json({ error: 'Failed to remove the payment' }, { status: 500 });
  }
}
