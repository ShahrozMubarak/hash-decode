export interface StudioProject {
  slug: string;
  title: string;
  eyebrow: string;
  desc: string;
  palette: 'midnight' | 'violet' | 'teal';
  ctaText: string;
  ctaHref: string;
  ctaVariant?: 'coral' | 'azure' | 'dark' | 'white';
  image?: string;
  domain?: string;
  liveUrl?: string;
  reverse?: boolean;
  isUtility?: boolean;
}

export const studioProjects: StudioProject[] = [
  {
    slug: 'foolish-arc',
    title: 'Foolish Arc',
    eyebrow: 'E-commerce & identity',
    desc: 'Full e-commerce platform with custom checkout, inventory synchronization, and bespoke brand aesthetics.',
    palette: 'midnight',
    ctaText: 'Visit site',
    ctaHref: 'https://foolisharc.com',
    ctaVariant: 'coral',
    image: '/team/foolisharc.jpeg',
    domain: 'foolisharc.com',
    liveUrl: 'https://foolisharc.com',
    reverse: false,
  },
  {
    slug: 'hashgym',
    title: 'HashGym',
    eyebrow: 'Gym management SaaS',
    desc: 'Multi-tenant gym management SaaS with instant check-ins, automated membership dues ledger, and digital member passes.',
    palette: 'teal',
    ctaText: 'Visit site',
    ctaHref: 'https://hashgym.hashdecode.com',
    ctaVariant: 'coral',
    image: '/projects/hashgym.jpg',
    domain: 'hashgym.hashdecode.com',
    liveUrl: 'https://hashgym.hashdecode.com',
    reverse: true,
  },
  {
    slug: 'pioneer-salt',
    title: 'Pioneer Salt',
    eyebrow: 'E-commerce & retail',
    desc: 'Direct-to-consumer storefront for pure Khewra Himalayan pink salt, culinary slabs, grinders, and gift sets with order tracking.',
    palette: 'midnight',
    ctaText: 'Visit site',
    ctaHref: 'https://pioneersalt.hashdecode.com',
    ctaVariant: 'coral',
    image: '/projects/pioneersalt.jpg',
    domain: 'pioneersalt.hashdecode.com',
    liveUrl: 'https://pioneersalt.hashdecode.com',
    reverse: false,
  },
  {
    slug: 'hash-roofing',
    title: 'Hash Roofing',
    eyebrow: 'Construction & client portal',
    desc: 'Roof installation and repair platform featuring an instant roof price estimator, inspections, and a live client portal.',
    palette: 'teal',
    ctaText: 'Visit site',
    ctaHref: 'https://hashroofing.hashdecode.com',
    ctaVariant: 'coral',
    image: '/projects/hashroofing.jpg',
    domain: 'hashroofing.hashdecode.com',
    liveUrl: 'https://hashroofing.hashdecode.com',
    reverse: true,
  },
  {
    slug: 'cost-estimator',
    title: 'Cloud Cost Estimator',
    eyebrow: 'Internal tooling',
    desc: 'Real-time multi-cloud price modeling tool that helps engineering teams forecast and reduce AWS/GCP spend.',
    palette: 'violet',
    ctaText: 'Try the estimator',
    ctaHref: '/tools/estimate',
    ctaVariant: 'azure',
    reverse: true,
    isUtility: true,
  },
  {
    slug: 'security-scanner',
    title: 'Header Security Scanner',
    eyebrow: 'Security tool',
    desc: 'Instant HTTP response header analyzer grading websites against OWASP, HSTS, and CSP security baselines.',
    palette: 'teal',
    ctaText: 'Run a scan',
    ctaHref: '/tools/security-check',
    ctaVariant: 'coral',
    reverse: false,
    isUtility: true,
  },
];
