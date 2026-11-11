import { requireOwner } from './owner-session';
import { assertOrigin, readJson } from './http';
export async function adminAccess(request?: Request) {
 try { await requireOwner(request); return { allowed: true }; } catch { return { allowed: false }; }
}
export function bounded(value: unknown, max: number, min = 0) {
  if (typeof value !== 'string') {
    throw new Error('Check the required fields and their lengths.');
  }
  // Strip null bytes and dangerous control characters while preserving tabs and newlines
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (cleaned.length < min || cleaned.length > max) {
    throw new Error('Check the required fields and their lengths.');
  }
  return cleaned;
}

export function httpsUrl(value: unknown) {
  const s = bounded(value, 2048);
  if (!s) return '';
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new Error('Enter a full HTTPS website address.');
  }
  if (u.protocol !== 'https:' || u.username || u.password) {
    throw new Error('Use an HTTPS address without embedded credentials.');
  }
  return u.href;
}

export function imageOrUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  if (!s) return '';
  if (s.startsWith('data:image/')) {
    // Only allow safe raster image formats in data URLs (block data:image/svg+xml XSS vector)
    if (!/^data:image\/(jpeg|jpg|png|webp|gif|avif);base64,[A-Za-z0-9+/=\s]+$/i.test(s)) {
      throw new Error('Only JPEG, PNG, WebP, GIF or AVIF uploaded images are allowed.');
    }
    if (s.length > 5 * 1024 * 1024) {
      throw new Error('Uploaded image is too large (max 5MB).');
    }
    return s;
  }
  if (s.startsWith('/') && !s.includes('//') && !s.includes('..') && !/[<>"'\\]/.test(s)) {
    return s;
  }
  return httpsUrl(s);
}

export function sameOrigin(req: Request) { try { assertOrigin(req); return true; } catch { return false; } }
export const readSmall = readJson;
