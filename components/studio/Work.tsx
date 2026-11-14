'use client';

import type { Project } from '@/lib/studio-data';
import { normalizeImagePath } from '@/lib/content-models';
import { ArrowUpRight } from 'lucide-react';

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
        <div className="work-img-gradient-scrim" aria-hidden="true" />
        <span className="work-img-pill">{p.category || 'Featured'}</span>
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
  const techList = p.tech
    ? p.tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <a
      className="work-card hd-card work-tilt-card"
      href={'/portfolio/' + p.slug}
      data-reveal="up"
    >
      <div className="card-glare" aria-hidden="true" />
      <div className="work-card-content">
        <div className="work-preview-container">
          <Artwork project={p} />
        </div>
        <div className="work-caption">
          <div className="work-meta-row">
            <span className="concept-status-badge">{p.kind || 'Client project'}</span>
            <span className="work-cat-tag">{p.category}</span>
          </div>
          <h3 className="work-title">{p.title}</h3>
          <p className="work-summary">{p.summary}</p>
          
          {techList.length > 0 && (
            <div className="work-tech-pills">
              {techList.slice(0, 4).map((tech, i) => (
                <span key={i} className="work-tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="work-view-action" aria-hidden="true">
            <span>Explore project</span>
            <ArrowUpRight size={16} className="work-view-arrow" />
          </div>
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
          <span>{link}</span>
          <span className="link-arrow">
            <ArrowUpRight size={16} />
          </span>
        </a>
      )}
    </div>
  );
}
