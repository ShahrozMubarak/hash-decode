import EditorialAdmin from '@/components/studio/EditorialAdmin';
import { getLinks, entries } from '@/lib/cms';
import { runtime, trafficSince } from '@/lib/abuse';
import AdminSessionGuard from '@/components/studio/AdminSessionGuard';
import OwnerSession from '@/components/studio/OwnerSession';
import { adminAccess } from '@/lib/studio-security';
import { getDb } from '@/db';
import { inquiries } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { listProjects, studioCopy, listFounders } from '@/lib/studio-data';
import Admin from '@/components/studio/Admin';
import { getMongoSyncStatus, getMongoInquiries, getAuditLogs } from '@/lib/mongodb';
import { getPlatformDb } from '@/lib/platform-db';
import { loadSubscribersList, loadInquiryNotesMap } from '@/app/api/admin/route';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Studio Admin | Hash Decode',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { allowed } = await adminAccess();
  if (!allowed) {
    return (
      <div className="wrap interior owner-entry">
        <div className="owner-intro">
          <p className="kicker">
            <span className="key-line" />
            Hash Decode / Workspace
          </p>
          <h1>
            Owner
            <br />
            sign-in.
          </h1>
          <p>A private workspace for your studio.</p>
          <a className="text-link" href="/">
            Back to the studio ↗
          </a>
        </div>
        <OwnerSession />
      </div>
    );
  }

  const db = getDb();
  const platformDb = getPlatformDb();
  const [projects, d1Messages, mongoMessages, notesMap, copy, founders, subscribers, auditLogs] =
    await Promise.all([
      listProjects(true),
      db
        .select()
        .from(inquiries)
        .orderBy(desc(inquiries.created))
        .limit(200)
        .catch(() => []),
      getMongoInquiries(200).catch(() => []),
      loadInquiryNotesMap().catch(() => new Map<string, string>()),
      studioCopy(),
      listFounders(true),
      loadSubscribersList(500).catch(() => []),
      getAuditLogs(80).catch(() => []),
    ]);

  const messagesMap = new Map();
  for (const m of mongoMessages) {
    messagesMap.set(m.id, { ...m, notes: notesMap.get(m.id) || m.notes || '' });
  }
  for (const m of d1Messages) {
    const existing = messagesMap.get(m.id);
    messagesMap.set(m.id, {
      ...m,
      status: m.status || existing?.status || 'new',
      notes: notesMap.get(m.id) || existing?.notes || '',
    });
  }
  const messages = Array.from(messagesMap.values()).sort((a, b) => b.created - a.created);

  const [content, links, stats, mongo] = await Promise.all([
    entries(undefined, true),
    getLinks(),
    platformDb
      .prepare(
        'SELECT source,SUM(views) AS n FROM traffic_totals WHERE day>=? GROUP BY source ORDER BY n DESC'
      )
      .bind(trafficSince())
      .all<{ source: string; n: number }>()
      .catch(() => ({ results: [] })),
    getMongoSyncStatus().catch(() => ({
      configured: false,
      connected: false,
      dbName: '',
    })),
  ]);

  const views = stats.results.reduce((v: number, r: { n: number }) => v + r.n, 0);

  return (
    <div className="wrap interior admin-dashboard">
      <AdminSessionGuard />
      <div className="admin-top">
        <header className="page-intro compact">
          <p className="eyebrow">
            <i /> Owner workspace
          </p>
          <h1>
            Studio <em>admin.</em>
          </h1>
        </header>
        <OwnerSession logout />
      </div>
      <div className="dashboard-kpis">
        {[
          [projects.filter((p) => p.status === 'published').length, 'Published projects'],
          [messages.filter((m) => m.status === 'new').length, 'New briefs · recent 200'],
          [
            content.filter((x: any) => x.kind === 'post' && x.status === 'published').length,
            'Published notes',
          ],
          [views, 'Page views · 30 days'],
        ].map(([v, l]) => (
          <div key={l}>
            <span className="eyebrow">{l}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div className="stats-panel">
        <div>
          <p className="eyebrow">Acquisition / 30 days</p>
          <h3>Traffic sources</h3>
        </div>
        <div>
          {stats.results.length ? (
            stats.results.map((r: any) => (
              <div className="chart-row" key={r.source}>
                <span>{r.source}</span>
                <meter min={0} max={views || 1} value={r.n} />
                <b>{r.n}</b>
              </div>
            ))
          ) : (
            <p>Traffic appears as visitors use public pages.</p>
          )}
        </div>
      </div>
      <p className="system-note">
        Email notifications:{' '}
        {runtime('RESEND_API_KEY') &&
        (runtime('MAIL_TO') || runtime('STUDIO_OWNER_EMAIL') || runtime('ADMIN_NOTIFICATION_EMAIL'))
          ? 'configured'
          : 'not configured — inquiries are saved in the inbox'}
        . Human verification:{' '}
        {runtime('TURNSTILE_SECRET') && runtime('TURNSTILE_SITE_KEY')
          ? 'Cloudflare Turnstile'
          : 'one-time math challenge'}
        . MongoDB Atlas:{' '}
        {mongo.configured
          ? mongo.connected
            ? `connected (${mongo.dbName})`
            : 'configured (verifying connection)'
          : 'standby'}
        . Subscribers: {subscribers.length}.
      </p>
      <Admin
        initial={projects}
        messages={messages}
        copy={copy}
        initialFounders={founders}
        initialSubscribers={subscribers}
        initialAuditLogs={auditLogs}
        initialMongoStatus={mongo}
      />
      <EditorialAdmin initial={content} links={links} />
    </div>
  );
}
