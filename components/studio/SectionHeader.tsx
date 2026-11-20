interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  align?: 'center' | 'left';
}

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  className = '',
  align = 'center',
}: SectionHeaderProps) {
  return (
    <div className={`hd-section-header hd-section-header--${align} ${className}`.trim()}>
      {eyebrow && <p className="hd-section-eyebrow">{eyebrow}</p>}
      <h2 className="hd-section-title">{title}</h2>
      {lead && <p className="hd-section-sub">{lead}</p>}
    </div>
  );
}
