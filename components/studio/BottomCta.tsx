import WideCard from './WideCard';

interface BottomCtaProps {
  title?: string;
  sub?: string;
  eyebrow?: string;
  btnText?: string;
  btnHref?: string;
  className?: string;
}

export default function BottomCta({
  title = 'Start a project.',
  sub = "Tell us what you're building. We'll tell you how we can help.",
  eyebrow = 'Get in touch',
  btnText = 'Start a project',
  btnHref = '/contact',
  className = '',
}: BottomCtaProps) {
  return (
    <div className={`bottom-cta-wrap ${className}`.trim()} style={{ marginTop: 'var(--s-8)', width: '100%' }}>
      <WideCard
        palette="ink"
        eyebrow={eyebrow}
        title={title}
        desc={sub}
        ctaText={btnText}
        ctaHref={btnHref}
        ctaVariant="coral"
        className="bottom-cta-card"
      />
    </div>
  );
}

