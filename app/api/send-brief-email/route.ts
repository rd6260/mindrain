import { NextRequest, NextResponse } from 'next/server';
import { getCompetitionBriefFiles, getCompetitionMeta } from '@/data/competitionBriefFiles';
import { createClient } from '@/lib/supabase/server';


export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, eventId } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const briefFiles = getCompetitionBriefFiles(eventId);
    const meta = getCompetitionMeta(eventId);

    if (!briefFiles || briefFiles.length === 0) {
      return NextResponse.json({ error: 'No brief files found for this competition' }, { status: 404 });
    }

    if (!meta) {
      return NextResponse.json({ error: 'No metadata found for this competition' }, { status: 404 });
    }

    // Store email in Supabase — ignore if duplicate (unique constraint)
    const { error: dbError } = await supabase
      .from('brief_emails')
      .insert({ email, event_id: eventId })
      .select()
      .single();

    if (dbError && dbError.code !== '23505') {
      // 23505 = unique_violation (email already exists) — that's fine, still send the email
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ error: 'Failed to store email' }, { status: 500 });
    }

    // Build HTML list of download links
    const linkListHtml = briefFiles
      .map(
        (f) =>
          `<li style="margin-bottom:8px;"><a href="${f.url}" style="color:#2C5F5F;font-weight:600;">${f.name}</a></li>`
      )
      .join('');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background:#F8F7F2; margin:0; padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F2; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2C5F5F,#3d8080); padding:32px 48px 28px;">
            <img
              src="https://cdn.jsdelivr.net/gh/rd6260/mindrain@main/public/icons/mind-rain-logo.svg"
              alt="Mind Rain"
              width="140"
              style="display:block; margin-bottom:20px; filter: brightness(0) invert(1);"
            />
            <p style="margin:0 0 8px; font-size:12px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.7);">${meta.category} · ${meta.edition}</p>
            <h1 style="margin:0; font-size:36px; font-weight:900; color:#ffffff; line-height:1.1;">${meta.title}</h1>
            <p style="margin:8px 0 0; font-size:15px; color:rgba(255,255,255,0.8);">${meta.subtitle}</p>
          </td>
        </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 24px; font-size:16px; color:#4a4a4a; line-height:1.6;">
                Thanks for your interest in <strong>${meta.title}</strong>. Here are your brief documents — click any link below to download:
              </p>
              <ul style="padding-left:20px; margin:0 0 32px; color:#4a4a4a; font-size:15px; line-height:1.8;">
                ${linkListHtml}
              </ul>
              <p style="margin:0 0 24px; font-size:15px; color:#6b6b6b; line-height:1.6;">
                Ready to participate? Register now and join architecture students from across the globe.
              </p>
              <a href="${meta.registrationUrl}" style="display:inline-block; background:linear-gradient(135deg,#2C5F5F,#3d8080); color:#ffffff; font-weight:700; font-size:15px; padding:14px 32px; border-radius:8px; text-decoration:none;">
                Register Now →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F8F7F2; padding:32px 48px; border-top:1px solid #e5e3d7;">

              <!-- Socials -->
              <p style="margin:0 0 16px; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9b9b9b;">Connect with us</p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 8px 12px 0;">
                    <a href="mailto:support@mindrain.org" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/outline/mail.svg" width="16" height="16" alt="" style="opacity:0.7;" />
                      Email
                    </a>
                  </td>
                  <td style="padding:0 8px 12px 0;">
                    <a href="https://wa.me/919988822776" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width="16" height="16" alt="" style="opacity:0.7; filter:invert(27%) sepia(60%) saturate(400%) hue-rotate(120deg);" />
                      WhatsApp
                    </a>
                  </td>
                  <td style="padding:0 8px 12px 0;">
                    <a href="https://www.instagram.com/mind_rain?igsh=OXZyNGo5ZHpzeDMz" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" width="16" height="16" alt="" style="opacity:0.7; filter:invert(27%) sepia(60%) saturate(400%) hue-rotate(120deg);" />
                      Instagram
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 8px 0 0;">
                    <a href="https://whatsapp.com/channel/0029VbBdx7WICVfm5K8Kis3P" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width="16" height="16" alt="" style="opacity:0.7; filter:invert(27%) sepia(60%) saturate(400%) hue-rotate(120deg);" />
                      WhatsApp Channel
                    </a>
                  </td>
                  <td style="padding:0 8px 0 0;">
                    <a href="https://discord.gg/ww8BjY8Nb6" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg" width="16" height="16" alt="" style="opacity:0.7; filter:invert(27%) sepia(60%) saturate(400%) hue-rotate(120deg);" />
                      Discord
                    </a>
                  </td>
                  <td style="padding:0 8px 0 0;">
                    <a href="https://t.me/mindrain_arch" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#2C5F5F; font-size:13px; font-weight:600;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/telegram.svg" width="16" height="16" alt="" style="opacity:0.7; filter:invert(27%) sepia(60%) saturate(400%) hue-rotate(120deg);" />
                      Telegram
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Legal -->
              <p style="margin:0; font-size:12px; color:#9b9b9b; line-height:1.6;">
                You received this email because you requested the competition brief from mindrain.org.<br>
                © Mind Rain Competitions · <a href="mailto:support@mindrain.org" style="color:#2C5F5F;">support@mindrain.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


    const textBody = `
${meta.title} — Competition Brief
${meta.category} · ${meta.edition}

Thanks for your interest! Here are your brief download links:

${briefFiles.map((f) => `• ${f.name}: ${f.url}`).join('\n')}

Register at: ${meta.registrationUrl}

—
Mind Rain Competitions · support@mindrain.org
    `.trim();

    // Send via Postmark
    const postmarkRes = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: 'Mind Rain <no-reply@mindrain.org>',
        To: email,
        Subject: `${meta.title} — Your Competition Brief`,
        HtmlBody: htmlBody,
        TextBody: textBody,
        MessageStream: 'outbound',
      }),
    });

    if (!postmarkRes.ok) {
      const errBody = await postmarkRes.json();
      console.error('Postmark error:', errBody);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
