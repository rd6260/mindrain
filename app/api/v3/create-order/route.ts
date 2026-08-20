import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';



export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registration_id, amount, currency } = await req.json();

    if (!registration_id || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify registration exists, belongs to user, and is not paid
    const { data: registration, error: regError } = await supabase
      .from('registrations_v3')
      .select('id, paid, registration_by')
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.registration_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (registration.paid) {
      return NextResponse.json({ error: 'Registration already paid' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
      console.error('Razorpay keys missing:', { 
        hasKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        hasSecret: !!process.env.RAZORPAY_SECRET_ID 
      });
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim(),
      key_secret: (process.env.RAZORPAY_SECRET_ID || '').trim(),
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Math.floor(Date.now() / 1000)}`,
    });

    if (!order || !order.id) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    // Calculate fee breakdown (amount is in paisa/cents)
    const mindrain_fee = amount; // Full amount goes to mindrain initially

    // Insert payment record into payments_v3
    const { data: payment, error: paymentError } = await supabase
      .from('payments_v3')
      .insert({
        registration_id,
        razorpay_order_id: order.id,
        amount,
        currency,
        mindrain_fee,
        tax: 0,
        status: 'created',
      })
      .select('payment_id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment insert error:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    return NextResponse.json({
      razorpay_order_id: order.id,
      payment_id: payment.payment_id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
