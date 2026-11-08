'use client';
import { useEffect, useRef, useState } from 'react';
import type { Founder } from '@/lib/studio-data';
import { ArrowUpRight, Check } from 'lucide-react';

interface Props {
  founders: Founder[];
}

function StreamCursor() {
  return (
    <span className="ai-bot-avatar-cursor" aria-hidden="true">
      <span className="typewriter-blink-bar" />
    </span>
  );
}

function SequentialTypewriter({
  text,
  start,
  speed = 40,
  onComplete,
}: {
  text: string;
  start: boolean;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!start) {
      setDisplayed('');
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);

  const isDone = displayed.length >= text.length;

  return (
    <span>
      {displayed}
      {start && !isDone && <StreamCursor />}
    </span>
  );
}

function WordTypewriter({
  text,
  start,
  speed = 95,
  onComplete,
}: {
  text: string;
  start: boolean;
  speed?: number;
  onComplete?: () => void;
}) {
  const [wordIdx, setWordIdx] = useState(0);
  const words = text ? text.split(' ') : [];

  useEffect(() => {
    if (!start) {
      setWordIdx(0);
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setWordIdx(idx);
      if (idx >= words.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);

  const isDone = wordIdx >= words.length;

  return (
    <span>
      {words.slice(0, wordIdx).join(' ')}
      {start && !isDone && <StreamCursor />}
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

  // Sequential typing state machine:
  // Step 0: Initial
  // Step 1: Typing Name
  // Step 2: Typing Role
  // Step 3: Revealing Quote
  // Step 4: Typing Bio (2x slower)
  // Step 5: Finished (reveals skills & actions)
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Small delay then begin Step 1 (Founder Name)
          const timer = setTimeout(() => {
            setStage(1);
          }, 350);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
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
            <span>( 0{index + 1} ) [ FOUNDING_PARTNER ]</span>
          </div>
        </div>
      </div>

      {/* Info Container strictly on RIGHT SIDE of Photo with neat structured width and justified rectangular line endings */}
      <div className={`founder-info-wrap ${stage >= 1 ? 'info-active' : ''}`}>
        {/* Step 1: Founder Name types out first */}
        <h3 className="founder-name">
          {stage >= 1 ? (
            <SequentialTypewriter
              text={founder.name}
              start={stage >= 1}
              speed={48}
              onComplete={() => setStage((s) => Math.max(s, 2))}
            />
          ) : (
            <span style={{ opacity: 0 }}>{founder.name}</span>
          )}
        </h3>

        {/* Step 2: Role tag types out next */}
        <div className="founder-role-strip">
          <span className="founder-role-tag">
            {stage >= 2 ? (
              <SequentialTypewriter
                text={founder.role}
                start={stage >= 2}
                speed={36}
                onComplete={() => setStage((s) => Math.max(s, 3))}
              />
            ) : null}
          </span>
        </div>

        {/* Step 3: Quote reveals next */}
        {founder.quote && stage >= 3 && (
          <blockquote className="founder-quote">
            <p>&ldquo;{founder.quote}&rdquo;</p>
          </blockquote>
        )}

        {/* Step 4: Bio types out 2x slower line-by-line with structured justified block */}
        <div className="founder-bio">
          <p className="founder-bio-text structured-block">
            {stage >= 3 ? (
              <WordTypewriter
                text={founder.bio}
                start={stage >= 3}
                speed={95} /* 2x slower typing speed */
                onComplete={() => setStage((s) => Math.max(s, 5))}
              />
            ) : null}
          </p>
        </div>

        {/* Step 5: Skills chips and actions reveal smoothly */}
        <div className={`founder-bottom-reveals ${stage >= 4 ? 'revealed' : ''}`}>
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
      </div>
    </article>
  );
}

export default function FoundersShowcase({ founders }: Props) {
  const list = founders && founders.length > 0 ? founders : [];

  return (
    <div className="founders-showcase-container">
      <div className="founders-header-block">
        <span className="iris-pill-badge">[ v01b // FOUNDING_TEAM ]</span>
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
