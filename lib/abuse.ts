import { getDb } from './db';
import { sha256 } from './security-crypto.mjs';
import { HttpError } from './http';
export const runtime = (key: string): string => process.env[key] || '';
export function getClientIp(req: Request): string {
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if (vercelIp) return vercelIp;
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'local';
}
export const ipHash = (req: Request) => sha256(getClientIp(req));
export async function consumeLimit(key: string, max: number, period: number) {
  const db = await getDb(); const now = Date.now();
  const row = await db.collection('rateLimits').findOneAndUpdate(
    { key: sha256(key + ':' + Math.floor(now / period)) },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now + period * 2), createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  );
  return Boolean(row && row.count <= max);
}
export async function quota(req: Request, scope: string, max: number, period = 3600000) {
  return consumeLimit(scope + ':' + ipHash(req), max, period);
}
export async function enforceLimit(req: Request, scope: string, max: number, period = 3600000, email?: string) {
  const ipAllowed = await quota(req, scope, max, period);
  const emailAllowed = email ? await consumeLimit(scope + ':email:' + sha256(email), max, period) : true;
  if (!ipAllowed || !emailAllowed) throw new HttpError(429, 'RATE_LIMIT', 'Please wait before trying again.');
}
export const trafficSince = () => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
export async function loginIpLocked(req: Request) {
  const row = await (await getDb()).collection('rateLimits').findOne({ key: 'login-failure:' + ipHash(req) });
  return Boolean(row?.lockedUntil && new Date(row.lockedUntil).getTime() > Date.now());
}
export async function recordLoginIpFailure(req: Request) {
  const now = new Date();
  const row = await (await getDb()).collection('rateLimits').findOneAndUpdate({ key: 'login-failure:' + ipHash(req) }, [
    { $set: { scope: 'loginFailure', expiresAt: new Date(Date.now() + 86400000), failures: { $add: [{ $cond: [{ $gt: ['$lastFailureAt', new Date(Date.now() - 900000)] }, { $ifNull: ['$failures', 0] }, 0] }, 1] }, lastFailureAt: now } },
    { $set: { lockedUntil: { $cond: [{ $gte: ['$failures', 5] }, { $add: [now, { $multiply: [900000, { $pow: [2, { $min: [{ $ifNull: ['$level', 0] }, 4] }] }] }] }, '$lockedUntil'] }, level: { $cond: [{ $gte: ['$failures', 5] }, { $add: [{ $ifNull: ['$level', 0] }, 1] }, { $ifNull: ['$level', 0] }] } } }
  ], { upsert: true, returnDocument: 'after' });
  return row?.failures === 5;
}
