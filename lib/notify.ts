import { runtime } from '@/lib/abuse';

const DEFAULT_OWNER_EMAIL = 'shaahrozdogar@gmail.com';

function cleanEnvEmail(val: string | undefined): string {
  if (!val) return '';
  return val.replace(/^['"]|['"]$/g, '').trim();
}

export async function mailBrief(m: {
  id: string;
  name: string;
  email: string;
  topic: string;
  budget: string;
  brief: string;
}) {
  const key = runtime('RESEND_API_KEY');
  const configuredFrom = cleanEnvEmail(runtime('RESEND_FROM')) || cleanEnvEmail(runtime('MAIL_FROM'));
  // Use formatted sender with verified domain fallback
  const from = configuredFrom && configuredFrom.includes('@')
    ? (configuredFrom.includes('<') ? configuredFrom : `Hash Decode <${configuredFrom}>`)
    : 'Hash Decode <onboarding@resend.dev>';

  const to =
    cleanEnvEmail(runtime('ADMIN_NOTIFICATION_EMAIL')) ||
    cleanEnvEmail(runtime('MAIL_TO')) ||
    cleanEnvEmail(runtime('STUDIO_OWNER_EMAIL')) ||
    DEFAULT_OWNER_EMAIL;

  if (!key) {
    console.warn('[Resend] RESEND_API_KEY is not configured.');
    return 'not configured';
  }

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
    const result = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok) {
      console.error('[Resend Error]:', r.status, result);
      return 'failed';
    }
    console.log('[Resend Success]: Brief notification delivered to', to, 'ID:', result.id);
    return 'accepted';
  } catch (err) {
    console.error('[Resend Exception]:', err);
    return 'failed';
  }
}

export async function mailSubscriber(email: string) {
  const key = runtime('RESEND_API_KEY');
  const configuredFrom = cleanEnvEmail(runtime('RESEND_FROM')) || cleanEnvEmail(runtime('MAIL_FROM'));
  const from = configuredFrom && configuredFrom.includes('@')
    ? (configuredFrom.includes('<') ? configuredFrom : `Hash Decode <${configuredFrom}>`)
    : 'Hash Decode <onboarding@resend.dev>';

  const to =
    cleanEnvEmail(runtime('ADMIN_NOTIFICATION_EMAIL')) ||
    cleanEnvEmail(runtime('MAIL_TO')) ||
    cleanEnvEmail(runtime('STUDIO_OWNER_EMAIL')) ||
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
