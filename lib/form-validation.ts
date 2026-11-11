import { z } from 'zod';
export const topics = ['Digital product', 'Web platform', 'Business system', 'Security audit', 'Something else'] as const;
export const budgets = ['Under US$2,500', 'US$2,500–7,500', 'US$7,500–20,000', 'US$20,000+', 'Still exploring'] as const;
const email = z.string().trim().email().max(254).transform(s => s.toLowerCase());
export const inquirySchema = z.object({ name: z.string().trim().min(2).max(100), email, topic: z.enum(topics), budget: z.enum(budgets), brief: z.string().trim().min(12).max(3000), website: z.literal('').optional(), startedAt: z.string().regex(/^\d{13}$/), submissionId: z.string().uuid() }).strict();
export const subscriberSchema = z.object({ email, website: z.literal('').optional(), startedAt: z.string().regex(/^\d{13}$/) }).strict();
export function humanTiming(startedAt: string) { const elapsed = Date.now() - Number(startedAt); return elapsed >= 2000 && elapsed <= 86400000; }
