import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteRegistration } from '@/lib/payments/quote';
import { mutateFormData, readOrders } from '@/lib/projects/orders';
import { withFormValues } from '@/config/projects';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The amount is never taken from the client — it is recomputed here.
    const { registration_id, code, quantity, breakdown, options } = await req.json();
    if (!registration_id) {
      return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });
    }

    const result = await quoteRegistration({
      supabase,
      userId: user.id,
      registrationId: registration_id,
      code,
      quantity,
      breakdown,
      options,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { quote, applied, options: chosenOptions, eventId } = result;

    if (quote.amountMinor < 100) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
      console.error('Razorpay keys missing');
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_SECRET_ID.trim(),
    });

    const order = await razorpay.orders.create({
      amount: quote.amountMinor,
      currency: quote.currency,
      receipt: `receipt_${Math.floor(Date.now() / 1000)}`,
    });
    if (!order?.id) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments_v3')
      .insert({
        registration_id,
        razorpay_order_id: order.id,
        amount: quote.amountMinor,
        currency: quote.currency,
        mindrain_fee: quote.amountMinor, // full amount goes to mindrain initially
        tax: 0,
        status: 'created',
        original_amount: quote.originalAmountMinor,
        discount_amount: quote.discountMinor,
        coupon_code: applied?.code ?? null,
        // Points are fixed now, at the price the payer agreed to, and credited on capture.
        referral_id: applied?.referralId ?? null,
        referral_points: applied?.points ?? 0,
      })
      .select('payment_id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment insert error:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Multi-order projects: remember this order's size server-side so verify-payment can credit it.
    if (quote.order) {
      const saved = await mutateFormData(supabase, registration_id, stored => ({
        ...stored,
        orders: [
          ...readOrders(stored),
          {
            payment_id: payment.payment_id,
            quantity: quote.order!.quantity,
            breakdown: quote.order!.groups
              ? Object.fromEntries(quote.order!.groups.map(g => [g.key, g.count]))
              : undefined,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ],
      }));
      if (!saved.ok) {
        console.error('Failed to record pending order:', saved.error);
        await supabase.from('payments_v3').update({ status: 'failed' }).eq('payment_id', payment.payment_id);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
    }

    // Save the payment-page choices (e.g. accommodation) into the form. verify-payment re-saves the
    // choice this payment was actually priced with, in case another order was started meanwhile.
    if (Object.keys(chosenOptions).length > 0) {
      const saved = await mutateFormData(supabase, registration_id, stored => withFormValues(eventId, stored, chosenOptions));
      if (!saved.ok) console.error('Failed to save payment options:', saved.error);
    }

    if (applied?.referralId) {
      await supabase.from('registrations_v3').update({ referral_used: applied.referralId }).eq('id', registration_id);
    }

    return NextResponse.json({
      razorpay_order_id: order.id,
      payment_id: payment.payment_id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      description: quote.description,
      event_title: quote.eventTitle,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
