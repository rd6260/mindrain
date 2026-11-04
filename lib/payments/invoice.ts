import { ServerClient } from 'postmark';

const postmark = new ServerClient(process.env.POSTMARK_API_KEY || '');

export interface InvoiceInput {
  to: string;
  eventTitle: string;
  teamId: string;
  formData: Record<string, any>;
  hiddenKeys?: string[];
  amountMinor: number;
  currency: string;
  razorpayPaymentId?: string;
  method?: string;
  status: 'captured' | 'failed';
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const prettyKey = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const sectionRow = (label: string) =>
  `<tr><td colspan="2" style="padding: 12px 16px; background: #f0f4f4; font-weight: 600; color: #2C5F5F; font-size: 14px;">${esc(label)}</td></tr>`;

const nestedRow = (k: string, v: unknown) => `<tr>
  <td style="padding: 6px 16px 6px 32px; color: #666; font-size: 13px; width: 40%;">${esc(prettyKey(k))}</td>
  <td style="padding: 6px 16px; color: #333; font-size: 13px;">${esc(v)}</td>
</tr>`;

/** Renders any `form_data` shape, so new projects need no invoice code. */
function formDataRows(formData: Record<string, any>, hidden: string[]): string {
  let html = '';
  for (const [key, value] of Object.entries(formData ?? {})) {
    if (hidden.includes(key)) continue;
    const label = prettyKey(key);

    if (Array.isArray(value)) {
      html += sectionRow(label);
      value.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          html += `<tr><td colspan="2" style="padding: 8px 16px 4px; font-size: 12px; color: #888; font-weight: 600;">${esc(label)} ${idx + 1}</td></tr>`;
          for (const [k, v] of Object.entries(item)) html += nestedRow(k, v);
        } else {
          html += `<tr><td colspan="2" style="padding: 4px 16px; color: #333; font-size: 13px;">${esc(item)}</td></tr>`;
        }
      });
    } else if (value && typeof value === 'object') {
      html += sectionRow(label);
      for (const [k, v] of Object.entries(value)) html += nestedRow(k, v);
    } else {
      html += `<tr>
        <td style="padding: 10px 16px; color: #666; font-size: 13px; border-bottom: 1px solid #f0f0f0; width: 40%;">${esc(label)}</td>
        <td style="padding: 10px 16px; color: #333; font-size: 13px; font-weight: 500; border-bottom: 1px solid #f0f0f0;">${esc(value)}</td>
      </tr>`;
    }
  }
  return html;
}

export async function sendInvoiceEmail(i: InvoiceInput) {
  try {
    const symbol = i.currency === 'INR' ? '₹' : '$';
    const amount = (i.amountMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const ok = i.status === 'captured';
    const statusColor = ok ? '#2C5F5F' : '#C85D3E';
    const statusLabel = ok ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#2C5F5F;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:2px;font-weight:700;">MINDRAIN</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Payment Receipt</p>
    </div>
    <div style="padding:32px;">
      <div style="text-align:center;padding-bottom:24px;border-bottom:2px dashed #e5e3d7;margin-bottom:24px;">
        <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${statusColor};letter-spacing:1px;">${statusLabel}</span>
        <div style="font-size:36px;font-weight:800;color:#1A1A1A;margin:12px 0 4px;">${symbol}${amount}</div>
        <p style="margin:0;color:#6B6B6B;font-size:14px;">for <strong>${esc(i.eventTitle)}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;width:40%;">Team ID</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:600;text-align:right;">${esc(i.teamId)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Transaction ID</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${esc(i.razorpayPaymentId || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Payment Method</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${esc(i.method || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #f0f0f0;">Date & Time</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:13px;font-weight:500;text-align:right;border-top:1px solid #f0f0f0;">${esc(timestamp)}</td>
        </tr>
      </table>
      <div style="font-size:15px;color:#2C5F5F;font-weight:700;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #2C5F5F;display:inline-block;">Registration Details</div>
      <table style="width:100%;border-collapse:collapse;background:#fafaf7;border-radius:8px;overflow:hidden;border:1px solid #e5e3d7;">
        ${formDataRows(i.formData, ['referral_code', ...(i.hiddenKeys ?? [])])}
      </table>
    </div>
    <div style="background:#fafaf7;padding:20px 32px;text-align:center;border-top:1px solid #e5e3d7;">
      <p style="margin:0 0 4px;color:#888;font-size:12px;">Questions? Contact <a href="mailto:support@mindrain.org" style="color:#2C5F5F;">support@mindrain.org</a></p>
      <p style="margin:0;color:#aaa;font-size:11px;">© ${new Date().getFullYear()} MindRain. All rights reserved.</p>
    </div>
  </div>
</body></html>`;

    await postmark.sendEmail({
      From: 'invoices@mindrain.org',
      To: i.to,
      Subject: `MindRain — Payment Receipt [${i.teamId}]`,
      HtmlBody: htmlBody,
    });
  } catch (err) {
    // Invoice failure must never break the payment flow.
    console.error('Failed to send invoice email:', err);
  }
}
