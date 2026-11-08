import '@/app/admin-dashboard.css';
import FoolishAdminDashboard from '@/components/studio/FoolishAdminDashboard';
import { getLinks, entries } from '@/lib/cms';
import { trafficSince } from '@/lib/abuse';
import AdminSessionGuard from '@/components/studio/AdminSessionGuard';
import OwnerSession from '@/components/studio/OwnerSession';
import { adminAccess } from '@/lib/studio-security';
import { getDb } from '@/db';
import { inquiries } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { listProjects, studioCopy, listFounders } from '@/lib/studio-data';
import { getMongoSyncStatus, getMongoInquiries, getAuditLogs } from '@/lib/mongodb';
import { getPlatformDb } from '@/lib/platform-db';
import { loadSubscribersList, loadInquiryNotesMap } from '@/app/api/admin/route';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Studio Command | Hash Decode Atelier',
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
      listProjects(true).catch(() => []),
      db
        .select()
        .from(inquiries)
        .orderBy(desc(inquiries.created))
        .limit(200)
        .catch(() => []),
      getMongoInquiries(200).catch(() => []),
      loadInquiryNotesMap().catch(() => new Map<string, string>()),
      studioCopy().catch(() => ({ intro: '', about: '' })),
      listFounders(true).catch(() => []),
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
    entries(undefined, true).catch(() => []),
    getLinks().catch(() => ({ whatsapp: '', booking: '' })),
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
    <>
      <AdminSessionGuard />
      <FoolishAdminDashboard
        initialProjects={projects}
        initialMessages={messages}
        initialCopy={copy}
        initialFounders={founders}
        initialSubscribers={subscribers}
        initialAuditLogs={auditLogs}
        initialMongoStatus={mongo}
        initialEntries={content}
        initialLinks={links}
        trafficStats={stats}
        totalViews={views}
      />
    </>
  );
}
