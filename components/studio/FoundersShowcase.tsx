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
        <rect x="2" y="3" width="20" height="18" rx="7" fill="#ffffff" stroke="#0A2540" strokeWidth="1.6" />
        {/* Dark Visor */}
        <rect x="5" y="7" width="14" height="8" rx="4" fill="#040914" />
        {/* Cyan Glowing Eyes */}
        <circle cx="8.5" cy="11" r="1.6" fill="#00f0ff" className="bot-eye-pulse" />
        <circle cx="15.5" cy="11" r="1.6" fill="#00f0ff" className="bot-eye-pulse" />
      </svg>
    </span>
  );
}

function SequentialStream({
  text,
  start,
  speed = 100,
  onComplete,
  className = '',
}: {
  text: string;
  start: boolean;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const words = text ? text.split(' ') : [];

  useEffect(() => {
    if (!start) return;
    setWordIndex(0);
    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < words.length) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 240);
        }
        return prev;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);

  const isDone = wordIndex >= words.length;

  if (!start) return null;

  return (
    <span className={`word-stream-span ${className}`}>
      {words.slice(0, wordIndex).join(' ')}
      {!isDone && <BotFaceCursor />}
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
  // Sequential pipeline:
  // 0: idle before scroll
  // 1: Name is typed first
  // 2: Role is typed second
  // 3: Quote is typed third (if exists)
  // 4: Bio is typed fourth (2x slower, ~6s duration)
  // 5: Skills and actions revealed
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          const timer = setTimeout(() => {
            setStage(1); // Begin sequential typing with Founder Name first
          }, 650);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animVariantClass =
    index === 0
      ? 'anim-popup'
      : index === 1
      ? 'anim-slide-blur'
      : index === 2
      ? 'anim-perspective-flip'
      : 'anim-zoom-rotate';

  const bioWords = founder.bio ? founder.bio.split(' ') : [];
  // 2x slower typing duration for bio (~6 seconds total duration, ~110-140ms/word)
  const bioSpeed = Math.max(90, Math.round(6200 / Math.max(1, bioWords.length)));

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
            <span>( 0{index + 1} ) [ FOUNDER ]</span>
          </div>
        </div>
      </div>

      {/* Info Container strictly on RIGHT SIDE of Photo (Sequential 2x slower typing, structured width, justified) */}
      <div className={`founder-info-wrap ${stage >= 1 ? 'info-active' : ''}`}>
        {/* Step 1: Founder Name typed first */}
        <h3 className="founder-name">
          {stage >= 1 && (
            <SequentialStream
              text={founder.name}
              start={stage >= 1}
              speed={110}
              onComplete={() => setStage(2)}
            />
          )}
        </h3>

        {/* Step 2: Role tag typed second */}
        <div className="founder-role-strip">
          {stage >= 2 && (
            <span className="founder-role-tag">
              <SequentialStream
                text={founder.role}
                start={stage >= 2}
                speed={95}
                onComplete={() => setStage(founder.quote ? 3 : 4)}
              />
            </span>
          )}
        </div>

        {/* Step 3: Quote typed third if present */}
        {founder.quote && stage >= 3 && (
          <blockquote className="founder-quote">
            <p>
              &ldquo;
              <SequentialStream
                text={founder.quote}
                start={stage >= 3}
                speed={85}
                onComplete={() => setStage(4)}
              />
              &rdquo;
            </p>
          </blockquote>
        )}

        {/* Step 4: Bio typed fourth at 2x slower speed (~6s duration) */}
        <div className="founder-bio">
          {stage >= 4 && (
            <p className="founder-bio-text font-bold">
              <SequentialStream
                text={founder.bio}
                start={stage >= 4}
                speed={bioSpeed}
                onComplete={() => setStage(5)}
              />
            </p>
          )}
        </div>

        {/* Step 5: Skills cloud and Connect button revealed */}
        {founder.skills && founder.skills.length > 0 && (
          <div className={`founder-skills-cloud ${stage >= 5 ? 'revealed' : 'pending'}`}>
            {founder.skills.map((skill) => (
              <span key={skill} className="founder-skill-chip">
                <Check size={13} className="text-coral" />
                {skill}
              </span>
            ))}
          </div>
        )}

        {founder.url && (
          <div className={`founder-actions ${stage >= 5 ? 'revealed' : 'pending'}`}>
            <a
              href={founder.url}
              target="_blank"
              rel="noopener noreferrer"
              className="founder-link-pill"
            >
              <span>Connect with {founder.name.split(' ')[0]} ↗</span>
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
