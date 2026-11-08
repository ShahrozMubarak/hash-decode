'use client';
import { useEffect, useRef, useState } from 'react';
import type { Founder } from '@/lib/studio-data';
import { ArrowUpRight, Check } from 'lucide-react';

interface Props {
  founders: Founder[];
}

function BotFaceCursor() {
  return (
    <span className="ai-bot-avatar-cursor" aria-hidden="true" title="Hash streaming">
      <svg viewBox="0 0 24 24" width="20" height="20" className="mini-bot-face">
        {/* White glossy rounded head */}
        <rect x="2" y="3" width="20" height="18" rx="7" fill="#ffffff" stroke="#000000" strokeWidth="1.6" />
        {/* Dark Visor */}
        <rect x="5" y="7" width="14" height="8" rx="4" fill="#050505" />
        {/* Coral Glowing Eyes */}
        <circle cx="8.5" cy="11" r="1.6" fill="#FD614B" className="bot-eye-pulse" />
        <circle cx="15.5" cy="11" r="1.6" fill="#FD614B" className="bot-eye-pulse" />
      </svg>
    </span>
  );
}

function ChatGPTWordStream({
  text,
  start,
  speed = 42,
}: {
  text: string;
  start: boolean;
  speed?: number;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const words = text ? text.split(' ') : [];

  useEffect(() => {
    if (!start) return;
    setWordIndex(0);
    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < words.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);

  const isDone = wordIndex >= words.length;

  return (
    <span className="word-stream-span">
      {words.slice(0, wordIndex).join(' ')}
      {start && !isDone && <BotFaceCursor />}
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
          }, 850);
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

  const bioWords = founder.bio ? founder.bio.split(' ') : [];
  // Approximately 3 seconds total typing duration for information text
  const bioSpeed = Math.max(45, Math.round(3000 / Math.max(1, bioWords.length)));

  return (
    <article
      ref={cardRef}
      className={`founder-row ${inView ? 'in-view ' + animVariantClass : ''}`}
      id={`founder-${founder.id}`}
    >
      {/* Photo Frame strictly on LEFT */}
      <div className="founder-media-wrap">
        <div className="founder-white-backdrop">
          <div className="founder-glow-halo" />
          <img
            src={founder.image}
            alt={founder.name}
            className="founder-photo-blend"
            loading="lazy"
            width={440}
            height={440}
          />
          <div className="founder-badge-pill">
            <span className="founder-dot" />
            <span>Co-Founder {index + 1}</span>
          </div>
        </div>
      </div>

      {/* Info Container strictly on RIGHT SIDE of Photo (Takes ~3s to write, clean justified lines, bold) */}
      <div className={`founder-info-wrap ${infoReady ? 'info-active' : ''}`}>
        <div className="founder-role-strip">
          <span className="founder-role-tag">
            <ChatGPTWordStream text={founder.role} start={infoReady} speed={65} />
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
          <p className="founder-bio-text font-bold">
            <ChatGPTWordStream text={founder.bio} start={infoReady} speed={bioSpeed} />
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
          The Minds Behind <span className="text-coral" style={{ color: 'var(--coral)' }}>Hash Decode</span>
        </h2>
        <p className="founders-lead-subtext">
          Four founders with deep backgrounds in distributed systems, product design, penetration testing, and edge infrastructure. We build software engineered for resilience from day one.
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
