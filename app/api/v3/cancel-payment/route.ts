import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_id } = await req.json();
    if (!payment_id) {
      return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 });
    }

    const { data: payment, error: fetchError } = await supabase
      .from('payments_v3')
      .select('status, registrations_v3(registration_by)')
      .eq('payment_id', payment_id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    if ((payment as any).registrations_v3?.registration_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only a still-pending payment can be cancelled
    if (payment.status === 'created') {
      const { error: updateError } = await supabase
        .from('payments_v3')
        .update({ status: 'failed' })
        .eq('payment_id', payment_id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
