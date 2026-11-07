'use client';
import { useEffect, useRef, useState } from 'react';
import type { Founder } from '@/lib/studio-data';
import { ArrowUpRight, Check, Code, Shield, Sparkles, Terminal } from 'lucide-react';

interface Props {
  founders: Founder[];
}

function TypewriterText({ text, start, speed = 18 }: { text: string; start: boolean; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    let idx = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);

  return (
    <span>
      {displayed}
      {start && !done && <span className="typing-cursor" aria-hidden="true">|</span>}
    </span>
  );
}

function FounderCard({
  founder,
  index,
}: {
  founder: Founder;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [infoReady, setInfoReady] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          const timer = setTimeout(() => {
            setInfoReady(true);
          }, 950);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 4 distinct scroll animations:
  // 0: Pop-up scale overshoot
  // 1: Slide from left with blur reveal
  // 2: 3D perspective flip up
  // 3: Elastic zoom and subtle rotate
  const animVariantClass =
    index === 0
      ? 'anim-popup'
      : index === 1
      ? 'anim-slide-blur'
      : index === 2
      ? 'anim-perspective-flip'
      : 'anim-zoom-rotate';

  const isEven = index % 2 === 1;

  return (
    <article
      ref={cardRef}
      className={`founder-row ${isEven ? 'founder-row-reverse' : ''} ${inView ? 'in-view ' + animVariantClass : ''}`}
      id={`founder-${founder.id}`}
    >
      {/* Photo Frame with White Background Blend */}
      <div className="founder-media-wrap">
        <div className="founder-white-backdrop">
          <div className="founder-glow-halo" />
          <img
            src={founder.image}
            alt={founder.name}
            className="founder-photo-blend"
            loading="lazy"
            width={480}
            height={480}
          />
          <div className="founder-badge-pill">
            <span className="founder-dot" />
            <span>Co-Founder {index + 1}</span>
          </div>
        </div>
      </div>

      {/* Info Container - Slides in after 1s delay with Typewriter Effect */}
      <div className={`founder-info-wrap ${infoReady ? 'info-active' : ''}`}>
        <div className="founder-role-strip">
          <span className="founder-role-tag">
            <TypewriterText text={founder.role} start={infoReady} speed={16} />
          </span>
        </div>

        <h3 className="founder-name">
          {founder.name}
        </h3>

        {founder.quote && (
          <blockquote className="founder-quote">
            <p>
              &ldquo;{founder.quote}&rdquo;
            </p>
          </blockquote>
        )}

        <div className="founder-bio">
          <p>
            <TypewriterText text={founder.bio} start={infoReady} speed={12} />
          </p>
        </div>

        {founder.skills && founder.skills.length > 0 && (
          <div className="founder-skills-cloud">
            {founder.skills.map((skill) => (
              <span key={skill} className="founder-skill-chip">
                <Check size={13} className="text-coral" />
                {skill}
              </span>
            ))}
          </div>
        )}

        {founder.url && (
          <div className="founder-actions">
            <a
              href={founder.url}
              target="_blank"
              rel="noopener noreferrer"
              className="founder-link-pill"
            >
              <span>Connect with {founder.name.split(' ')[0]}</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export default function FoundersShowcase({ founders }: Props) {
  const list = founders && founders.length > 0 ? founders : [];

  return (
    <div className="founders-showcase-container">
      <div className="founders-header-block">
        <span className="eyebrow"><i /> Independent Studio Leadership</span>
        <h2 className="founders-section-heading">
          <span className="text-azure" style={{ color: 'var(--azure)' }}>The Minds</span> Behind{' '}
          <span className="text-coral" style={{ color: 'var(--coral)' }}>Hash Decode</span>
        </h2>
        <p className="founders-lead-subtext">
          Four founders with deep backgrounds in high-availability systems, product design, penetration testing, and edge infrastructure. We build software engineered for resilience from day one.
        </p>
      </div>

      <div className="founders-stream">
        {list.map((founder, idx) => (
          <FounderCard
            key={founder.id || idx}
            founder={founder}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}
