import { getDb } from './db';
import type { ProjectRecord, FounderRecord } from './content-models';
import { requireOwner } from './owner-session';
export * from './studio-defaults';
import { defaultProjects, defaultFounders, type Project, type Founder } from './studio-defaults';

// In-memory high-speed cache for public queries to avoid repeated roundtrips to remote Atlas
let cachedProjects: { data: Project[]; timestamp: number } | null = null;
let cachedFounders: { data: Founder[]; timestamp: number } | null = null;
let cachedCopy: { data: { intro: string; about: string; availability: string }; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export function clearStudioDataCache() {
  cachedProjects = null;
  cachedFounders = null;
  cachedCopy = null;
}

export async function listProjects(all = false): Promise<Project[]> {
  try {
    if (all) await requireOwner();
    if (!all && cachedProjects && Date.now() - cachedProjects.timestamp < CACHE_TTL_MS) {
      return cachedProjects.data;
    }
    const rows = await (await getDb()).collection<ProjectRecord>('projects').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1, title: 1 }).toArray();
    let result: Project[];
    if (all) {
      result = rows || [];
    } else if (rows && rows.length > 0) {
      const existingSlugs = new Set(rows.map((r) => r.slug));
      result = [...rows, ...defaultProjects.filter((d) => !existingSlugs.has(d.slug))];
    } else {
      result = defaultProjects;
    }
    if (!all) cachedProjects = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    if (all) throw err;
    console.error('listProjects error:', err);
    return defaultProjects;
  }
}
export async function listFounders(all = false): Promise<Founder[]> {
  try {
    if (all) await requireOwner();
    if (!all && cachedFounders && Date.now() - cachedFounders.timestamp < CACHE_TTL_MS) {
      return cachedFounders.data;
    }
    const rows = await (await getDb()).collection<FounderRecord>('founders').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1 }).toArray();
    const result = (rows && rows.length > 0) ? rows : (all ? [] : defaultFounders);
    if (!all) cachedFounders = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    if (all) throw err;
    console.error('listFounders error:', err);
    return defaultFounders;
  }
}
export async function studioCopy() {
  try {
    if (cachedCopy && Date.now() - cachedCopy.timestamp < CACHE_TTL_MS) {
      return cachedCopy.data;
    }
    const row = await (await getDb()).collection('settings').findOne({ id: 'site' });
    const result = { intro: typeof row?.intro === 'string' ? row.intro : '', about: typeof row?.about === 'string' ? row.about : '', availability: typeof row?.availability === 'string' ? row.availability : '' };
    cachedCopy = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.error('studioCopy error:', err);
    return { intro: 'Custom software, web platforms and security reviews for teams building their next release.', about: 'Hash Decode is a software and web-security studio.', availability: 'Taking new projects' };
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
