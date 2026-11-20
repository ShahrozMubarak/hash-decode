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
  reverse?: boolean;
}

export const studioProjects: StudioProject[] = [
  {
    slug: 'foolish-arc',
    title: 'Foolish Arc',
    eyebrow: 'E-commerce & identity',
    desc: 'Full e-commerce platform with custom checkout, inventory synchronization, and bespoke brand aesthetics.',
    palette: 'midnight',
    ctaText: 'View project',
    ctaHref: '/portfolio/foolish-arc',
    ctaVariant: 'coral',
    image: '/team/foolisharc.jpeg',
    reverse: false,
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
  },
];

