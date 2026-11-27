export interface Project {
  slug: string;
  title: string;
  category: string;
  summary: string;
  challenge: string;
  solution: string;
  tech: string;
  result: string;
  url?: string;
  image?: string;
  art?: 'grid' | 'orbit' | 'relay';
  status: 'draft' | 'published';
  position: number;
  kind?: 'Studio concept' | 'Client project';
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  image: string;
  url?: string;
  quote?: string;
  position: number;
}

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
    id: 'fawad-feroz',
    name: 'Fawad Feroz',
    role: 'Founder and Sales Head',
    bio: 'Leads enterprise client partnerships, technical sales strategy, and strategic growth across US and global markets. Ensures seamless onboarding, scope transparency, and long-term client value for every studio engagement.',
    quote: 'Transparent partnerships and technical honesty are the foundation of systems that scale.',
    skills: ['Enterprise Sales', 'Client Partnerships', 'Growth Strategy', 'Technical Scoping'],
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
    slug: 'hashgym',
    title: 'HashGym',
    category: 'Gym management SaaS',
    summary: 'Multi-tenant gym management SaaS featuring instant turnstile check-ins, automated membership dues ledger, digital wallet passes, and real-time facility control.',
    challenge: 'Fitness facilities struggle with front-desk check-in queues, manual membership renewals, and fragmented billing spreadsheets.',
    solution: 'Built a calm, high-speed SaaS platform with instant barcode/turnstile verification, automated dues reconciliation, member digital passes, and live attendance telemetry.',
    tech: 'Next.js, TypeScript, MongoDB, Resend, Edge API',
    result: 'Zero front-desk check-in bottlenecks with automated billing reconciliation and real-time member access control.',
    url: 'https://hashgym.hashdecode.com',
    image: '/projects/hashgym.jpg',
    art: 'grid',
    status: 'published',
    position: 2,
    kind: 'Client project',
  },
  {
    slug: 'pioneer-salt',
    title: 'Pioneer Salt',
    category: 'E-commerce & retail',
    summary: 'Direct-to-consumer e-commerce storefront for pure Khewra Himalayan pink salt, culinary cooking slabs, ceramic-burr grinders, and gift sets with live order tracking.',
    challenge: 'Showcasing authentic Khewra mineral salt products with tactile product storytelling, retail & gift ordering, and frictionless checkout.',
    solution: 'Engineered a crisp, high-converting storefront with curated product collections, interactive cart and order tracking, and fast mobile-first browsing.',
    tech: 'Next.js, TypeScript, Custom Cart & Checkout, Edge CDN',
    result: 'Fast global storefront loading with seamless product discovery, gift ordering, and real-time order tracking.',
    url: 'https://pioneersalt.hashdecode.com',
    image: '/projects/pioneersalt.jpg',
    art: 'grid',
    status: 'published',
    position: 3,
    kind: 'Client project',
  },
  {
    slug: 'hash-roofing',
    title: 'Hash Roofing',
    category: 'Construction & client portal',
    summary: 'Digital platform for residential and commercial roof installation and repair, featuring an instant roof cost estimator, inspection scheduling, and client project portal.',
    challenge: 'Homeowners and property managers needed transparent roof pricing, documented inspection telemetry, and real-time repair progress tracking.',
    solution: 'Built an interactive roof estimator, structural telemetry showcase, inspection booking workflow, and dedicated client & admin portals.',
    tech: 'Next.js, TypeScript, Interactive Estimator, Client Portal',
    result: 'Streamlined inspection-to-quote turnaround with transparent pricing estimates and transferable roof documentation.',
    url: 'https://hashroofing.hashdecode.com',
    image: '/projects/hashroofing.jpg',
    art: 'grid',
    status: 'published',
    position: 4,
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
