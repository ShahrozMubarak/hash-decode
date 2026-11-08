import { getDb } from '@/db';
import { projects, settings, content } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getMongoProjects, getMongoSetting, getMongoContent } from '@/lib/mongodb';

export type Project = typeof projects.$inferSelect;

export const concepts: Project[] = [
  {
    slug: 'orbit-console',
    tech: 'React, TypeScript, Real-time Charts',
    result:
      'A live interactive dashboard that lets you monitor your app and server activity with instant updates.',
    title: 'Orbit Console',
    category: 'Web application',
    summary: 'A clean live monitoring dashboard to watch your system work in real time.',
    challenge:
      'Teams need a fast, simple way to see live system performance without getting lost in complicated graphs.',
    solution:
      'Orbit combines live metrics, easy-to-read charts, and quick controls into one simple, beautiful dashboard.',
    url: '',
    image: '',
    art: 'orbit',
    status: 'published',
    position: 10,
    kind: 'Studio project',
  },
  {
    slug: 'relay-board',
    tech: 'React, TypeScript, Drag-and-Drop',
    result:
      'A streamlined team task board where you can create, assign, and finish tasks with zero confusion.',
    title: 'Relay Board',
    category: 'Internal tool',
    summary: 'A simple team task board for organizing projects from idea to completion.',
    challenge:
      'Daily project tasks often get lost in long chat threads and messy spreadsheets.',
    solution:
      'Relay gives every task a clear status and next step so everyone on the team knows what to do.',
    url: '',
    image: '',
    art: 'relay',
    status: 'published',
    position: 20,
    kind: 'Studio project',
  },
];

export const defaults = {
  intro:
    'Custom software, web platforms and security reviews for teams building their next release.',
  about:
    'Hash Decode is a software design and engineering studio. We work across the interface, the data behind it and the tools a team needs to keep it running.',
};

export async function listProjects(all = false) {
  const [localRows, mongoRows] = await Promise.all([
    getDb()
      .select()
      .from(projects)
      .catch(() => [] as Project[]),
    getMongoProjects().catch(() => [] as Project[]),
  ]);
  const map = new Map<string, Project>(concepts.map((p) => [p.slug, p]));
  for (const p of mongoRows) {
    map.set(p.slug, p);
  }
  for (const p of localRows) {
    map.set(p.slug, p);
  }
  return [...map.values()]
    .filter((p) => (all ? p.status !== 'deleted' : p.status === 'published'))
    .sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
}

export async function studioCopy() {
  try {
    const row = await getDb()
      .select()
      .from(settings)
      .where(eq(settings.id, 'public'))
      .get();
    if (row?.value) {
      return { ...defaults, ...JSON.parse(row.value) } as typeof defaults;
    }
  } catch {}
  try {
    const mongoVal = await getMongoSetting('public');
    if (mongoVal) {
      return { ...defaults, ...JSON.parse(mongoVal) } as typeof defaults;
    }
  } catch {}
  return defaults;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  url?: string;
  skills: string[];
  quote?: string;
  position: number;
}

