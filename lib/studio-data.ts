import { getDb } from './db';
import type { ProjectRecord, FounderRecord } from './content-models';
import { requireOwner } from './owner-session';
export type Project = ProjectRecord;
export type Founder = Omit<FounderRecord, 'status'>;
export async function listProjects(all = false): Promise<Project[]> {
  if (all) await requireOwner();
  return (await getDb()).collection<ProjectRecord>('projects').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1, title: 1 }).toArray();
}
export async function listFounders(all = false): Promise<Founder[]> {
  if (all) await requireOwner();
  return (await getDb()).collection<FounderRecord>('founders').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1 }).toArray();
}
export async function studioCopy() {
  const row = await (await getDb()).collection('settings').findOne({ id: 'site' });
  return { intro: typeof row?.intro === 'string' ? row.intro : '', about: typeof row?.about === 'string' ? row.about : '', availability: typeof row?.availability === 'string' ? row.availability : '' };
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
