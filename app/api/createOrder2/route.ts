import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/client';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET_ID as string,
});

const supabase = createClient();

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, registration_id } = await req.json();

    if (!amount || !currency || !registration_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Math.floor(Date.now() / 1000)}`,
    });

    // Calculate fee breakdown
    const actualAmount = amount / 100;
    const mindrain_fee = actualAmount;
    const tax = 0;

    // Create payment record in payments_2
    const { data: payment, error: paymentError } = await supabase
      .from('payments_2')
      .insert({
        registration_id: registration_id,
        razorpay_order_id: order.id,
        amount: actualAmount.toString(),
        currency: currency,
        mindrain_fee: mindrain_fee.toString(),
        tax: tax.toString(),
        status: 'created',
      })
      .select('payment_id')
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      razorpay_order_id: order.id,
      payment_id: payment.payment_id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
