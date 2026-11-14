export type MailResult = {
  emailStatus: 'sent' | 'failed' | 'skipped';
  emailError: string;
  emailSentAt: Date | null;
  providerId: string;
};

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c]!)
  );

export function emailConfigured() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM || process.env.MAIL_FROM;
  const to =
    process.env.EMAIL_TO ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.STUDIO_OWNER_EMAIL;
  return Boolean(apiKey && from && to);
}

export async function sendMail(
  subject: string,
  text: string,
  replyTo?: string,
  idempotencyKey?: string,
  customHtml?: string
): Promise<MailResult> {
  const result: MailResult = {
    emailStatus: 'skipped',
    emailError: '',
    emailSentAt: null,
    providerId: '',
  };

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    process.env.MAIL_FROM ||
    'Hash Decode <onboarding@resend.dev>';
  const to =
    process.env.EMAIL_TO ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.STUDIO_OWNER_EMAIL ||
    'shaahrozdogar@gmail.com';

  if (!apiKey || !from || !to) {
    return { ...result, emailError: 'Set RESEND_API_KEY, EMAIL_FROM and EMAIL_TO.' };
  }

  const cleanSubject = subject.replace(/[\r\n]/g, ' ').slice(0, 180);
  const htmlContent = customHtml || `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: cleanSubject,
        text,
        html: htmlContent,
      }),
    });

    const body = (await response.json()) as { id?: string; message?: string };
    if (!response.ok || !body.id) {
      return {
        ...result,
        emailStatus: 'failed',
        emailError: (body.message || `Provider returned HTTP ${response.status}`).slice(0, 300),
      };
    }
    return { ...result, emailStatus: 'sent', emailSentAt: new Date(), providerId: body.id };
  } catch {
    return { ...result, emailStatus: 'failed', emailError: 'Email provider could not be reached.' };
  }
}

export async function mailBrief(
  m: { id: string; name: string; email: string; topic: string; budget: string; brief: string },
  attempt = 'initial'
) {
  const plainText = `Hash Decode New Project Inquiry\n\nClient Name: ${m.name}\nEmail: ${m.email}\nService Topic: ${m.topic}\nBudget Range: ${m.budget}\nReference ID: ${m.id}\n\nProject Brief:\n${m.brief}\n`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #0B1F3A;">
      <div style="border-bottom: 2px solid #1E40AF; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0B1F3A; margin: 0 0 6px 0; font-size: 20px; font-weight: 700;">🚀 New Project Inquiry Received</h2>
        <p style="color: #64748b; margin: 0; font-size: 13px;">Hash Decode Studio Inbox &bull; Ref #${escapeHtml(m.id.slice(0, 8).toUpperCase())}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; width: 130px;"><strong>Client Name:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0B1F3A; font-size: 15px; font-weight: 600;">${escapeHtml(m.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;"><strong>Client Email:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1E40AF; font-size: 15px;">
            <a href="mailto:${escapeHtml(m.email)}" style="color: #1E40AF; text-decoration: none; font-weight: 600;">${escapeHtml(m.email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;"><strong>Service Topic:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0B1F3A; font-size: 14px;">${escapeHtml(m.topic)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;"><strong>Target Budget:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #D93A2F; font-size: 14px; font-weight: 600;">${escapeHtml(m.budget)}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border-radius: 8px; padding: 18px; border-left: 4px solid #1E40AF; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px 0; color: #0B1F3A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Project Brief:</h4>
        <div style="color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(m.brief)}</div>
      </div>

      <div style="text-align: center; padding-top: 12px;">
        <a href="mailto:${escapeHtml(m.email)}?subject=Re:%20Hash%20Decode%20Project%20Inquiry%20(${escapeHtml(m.topic)})"
           style="display: inline-block; background: #0B1F3A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 999px;">
          Reply to ${escapeHtml(m.name)} &rarr;
        </a>
      </div>
    </div>
  `;

  return sendMail(
    `Hash Decode: project brief from ${m.name} (${m.topic})`,
    plainText,
    m.email,
    `brief-${m.id}-${attempt}`,
    html
  );
}
