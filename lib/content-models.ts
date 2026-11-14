import { z } from 'zod';

export function normalizeImagePath(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw.trim();
  if (!s) return '';
  if (/^(https?:\/\/|data:image\/)/i.test(s)) return s;
  if (s.startsWith('/teams/')) return '/team/' + s.slice(7);
  if (s.startsWith('teams/')) return '/team/' + s.slice(6);
  if (s.startsWith('team/')) return '/' + s;
  if (s.startsWith('/')) return s;
  if (/^[a-zA-Z0-9_.-]+\.(jpeg|jpg|png|webp|avif|gif|svg)$/i.test(s)) {
    return '/team/' + s;
  }
  return '/' + s;
}

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const text = (max: number) => z.string().trim().max(max);
const url = z.string().max(2048).refine(s => !s || /^https:\/\/[^\s]+$/.test(s), 'Use an HTTPS URL.');
export const image = z
  .string()
  .max(2048)
  .transform(normalizeImagePath)
  .refine(
    s =>
      !s ||
      /^\/(?!\/)[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp|avif|svg)$/i.test(s) ||
      /^https?:\/\/[^\s]+$/i.test(s) ||
      /^data:image\/[a-zA-Z0-9+.-]+;base64,/i.test(s),
    'Use a valid image path or URL (e.g. /team/foolisharc.jpeg, foolisharc.jpeg, or https://...).'
  );
export const projectSchema = z.object({ slug, title: text(100).min(2), category: text(80), summary: text(600), challenge: text(3000), solution: text(3000), tech: text(500), result: text(2000), url, image, art: z.enum(['grid', 'orbit', 'relay']).default('grid'), status: z.enum(['draft', 'published']), position: z.number().int().min(0).max(9999), kind: z.enum(['Studio concept', 'Client project']) }).strict();
export const founderSchema = z.object({ id: slug, name: text(100).min(2), role: text(120), bio: text(3000), image, url, skills: z.array(text(60)).max(12), quote: text(500), position: z.number().int().min(0).max(9999), status: z.enum(['draft', 'published']) }).strict();
export const postSchema = z.object({ id: slug, title: text(120).min(2), label: text(120), body: text(12000).min(8), url, image, status: z.enum(['draft', 'published']), publishAt: z.string().datetime({ offset: true }).nullable() }).strict();
export const settingsSchema = z.object({ intro: text(600), about: text(3000), contactEmail: z.union([z.literal(''), z.string().email()]), availability: z.enum(['Taking new projects', 'Limited availability', 'Unavailable']), whatsapp: url, booking: url, instagram: url, facebook: url, youtube: url, tiktok: url, linkedin: url }).strict();
export type ProjectRecord = z.infer<typeof projectSchema>;
export type FounderRecord = z.infer<typeof founderSchema>;
export type PostRecord = z.infer<typeof postSchema>;
