import { getDb } from './db';
import type { ProjectRecord, FounderRecord } from './content-models';
import { requireOwner } from './owner-session';
export type Project = ProjectRecord;
export type Founder = Omit<FounderRecord, 'status'>;

export const defaultFounders: Founder[] = [
  {
    id: 'shahroz-dogar',
    name: 'Shahroz Dogar',
    role: 'Co-Founder & Lead Systems Architect',
    bio: 'Oversees distributed systems architecture, high-concurrency cloud deployments, and zero-trust security frameworks. Leads technical direction and end-to-end delivery for all enterprise platforms.',
    quote: 'Software must be built for the real human workflows it powers, with uncompromising speed and mathematical safety.',
    skills: ['Systems Architecture', 'Cloudflare Workers', 'Distributed Systems', 'Security Audits'],
    image: '/team/shahroz.jpeg',
    url: 'https://hashdecode.com',
    position: 1,
  },
  {
    id: 'junaid-tariq',
    name: 'Junaid Tariq',
    role: 'Co-Founder & Full-Stack Systems Engineer',
    bio: 'Brings precision to full-stack web applications, real-time architectures, and reactive user interfaces. Focused on sub-second loads and clean, maintainable systems.',
    quote: 'Great software is measured by the clarity of its code and the speed of its execution.',
    skills: ['Full-Stack Development', 'React & Next.js', 'API Design', 'Performance'],
    image: '/team/junaid.jpeg',
    url: 'https://hashdecode.com',
    position: 2,
  },
  {
    id: 'shahmeer-khan',
    name: 'Shahmeer Khan',
    role: 'Lead Product & Interaction Designer',
    bio: 'Shapes intuitive interaction models, real-time 3D visualizations, and precision design systems. Bridges aesthetic elegance with tactile, latency-free digital response.',
    quote: 'Simplicity is not the absence of clutter, but the mastery of clarity and frictionless visual flow.',
    skills: ['Product Design', 'WebGL & Three.js', 'Design Systems', 'Micro-interactions'],
    image: '/team/shahmeer.jpeg',
    url: 'https://hashdecode.com',
    position: 3,
  },
  {
    id: 'fawad-ahmed',
    name: 'Fawad Ahmed',
    role: 'Senior DevOps & Security Engineer',
    bio: 'Engineers containerization pipelines, automated CI/CD releases, and zero-trust edge infrastructure. Guarantees high availability and defensive security.',
    quote: 'Reliable infrastructure is invisible—it simply works without interruption, day in and day out.',
    skills: ['Cloud Infrastructure', 'Docker & Kubernetes', 'Edge Computing', 'Automated CI/CD'],
    image: '/team/fawad.jpeg',
    url: 'https://hashdecode.com',
    position: 4,
  },
];

export const defaultProjects: Project[] = [
  {
    slug: 'foolish-arc',
    title: 'Foolish Arc',
    category: 'Client project & creative platform',
    summary: 'A modern digital platform and creative agency experience crafted for cinematic storytelling, immersive design, and high client conversion.',
    challenge: 'Delivering a bold, atmospheric digital identity with lightning-fast page transitions, responsive layouts, and interactive media storytelling.',
    solution: 'Engineered with next-generation frontend frameworks, responsive art direction, smooth micro-interactions, and optimized visual assets.',
    tech: 'Next.js, TypeScript, Tailwind CSS, Motion',
    result: 'Sub-second load times, dynamic interactive showcases, and high client conversion.',
    url: 'https://foolisharc.com',
    image: '/team/foolisharc.jpeg',
    art: 'grid',
    status: 'published',
    position: 1,
    kind: 'Client project',
  },
  {
    slug: 'hash-decode-studio',
    title: 'Hash Decode Studio',
    category: 'Systems Architecture & Platform',
    summary: 'Flagship digital engineering studio delivering resilient distributed systems, bespoke web applications, and zero-trust platforms.',
    challenge: 'Building an unshakeable digital presence that blends high-concurrency systems architecture with refined, tactile visual polish.',
    solution: 'Zero-trust security headers, responsive 3D flip card interactions, live real-time metrics, and resilient multi-environment database connectors.',
    tech: 'Next.js 16, React 19, TypeScript, MongoDB Atlas, Edge Computing',
    result: '100/100 performance and security ratings with sub-100ms global latency.',
    url: 'https://hashdecode.com',
    image: '/team/hashdecode.jpeg',
    art: 'orbit',
    status: 'published',
    position: 2,
    kind: 'Client project',
  },
  {
    slug: 'orbit-console',
    tech: 'React, TypeScript, Real-time Charts',
    result: 'A live interactive dashboard that lets you monitor your app and server activity with instant updates.',
    title: 'Orbit Console',
    category: 'Web application',
    summary: 'A clean live monitoring dashboard to watch your system work in real time.',
    challenge: 'Teams need a fast, simple way to see live system performance without getting lost in complicated graphs.',
    solution: 'Orbit combines live metrics, easy-to-read charts, and quick controls into one simple, beautiful dashboard.',
    url: 'https://hashdecode.com',
    image: '/team/hashdecode.jpeg',
    art: 'orbit',
    status: 'published',
    position: 3,
    kind: 'Studio concept',
  },
  {
    slug: 'relay-board',
    tech: 'React, TypeScript, Drag-and-Drop',
    result: 'A streamlined team task board where you can create, assign, and finish tasks with zero confusion.',
    title: 'Relay Board',
    category: 'Internal tool',
    summary: 'A simple team task board for organizing projects from idea to completion.',
    challenge: 'Daily project tasks often get lost in long chat threads and messy spreadsheets.',
    solution: 'Relay gives every task a clear status and next step so everyone on the team knows what to do.',
    url: 'https://foolisharc.com',
    image: '/team/foolisharc.jpeg',
    art: 'relay',
    status: 'published',
    position: 4,
    kind: 'Studio concept',
  },
];

export async function listProjects(all = false): Promise<Project[]> {
  try {
    if (all) await requireOwner();
    const rows = await (await getDb()).collection<ProjectRecord>('projects').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1, title: 1 }).toArray();
    if (rows && rows.length > 0) return rows;
    return all ? [] : defaultProjects;
  } catch (err) {
    if (all) throw err;
    console.error('listProjects error:', err);
    return defaultProjects;
  }
}
export async function listFounders(all = false): Promise<Founder[]> {
  try {
    if (all) await requireOwner();
    const rows = await (await getDb()).collection<FounderRecord>('founders').find(all ? { status: { $in: ['draft', 'published'] } } : { status: 'published' }, { projection: { _id: 0 } }).sort({ position: 1 }).toArray();
    if (rows && rows.length > 0) return rows;
    return all ? [] : defaultFounders;
  } catch (err) {
    if (all) throw err;
    console.error('listFounders error:', err);
    return defaultFounders;
  }
}
export async function studioCopy() {
  try {
    const row = await (await getDb()).collection('settings').findOne({ id: 'site' });
    return { intro: typeof row?.intro === 'string' ? row.intro : '', about: typeof row?.about === 'string' ? row.about : '', availability: typeof row?.availability === 'string' ? row.availability : '' };
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
