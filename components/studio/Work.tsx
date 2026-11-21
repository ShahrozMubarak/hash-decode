'use client';

import type { Project } from '@/lib/studio-defaults';
import { normalizeImagePath } from '@/lib/content-models';

const isImage = (url?: string) =>
  Boolean(url && /\.(png|jpg|jpeg|webp|avif|svg)(\?[^\s]*)?$/i.test(url.trim()));

const wave = (phase: number) =>
  Array.from(
    { length: 96 },
    (_, i) =>
      `${i === 0 ? 'M' : 'L'}${i * 3.8},${
        74 +
        Math.sin(i * 0.11 + phase) * 15 +
        Math.cos(i * 0.33) * 8 +
        (i > 42 && i < 65 ? Math.sin(i * 0.7) * 14 : 0)
      }`
  ).join(' ');

export function Artwork({ project: p }: { project: Project }) {
  const imgSrc = normalizeImagePath(p.image || (isImage(p.url) ? p.url : ''));

  if (imgSrc) {
    return (
      <div className="art art-image work-preview-img-wrap">
        <img
          src={imgSrc}
          alt={`${p.title} project preview`}
          loading="lazy"
          width="960"
          height="570"
          className="work-preview-img"
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={'art art-' + p.art + ' work-preview-art'}>
      {p.art === 'orbit' ? (
        <div className="project-window">
          <div className="window-bar">
            <b>Orbit Console</b>
            <span>Waveform study</span>
          </div>
          <svg viewBox="0 0 365 115">
            <path d="M0 60H365M0 90H365M0 30H365" stroke="var(--line)" fill="none" />
            <path d={wave(0.2)} fill="none" stroke="var(--azure)" strokeWidth="2.5" />
            <path d={wave(1.7)} fill="none" stroke="var(--coral)" strokeWidth="1.2" />
          </svg>
        </div>
      ) : p.art === 'relay' ? (
        <div className="project-window">
          <div className="window-bar">
            <b>Relay Board</b>
            <span>Delivery workflow</span>
          </div>
          <div className="mini-board">
            {[
              ['Queue', 'Project brief'],
              ['In progress', 'API review'],
              ['Released', 'Style guide'],
            ].map(([stage, task]) => (
              <div key={stage}>
                <small>{stage}</small>
                <b>{task}</b>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <strong>{p.title}</strong>
      )}
    </div>
  );
}

export function WorkCard({ project: p }: { project: Project; index?: number }) {
  const isFoolishArc = p.slug === 'foolish-arc';
  const displayTitle = isFoolishArc ? 'Foolish Arc' : p.title;
  const displaySummary = isFoolishArc ? 'Online storefront for a clothing brand.' : p.summary;
  const displayTags = isFoolishArc
    ? 'Client project · Clothing'
    : `${p.kind || 'Client project'} · ${p.category || 'Platform'}`;

  return (
    <a
      className="work-card hd-card"
      href={'/portfolio/' + p.slug}
      data-reveal="up"
    >
      <div className="work-card-content">
        <p className="work-meta-tags">{displayTags}</p>
        <h3 className="work-title">{displayTitle}</h3>
        <p className="work-summary">{displaySummary}</p>
        <div className="work-view-action" aria-hidden="true">
          <span>View project ›</span>
        </div>
        <div className="work-preview-container">
          <Artwork project={p} />
        </div>
      </div>
    </a>
  );
}

export function SectionTitle({
  kicker,
  title,
  href,
  link,
}: {
  index?: string;
  kicker: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-head" data-reveal="fade">
      <div>
        <p className="section-rule-label">{kicker}</p>
        <h2 className="section-rule-heading">{title}</h2>
      </div>
      {href && (
        <a className="hd-text-link" href={href}>
          <span>{link} ›</span>
        </a>
      )}
    </div>
  );
}
