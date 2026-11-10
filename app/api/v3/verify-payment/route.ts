import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/projects';
import { fromStoredFormData } from '@/config/projects';
import { mutateFormData, readOrders } from '@/lib/projects/orders';
import { sendInvoiceEmail } from '@/lib/payments/invoice';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      registration_id,
      payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!registration_id || !payment_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: registration } = await supabase
      .from('registrations_v3')
      .select('id, team_id, form_data, event_id, registration_by, paid, events(title)')
      .eq('id', registration_id)
      .maybeSingle();

    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    if (registration.registration_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // The payment row must belong to this registration and this Razorpay order.
    const { data: payment } = await supabase
      .from('payments_v3')
      .select('payment_id, registration_id, razorpay_order_id, amount, currency, status')
      .eq('payment_id', payment_id)
      .maybeSingle();

    if (!payment || payment.registration_id !== registration_id || payment.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: 'Payment does not match registration' }, { status: 400 });
    }

    if (payment.status === 'captured' && registration.paid) {
      return NextResponse.json({ message: 'Payment already verified', isOk: true }, { status: 200 });
    }

    const project = getProject(registration.event_id);
    const eventTitle = (registration as any).events?.title || project?.title || 'Event';
    const invoiceBase = {
      to: user.email,
      eventTitle,
      teamId: registration.team_id,
      // For multi-order projects the receipt should show this order's size, not the first order's.
      formData: (() => {
        const fd = fromStoredFormData(registration.event_id, registration.form_data);
        const order = readOrders(registration.form_data).find(o => o.payment_id === payment_id);
        return order && project?.orders
          ? { ...fd, images: order.quantity, ...(order.breakdown && { categories: order.breakdown }) }
          : fd;
      })(),
      hiddenKeys: project?.invoiceHiddenKeys,
      amountMinor: payment.amount,
      currency: payment.currency,
      razorpayPaymentId: razorpay_payment_id,
    };

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_ID!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const sigOk =
      expectedSig.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(razorpay_signature));

    if (!sigOk) {
      await supabase
        .from('payments_v3')
        .update({ status: 'failed', razorpay_payment_id })
        .eq('payment_id', payment_id);

      await sendInvoiceEmail({ ...invoiceBase, status: 'failed' });
      return NextResponse.json({ message: 'Payment verification failed', isOk: false }, { status: 400 });
    }

    let rzpPayment: any = null;
    try {
      const razorpay = new Razorpay({
        key_id: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim(),
        key_secret: (process.env.RAZORPAY_SECRET_ID || '').trim(),
      });
      rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (e) {
      console.error('Failed to fetch Razorpay payment details:', e);
    }

    // Multi-order projects: credit this order. Idempotent, so a retried verification is safe.
    if (project?.orders) {
      const credited = await mutateFormData(supabase, registration_id, stored => ({
        ...stored,
        orders: readOrders(stored).map(o => (o.payment_id === payment_id ? { ...o, status: 'captured' as const } : o)),
      }));
      if (!credited.ok) {
        console.error('Failed to credit order:', credited.error);
        return NextResponse.json({ message: 'Failed to record your order. Please contact support.', isOk: false }, { status: 500 });
      }
    }

    const { error: updatePaymentError } = await supabase
      .from('payments_v3')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        method: rzpPayment?.method || null,
        razorpay_fee: rzpPayment?.fee || null,
        tax: rzpPayment?.tax || null,
        status: 'captured',
      })
      .eq('payment_id', payment_id);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
      return NextResponse.json({ message: 'Failed to update payment record', isOk: false }, { status: 500 });
    }

    const { error: updateRegError } = await supabase
      .from('registrations_v3')
      .update({ paid: true })
      .eq('id', registration_id);

    if (updateRegError) {
      console.error('Error updating registration:', updateRegError);
      return NextResponse.json({ message: 'Failed to update registration status', isOk: false }, { status: 500 });
    }

    await sendInvoiceEmail({ ...invoiceBase, method: rzpPayment?.method || undefined, status: 'captured' });

    return NextResponse.json({ message: 'Payment verified successfully', isOk: true }, { status: 200 });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ message: 'Payment verification failed', isOk: false }, { status: 500 });
  }
}
