import OwnerSession from '@/components/studio/OwnerSession';
import OwnerDashboard from '@/components/studio/OwnerDashboard';
import { requireOwner } from '@/lib/owner-session';
import { HttpError } from '@/lib/http';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  try { await requireOwner(); }
  catch (error) {
    if (error instanceof HttpError && error.status === 401) return <OwnerSession/>;
    return <><p role="alert" className="owner-notice">The owner workspace cannot reach its configured database. Check the environment variables and Atlas connection using DEPLOY.md.</p><OwnerSession/></>;
  }
  return <OwnerDashboard/>;
}
