import { failure, HttpError } from '@/lib/http';
import { requireOwner } from '@/lib/owner-session';
export async function POST(req: Request) {
 try { await requireOwner(req, true); throw new HttpError(503, 'FEATURE_UNAVAILABLE', 'This feature is unavailable. Please use the contact form.'); } catch (error) { return failure(error); }
}
