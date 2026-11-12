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
// //c76d87205782feb099b6307d4c6a721a
// e8bc25fd160565a358faa7b8225930f7
// 9feb76e76065d54a4ce1dcb1fa75a1d4
// 074a99e1a0703279c3ce98e052bda7ca
// debbdb44c22e8127cb4788ce5241e1dc
// 838eda734520ce5d43a72d6c813e7d27
// 642e1b8a050397366878f686faefc6a1
// a712a2f74de018657d03ad8bfded35f8
// 26c35ef9901e935926d147e1756f6704
// d9535c419984b0c3364357f7548cc9e8