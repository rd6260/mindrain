import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const generatedSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string
) => {
  const keySecret = process.env.RAZORPAY_SECRET_ID as string;

  const sig = crypto
    .createHmac('sha256', keySecret)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
  return sig;
};

export async function POST(request: NextRequest) {
  try {
    const {
      registration_id,
      payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    // Verify signature
    const signature = generatedSignature(razorpay_order_id, razorpay_payment_id);
    
    if (signature !== razorpay_signature) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', payment_id);

      return NextResponse.json(
        { message: 'Payment verification failed', isOk: false },
        { status: 400 }
      );
    }

    // Signature verified successfully
    // Update payment record with payment details
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', payment_id);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
      return NextResponse.json(
        { message: 'Failed to update payment record', isOk: false },
        { status: 500 }
      );
    }

    // Update registration as paid
    const { error: updateRegistrationError } = await supabase
      .from('registrations')
      .update({ paid: true })
      .eq('id', registration_id);

    if (updateRegistrationError) {
      console.error('Error updating registration:', updateRegistrationError);
      return NextResponse.json(
        { message: 'Failed to update registration status', isOk: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Payment verified successfully', isOk: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: 'Payment verification failed', isOk: false },
      { status: 500 }
    );
  }
}