export const defaultFounders: Founder[] = [
  {
    id: 'shahroz-dogar',
    name: 'Shahroz Dogar',
    role: 'Co-Founder & Lead Systems Architect',
    bio: 'Oversees distributed systems architecture, high-concurrency cloud deployments, and zero-trust security frameworks. Leads technical direction and end-to-end delivery for all enterprise platforms.',
    quote:
      'Software must be built for the real human workflows it powers, with uncompromising speed and mathematical safety.',
    skills: ['Systems Architecture', 'Cloudflare Workers', 'Distributed Systems', 'Security Audits'],
    image: '/team/shahroz.svg',
    url: 'https://hashdecode.com',
    position: 1,
  },
  {
    id: 'hamza-malik',
    name: 'Hamza Malik',
    role: 'Co-Founder & Head of Product Design',
    bio: 'Shapes intuitive interaction models, real-time 3D visualizations, and precision design systems. Bridges aesthetic elegance with tactile, latency-free digital response.',
    quote:
      'Simplicity is not the absence of clutter, but the mastery of clarity and frictionless visual flow.',
    skills: ['Product Design', 'WebGL & Three.js', 'Design Systems', 'Micro-interactions'],
    image: '/team/hamza.svg',
    url: 'https://hashdecode.com',
    position: 2,
  },
  {
    id: 'zainab-tariq',
    name: 'Zainab Tariq',
    role: 'Co-Founder & Director of Security Audits',
    bio: 'Directs penetration testing, API vulnerability assessments, and defensive compliance. Ensures every database query, authentication token, and API boundary resists modern attack vectors.',
    quote:
      'Security is not a checkbox before launch; it is the fundamental foundation of software integrity.',
    skills: [
      'Penetration Testing',
      'API Vulnerability Review',
      'OWASP Standards',
      'Threat Modelling',
    ],
    image: '/team/zainab.svg',
    url: 'https://hashdecode.com',
    position: 3,
  },
  {
    id: 'daniyal-ahmed',
    name: 'Daniyal Ahmed',
    role: 'Co-Founder & Lead DevOps Engineer',
    bio: 'Engineers containerization pipelines, automated CI/CD releases, and global edge caching. Guarantees high availability, automated failovers, and sub-100ms response latencies globally.',
    quote:
      'Reliable infrastructure is invisible—it simply works without interruption, day in and day out.',
    skills: ['Cloud Infrastructure', 'Docker & Kubernetes', 'Edge Computing', 'Automated CI/CD'],
    image: '/team/daniyal.svg',
    url: 'https://hashdecode.com',
    position: 4,
  },
];

export async function listFounders(_all = false): Promise<Founder[]> {
  try {
    const [localRows, mongoRows] = await Promise.all([
      getDb()
        .select()
        .from(content)
        .where(eq(content.kind, 'team'))
        .catch(() => []),
      getMongoContent('team').catch(() => []),
    ]);
    const map = new Map<string, Founder>(defaultFounders.map((f) => [f.id, f]));
    const applyRow = (r: {
      id: string;
      title: string;
      label: string;
      body: string;
      image: string;
      url: string;
      status: string;
    }) => {
      if (r.status === 'deleted') {
        map.delete(r.id);
        return;
      }
      const existing = map.get(r.id);
      map.set(r.id, {
        id: r.id,
        name: r.title,
        role: r.label,
        bio: r.body,
        image: r.image || existing?.image || '/team/shahroz.svg',
        url: r.url || existing?.url || '',
        skills: existing?.skills || ['Software Engineering', 'System Architecture'],
        quote: existing?.quote || '',
        position: existing?.position || 99,
      });
    };
    mongoRows.forEach(applyRow);
    localRows.forEach(applyRow);
    return [...map.values()].sort(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name)
    );
  } catch {
    return defaultFounders;
  }
}

export const services = [
  {
    id: 'products',
    n: '01',
    name: 'Custom software',
    summary: 'From the first interaction to a shipped product.',
    detail:
      'We map the core user journey, prototype the difficult decisions and build responsive interfaces that are easy to learn.',
    tags: ['Discovery', 'Product design', 'Web apps'],
  },
  {
    id: 'platforms',
    n: '02',
    name: 'Web development',
    summary: 'Fast, accessible websites with a real content system.',
    detail:
      'We join a considered visual system to server-rendered pages, clear content models and publishing tools your team can operate.',
    tags: ['Websites', 'CMS', 'Performance'],
  },
  {
    id: 'tools',
    n: '03',
    name: 'Business systems',
    summary: 'Internal tools built around the way your team works.',
    detail:
      'We turn repeated manual steps into workflows, dashboards and integrations, with permissions and auditability designed in from the start.',
    tags: ['Internal tools', 'APIs', 'Automation'],
  },
  {
    id: 'security',
    n: '04',
    name: 'Security audits',
    summary: 'A practical review of the paths that put users and data at risk.',
    detail:
      'We agree on an authorized scope, review authentication, permissions, exposed inputs and deployment settings, then deliver reproducible findings, prioritized fixes and a retest plan.',
    tags: ['Threat modelling', 'App security', 'Remediation'],
  },
];
