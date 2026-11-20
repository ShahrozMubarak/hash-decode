import { meta } from '@/lib/meta';
import WideCard from '@/components/studio/WideCard';
import CostEstimatorMock from '@/components/studio/visuals/CostEstimatorMock';
import HeaderScannerMock from '@/components/studio/visuals/HeaderScannerMock';
import BottomCta from '@/components/studio/BottomCta';

export const dynamic = 'force-dynamic';

export const metadata = meta(
  'Engineering Utilities & Free Tools | Hash Decode',
  'Estimate a custom software engineering budget or inspect a public website’s HTTP security posture.',
  '/tools'
);

export default function Tools() {
  return (
    <div className="wrap interior page-tools-hub">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio utilities</p>
        <h1 className="inner-hero-h1">
          Engineering tools.
        </h1>
        <p className="section-rule-lead">
          Free interactive utilities designed by our team. Model a project budget with our cost estimator
          or audit your website&apos;s HTTP security headers before planning your next sprint.
        </p>
      </header>

      {/* 2 WideCards for Tools */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }} data-reveal="up">
        <WideCard
          palette="cloud"
          eyebrow="01 · Planning utility"
          title="Project cost estimator."
          desc="Step through scope categories, features, and technical complexity to calculate an illustrative planning range. Uses only your selections and real studio formulas."
          visual={<CostEstimatorMock />}
          ctaText="Open estimator"
          ctaHref="/tools/estimate"
          ctaVariant="azure"
        />
        <WideCard
          palette="ink"
          reverse
          eyebrow="02 · Security utility"
          title="Website security checker."
          desc="Inspect any public domain for Content-Security-Policy, HSTS, frame protection, and transport safeguards. Direct integration with Mozilla HTTP Observatory."
          visual={<HeaderScannerMock />}
          ctaText="Run security check"
          ctaHref="/tools/security-check"
          ctaVariant="coral"
        />
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </div>
  );
}
