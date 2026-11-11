export type MailResult = { emailStatus: 'sent' | 'failed' | 'skipped'; emailError: string; emailSentAt: Date | null; providerId: string };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function emailConfigured() { return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.EMAIL_TO); }
export async function sendMail(subject: string, text: string, replyTo?: string, idempotencyKey?: string): Promise<MailResult> {
  const result: MailResult = { emailStatus: 'skipped', emailError: '', emailSentAt: null, providerId: '' };
  if (!emailConfigured()) return { ...result, emailError: 'Set RESEND_API_KEY, EMAIL_FROM and EMAIL_TO.' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [process.env.EMAIL_TO], ...(replyTo ? { reply_to: replyTo } : {}), subject: subject.replace(/[\r\n]/g, ' ').slice(0, 180), text, html: `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>` }),
    });
    const body = await response.json() as { id?: string; message?: string };
    if (!response.ok || !body.id) return { ...result, emailStatus: 'failed', emailError: (body.message || `Provider returned HTTP ${response.status}`).slice(0, 300) };
    return { ...result, emailStatus: 'sent', emailSentAt: new Date(), providerId: body.id };
  } catch { return { ...result, emailStatus: 'failed', emailError: 'Email provider could not be reached.' }; }
}
export async function mailBrief(m: { id: string; name: string; email: string; topic: string; budget: string; brief: string }, attempt = 'initial') {
  return sendMail(`Hash Decode: project brief from ${m.name}`, `Name: ${m.name}\nEmail: ${m.email}\nService: ${m.topic}\nBudget: ${m.budget}\n\n${m.brief}\n\nReference: ${m.id}`, m.email, `brief-${m.id}-${attempt}`);
}
