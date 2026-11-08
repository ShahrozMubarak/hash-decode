import { runtime } from '@/lib/abuse';

const DEFAULT_OWNER_EMAIL = 'shaahrozdogar@gmail.com';

export async function mailBrief(m: {
  id: string;
  name: string;
  email: string;
  topic: string;
  budget: string;
  brief: string;
}) {
  const key = runtime('RESEND_API_KEY');
  const from = runtime('MAIL_FROM') || 'onboarding@resend.dev';
  const to =
    runtime('ADMIN_NOTIFICATION_EMAIL') ||
    runtime('MAIL_TO') ||
    runtime('STUDIO_OWNER_EMAIL') ||
    DEFAULT_OWNER_EMAIL;
  if (!key) return 'not configured';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(7000),
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'brief-' + m.id,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: m.email,
        subject: `Hash Decode · New project brief ${m.id.slice(0, 8)} (${m.name})`,
        text: `New Project Inquiry received on Hash Decode Studio:\n\nName: ${m.name}\nEmail: ${m.email}\nService: ${m.topic}\nBudget: ${m.budget}\n\nBrief:\n${m.brief}\n\nReference ID: ${m.id}`,
      }),
    });
    if (!r.ok) {
      const errBody = await r.text().catch(() => '');
      console.warn('[Resend API Error]:', r.status, errBody);
      return 'failed';
    }
    return 'accepted';
  } catch {
    return 'failed';
  }
}

export async function mailSubscriber(email: string) {
  const key = runtime('RESEND_API_KEY');
  const from = runtime('MAIL_FROM') || 'onboarding@resend.dev';
  const to =
    runtime('ADMIN_NOTIFICATION_EMAIL') ||
    runtime('MAIL_TO') ||
    runtime('STUDIO_OWNER_EMAIL') ||
    DEFAULT_OWNER_EMAIL;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(7000),
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'sub-' + Date.now() + '-' + email.slice(0, 10),
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Hash Decode · New subscriber: ${email}`,
        text: `A visitor subscribed to updates on Hash Decode Studio:\n\nSubscriber Email: ${email}\nTime: ${new Date().toISOString()}`,
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
