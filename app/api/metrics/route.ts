import { failure, HttpError } from '@/lib/http';
export async function POST() {
 try { throw new HttpError(503, 'FEATURE_UNAVAILABLE', 'This feature is unavailable. Please use the contact form.'); } catch (error) { return failure(error); }
}
