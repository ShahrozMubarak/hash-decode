import { adminAccess, sameOrigin } from '@/lib/studio-security';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function hasValidRasterSignature(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) return false;
  // JPEG: FF D8 FF
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mime === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  // GIF: GIF87a or GIF89a
  if (mime === 'image/gif') {
    return (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    );
  }
  // WebP: RIFF....WEBP
  if (mime === 'image/webp') {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  // AVIF: ....ftypavif / ftypavis / ftypmif1
  if (mime === 'image/avif') {
    return (
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70
    );
  }
  return false;
}

function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Untrusted request.' }, { status: 403 });
  if (!(await adminAccess(req)).allowed) {
    return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ error: 'No file provided.' }, { status: 400 });

    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_IMAGE_MIMES.has(mime)) {
      return Response.json(
        { error: 'Please select a JPEG, PNG, WebP, GIF or AVIF image file.' },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image file is too large (max 5MB).' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!hasValidRasterSignature(bytes, mime)) {
      return Response.json({ error: 'Invalid or corrupted image file.' }, { status: 400 });
    }

    const normalizedMime = mime === 'image/jpg' ? 'image/jpeg' : mime;
    const base64 = uint8ToBase64(bytes);
    const dataUrl = `data:${normalizedMime};base64,${base64}`;

    return Response.json({ ok: true, url: dataUrl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Could not upload file.' }, { status: 500 });
  }
}
