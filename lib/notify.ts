import { sendViaHttps } from './resend-dns-fallback';

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
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.MAIL_FROM;
  const to =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_TO ||
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
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM ||
    'Hash Decode <onboarding@resend.dev>';
  const to =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_TO ||
    process.env.STUDIO_OWNER_EMAIL ||
    'shaahrozdogar@gmail.com';

  if (!apiKey || !from || !to) {
    return { ...result, emailError: 'Set RESEND_API_KEY, RESEND_FROM and ADMIN_NOTIFICATION_EMAIL.' };
  }

  const cleanSubject = subject.replace(/[\r\n]/g, ' ').slice(0, 180);
  const htmlContent = customHtml || `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`;

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject: cleanSubject,
    text,
    html: htmlContent,
  };

  try {
    let body: { id?: string; message?: string } = {};
    let ok = false;
    let status = 0;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'resend-node:6.34.1',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      body = (await response.json()) as { id?: string; message?: string };
      ok = response.ok && Boolean(body.id);
      status = response.status;
    } catch (fetchErr) {
      // If fetch fails due to local router DNS failure (ENOTFOUND api.resend.com), fall back to HTTPS with public DNS
      if (
        typeof window === 'undefined' &&
        fetchErr instanceof Error &&
        (fetchErr.message.includes('ENOTFOUND') ||
          (fetchErr.cause as { code?: string })?.code === 'ENOTFOUND')
      ) {
        const fallback = await sendViaHttps(apiKey, payload, idempotencyKey);
        body = fallback.body;
        ok = fallback.ok && Boolean(body.id);
        status = fallback.status;
      } else {
        throw fetchErr;
      }
    }

    if (!ok || !body.id) {
      return {
        ...result,
        emailStatus: 'failed',
        emailError: (body.message || `Provider returned HTTP ${status}`).slice(0, 300),
      };
    }
    return { ...result, emailStatus: 'sent', emailSentAt: new Date(), providerId: body.id };
  } catch (err) {
    return {
      ...result,
      emailStatus: 'failed',
      emailError: (err instanceof Error ? err.message : 'Email provider could not be reached.').slice(0, 300),
    };
  }
}

export async function mailBrief(
  m: { id: string; name: string; email: string; topic: string; budget: string; brief: string },
  attempt = 'initial'
) {
  const safeName = escapeHtml(m.name);
  const safeEmail = escapeHtml(m.email);
  const safeTopic = escapeHtml(m.topic);
  const safeBudget = escapeHtml(m.budget);
  const safeBrief = escapeHtml(m.brief);
  const safeRef = escapeHtml(m.id.slice(0, 8).toUpperCase());

  const plainText = `Hash Decode New Project Inquiry\n\nClient Name: ${m.name}\nEmail: ${m.email}\nService Topic: ${m.topic}\nBudget Range: ${m.budget}\nReference ID: #${safeRef}\n\nProject Brief:\n${m.brief}\n`;

  // Foolish Arc concise card pattern: delivers directly without trigger words
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 2px solid #0B1F3A; border-radius: 10px; color: #0B1F3A;">
      <div style="border-bottom: 2px solid #0B1F3A; padding-bottom: 14px; margin-bottom: 18px;">
        <span style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #1E40AF; font-weight: 700;">HASH DECODE STUDIO</span>
        <h2 style="margin: 6px 0 0 0; color: #0B1F3A; font-size: 20px; font-weight: 700;">💌 New Project Inquiry</h2>
      </div>

      <p style="font-size: 14px; margin: 0 0 10px; line-height: 1.5;">
        <strong>From:</strong> ${safeName} (<a href="mailto:${safeEmail}" style="color: #1E40AF;">${safeEmail}</a>)
      </p>
      <p style="font-size: 14px; margin: 0 0 10px; line-height: 1.5;">
        <strong>Service Topic:</strong> ${safeTopic}
      </p>
      <p style="font-size: 14px; margin: 0 0 16px; line-height: 1.5;">
        <strong>Target Budget:</strong> <span style="color: #D93A2F; font-weight: 700;">${safeBudget}</span>
      </p>

      <div style="background: #f8fafc; border-left: 3px solid #0B1F3A; padding: 14px 18px; margin-bottom: 20px; border-radius: 6px; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">
        "${safeBrief}"
      </div>

      <div style="margin-top: 20px; text-align: center;">
        <a href="mailto:${safeEmail}?subject=RE: Hash Decode Project Inquiry (${safeTopic})"
           style="background: #0B1F3A; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 13px; display: inline-block;">
          Reply to ${safeName} &rarr;
        </a>
      </div>

      <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
        Hash Decode Studio &bull; Ref #${safeRef}
      </div>
    </div>
  `;

  // Mirror Foolish Arc: do NOT pass external reply_to on sandbox onboarding@resend.dev domain,
  // which causes Gmail SPF/DMARC flags. Rely on the direct mailto button in the email body.
  return sendMail(
    `💌 [New Project Inquiry] ${m.name} (${m.topic})`,
    plainText,
    undefined,
    `brief-${m.id}-${attempt}`,
    html
  );
}
