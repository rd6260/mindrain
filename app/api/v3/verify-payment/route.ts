import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ServerClient } from 'postmark';


const postmark = new ServerClient(process.env.POSTMARK_API_KEY || '');

// ─── Flexible Invoice Email ──────────────────────────────────────────────────

function formatFormDataRows(formData: Record<string, any>): string {
  if (!formData || typeof formData !== 'object') return '';

  const skipKeys = ['referral_code']; // Don't show in invoice
  let html = '';

  for (const [key, value] of Object.entries(formData)) {
    if (skipKeys.includes(key)) continue;

    const label = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    if (Array.isArray(value)) {
      // Handle members array
      html += `<tr><td colspan="2" style="padding: 12px 16px; background: #f0f4f4; font-weight: 600; color: #2C5F5F; font-size: 14px;">${label}</td></tr>`;
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          html += `<tr><td colspan="2" style="padding: 8px 16px 4px; font-size: 12px; color: #888; font-weight: 600;">Member ${idx + 1}</td></tr>`;
          for (const [k, v] of Object.entries(item)) {
            const memberLabel = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            html += `<tr>
              <td style="padding: 6px 16px 6px 32px; color: #666; font-size: 13px; width: 40%;">${memberLabel}</td>
              <td style="padding: 6px 16px; color: #333; font-size: 13px;">${v}</td>
            </tr>`;
          }
        } else {
          html += `<tr><td colspan="2" style="padding: 4px 16px; color: #333; font-size: 13px;">${item}</td></tr>`;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      html += `<tr><td colspan="2" style="padding: 12px 16px; background: #f0f4f4; font-weight: 600; color: #2C5F5F; font-size: 14px;">${label}</td></tr>`;
      for (const [k, v] of Object.entries(value)) {
        const subLabel = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        html += `<tr>
          <td style="padding: 6px 16px 6px 32px; color: #666; font-size: 13px; width: 40%;">${subLabel}</td>
          <td style="padding: 6px 16px; color: #333; font-size: 13px;">${v}</td>
        </tr>`;
      }
    } else {
      html += `<tr>
        <td style="padding: 10px 16px; color: #666; font-size: 13px; border-bottom: 1px solid #f0f0f0; width: 40%;">${label}</td>
        <td style="padding: 10px 16px; color: #333; font-size: 13px; font-weight: 500; border-bottom: 1px solid #f0f0f0;">${value}</td>
      </tr>`;
    }
  }
  return html;
}

async function sendInvoiceEmail(
  userEmail: string,
  eventTitle: string,
  teamId: string,
  formData: Record<string, any>,
  paymentInfo: {
    amount: number;
    currency: string;
    razorpay_payment_id?: string;
    method?: string;
  },
  status: 'captured' | 'failed'
) {
  try {
    const currencySymbol = paymentInfo.currency === 'INR' ? '₹' : '$';
    const displayAmount = (paymentInfo.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const statusColor = status === 'captured' ? '#2C5F5F' : '#C85D3E';
    const statusLabel = status === 'captured' ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#2C5F5F;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;font-weight:700;">MINDRAIN</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Payment Receipt</p>
    </div>

    <div style="padding:32px;">
      <!-- Status + Amount -->
      <div style="text-align:center;padding-bottom:24px;border-bottom:2px dashed #e5e3d7;margin-bottom:24px;">
        <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${statusColor};letter-spacing:1px;">${statusLabel}</span>
        <div style="font-size:36px;font-weight:800;color:#1A1A1A;margin:12px 0 4px;">${currencySymbol}${displayAmount}</div>
        <p style="margin:0;color:#6B6B6B;font-size:14px;">for <strong>${eventTitle}</strong></p>
      </div>

      <!-- Transaction Details -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;width:40%;">Team ID</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:600;text-align:right;">${teamId}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Transaction ID</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${paymentInfo.razorpay_payment_id || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Payment Method</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${paymentInfo.method || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Date & Time</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${timestamp}</td>
        </tr>
      </table>

      <!-- Registration Details (dynamic from form_data) -->
      <div style="font-size:15px;color:#2C5F5F;font-weight:700;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #2C5F5F;display:inline-block;">Registration Details</div>
      <table style="width:100%;border-collapse:collapse;background:#fafaf7;border-radius:8px;overflow:hidden;border:1px solid #e5e3d7;">
        ${formatFormDataRows(formData)}
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#fafaf7;padding:20px 32px;text-align:center;border-top:1px solid #e5e3d7;">
      <p style="margin:0 0 4px;color:#888;font-size:12px;">Questions? Contact <a href="mailto:support@mindrain.org" style="color:#2C5F5F;">support@mindrain.org</a></p>
      <p style="margin:0;color:#aaa;font-size:11px;">© ${new Date().getFullYear()} MindRain. All rights reserved.</p>
    </div>
  </div>
</body></html>`;

    await postmark.sendEmail({
      From: 'invoices@mindrain.org',
      To: userEmail,
      Subject: `MindRain — Payment Receipt [${teamId}]`,
      HtmlBody: htmlBody,
    });
  } catch (err) {
    console.error('Failed to send invoice email:', err);
    // Don't throw — invoice failure shouldn't break the payment flow
  }
}

// ─── POST Handler ────────────────────────────────────────────────────────────

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

    // Verify HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_ID!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Fetch registration data for invoice
    const { data: registration } = await supabase
      .from('registrations_v3')
      .select('id, team_id, form_data, event_id, events(title)')
      .eq('id', registration_id)
      .single();

    const eventTitle = (registration as any)?.events?.title || 'Event';

    if (expectedSig !== razorpay_signature) {
      // Signature verification failed
      await supabase
        .from('payments_v3')
        .update({
          status: 'failed',
          razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', payment_id);

      // Send failure invoice
      if (registration) {
        const { data: paymentData } = await supabase
          .from('payments_v3')
          .select('amount, currency')
          .eq('payment_id', payment_id)
          .single();

        await sendInvoiceEmail(
          user.email!,
          eventTitle,
          registration.team_id,
          registration.form_data,
          {
            amount: paymentData?.amount || 0,
            currency: paymentData?.currency || 'INR',
            razorpay_payment_id,
          },
          'failed'
        );
      }

      return NextResponse.json(
        { message: 'Payment verification failed', isOk: false },
        { status: 400 }
      );
    }

    // Signature verified — fetch payment details from Razorpay
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

    // Update payment record
    const { error: updatePaymentError } = await supabase
      .from('payments_v3')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        method: rzpPayment?.method || null,
        razorpay_fee: rzpPayment?.fee || null,
        tax: rzpPayment?.tax || null,
        status: 'captured',
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
    const { error: updateRegError } = await supabase
      .from('registrations_v3')
      .update({ paid: true })
      .eq('id', registration_id);

    if (updateRegError) {
      console.error('Error updating registration:', updateRegError);
      return NextResponse.json(
        { message: 'Failed to update registration status', isOk: false },
        { status: 500 }
      );
    }

    // Send success invoice email
    if (registration) {
      const { data: paymentData } = await supabase
        .from('payments_v3')
        .select('amount, currency')
        .eq('payment_id', payment_id)
        .single();

      await sendInvoiceEmail(
        user.email!,
        eventTitle,
        registration.team_id,
        registration.form_data,
        {
          amount: paymentData?.amount || 0,
          currency: paymentData?.currency || 'INR',
          razorpay_payment_id,
          method: rzpPayment?.method || undefined,
        },
        'captured'
      );
    }

    return NextResponse.json(
      { message: 'Payment verified successfully', isOk: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { message: 'Payment verification failed', isOk: false },
      { status: 500 }
    );
  }
}
