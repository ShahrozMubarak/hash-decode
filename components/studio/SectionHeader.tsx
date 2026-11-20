interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  sub?: string;
  className?: string;
  align?: 'center' | 'left';
}

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  sub,
  className = '',
  align = 'center',
}: SectionHeaderProps) {
  const subtitle = sub || lead;
  return (
    <div className={`hd-section-header hd-section-header--${align} ${className}`.trim()}>
      {eyebrow && <p className="hd-section-eyebrow">{eyebrow}</p>}
      <h2 className="hd-section-title">{title}</h2>
      {subtitle && <p className="hd-section-sub">{subtitle}</p>}
    </div>
  );
}
