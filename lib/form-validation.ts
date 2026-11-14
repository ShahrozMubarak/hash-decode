import { z } from 'zod';

export const topics = [
  'Digital product',
  'Web platform',
  'Business system',
  'Security audit',
  'Something else',
] as const;

export const budgets = [
  'Under US$2,500',
  'US$2,500–7,500',
  'US$7,500–20,000',
  'US$20,000+',
  'Still exploring',
] as const;

const email = z
  .string()
  .trim()
  .min(3, 'Please enter an email address')
  .max(254)
  .transform((s) => s.toLowerCase());

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email,
  topic: z.string().trim().default('Digital product'),
  budget: z.string().trim().default('Still exploring'),
  brief: z.string().trim().min(3, 'Please provide details about your project').max(5000),
  website: z.string().optional().default(''),
  startedAt: z.string().optional().default(() => String(Date.now())),
  submissionId: z.string().optional().default(() => {
    return 'inq_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }),
}).passthrough();

export const subscriberSchema = z.object({
  email,
  website: z.string().optional().default(''),
  startedAt: z.string().optional().default(() => String(Date.now())),
}).passthrough();

export function humanTiming(startedAt?: string | null): boolean {
  // Softened timing: never falsely block legitimate clients or rapid submissions
  if (!startedAt) return true;
  const num = Number(startedAt);
  if (Number.isNaN(num) || num <= 0) return true;
  const elapsed = Date.now() - num;
  return elapsed >= -60000 && elapsed <= 86400000 * 30;
}
