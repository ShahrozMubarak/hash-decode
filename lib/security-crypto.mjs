import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const randomToken = () => randomBytes(32).toString('hex');
export const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && timingSafeEqual(Buffer.from(sha256(a), 'hex'), Buffer.from(sha256(b), 'hex'));
const derive = (password, salt) => new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 14 || password.length > 256) throw Error('Use 14 to 256 characters.');
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const valid = typeof stored === 'string' && /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored);
  const [, salt, expected] = valid ? stored.split(':') : ['scrypt', '00'.repeat(16), '00'.repeat(64)];
  const key = await derive(typeof password === 'string' ? password.slice(0, 256) : '', salt);
  return timingSafeEqual(key, Buffer.from(expected, 'hex')) && valid;
}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newTotpSecret() {
  const bits = [...randomBytes(20)].map(b => b.toString(2).padStart(8, '0')).join('');
  return bits.match(/.{5}/g).map(b => alphabet[parseInt(b, 2)]).join('');
}
export function totp(secret, step = Math.floor(Date.now() / 30000)) {
  const bits = [...secret].map(c => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from(bits.match(/.{8}/g).map(b => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', key).update(counter).digest();
  const offset = digest[19] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
}
export function validTotpStep(secret, code, lastStep = -1, now = Date.now()) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const current = Math.floor(now / 30000);
  for (const step of [current, current - 1, current + 1]) if (step > lastStep && equal(totp(secret, step), code)) return step;
  return null;
}
function encryptionKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || !/^[a-f0-9]{64}$/i.test(hex)) throw Error('ENCRYPTION_KEY must be 32 random bytes in hex.');
  return Buffer.from(hex, 'hex');
}
export function encrypt(value) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const bytes = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), bytes].map(b => b.toString('base64')).join('.');
}
export function decrypt(value) {
  const [iv, tag, bytes] = value.split('.').map(b => Buffer.from(b, 'base64'));
  const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv); cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(bytes), cipher.final()]).toString('utf8');
}
export function recoveryCodes() { return Array.from({ length: 10 }, () => randomBytes(16).toString('hex')); }
