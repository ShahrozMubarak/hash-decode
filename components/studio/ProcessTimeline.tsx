'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Compass, Code2, CheckCircle2 } from 'lucide-react';

export interface TimelineStep {
  title: string;
  desc: string;
  icon: typeof MessageSquare;
}

export const processTimelineSteps: TimelineStep[] = [
  {
    title: 'Brief',
    desc: 'We discuss user workflows, performance needs, and milestones to define clear releases.',
    icon: MessageSquare,
  },
  {
    title: 'Design',
    desc: 'We prototype the data schemas, core views, and architecture for rapid sign-off.',
    icon: Compass,
  },
  {
    title: 'Build',
    desc: 'We deliver working full-stack increments with clean typing and end-to-end testing.',
    icon: Code2,
  },
  {
    title: 'Handover',
    desc: 'You receive complete source code, repository control, credentials, and runbooks.',
    icon: CheckCircle2,
  },
];

export default function ProcessTimeline({
  steps = processTimelineSteps,
}: {
  steps?: TimelineStep[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      // Start when top of timeline reaches 75% down viewport; end when bottom reaches 25% down viewport
      const start = vh * 0.75;
      const end = vh * 0.25;
      const total = start - end + rect.height;
      const current = start - rect.top;

      const p = Math.min(1, Math.max(0, current / total));
      setProgress(p);
    };

    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="process-horizontal-timeline"
      style={{ '--timeline-progress': progress } as React.CSSProperties}
    >
      {/* Background Track & Active Progress Line */}
      <div className="timeline-track-bar" aria-hidden="true">
        <div
          className="timeline-progress-fill"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <div className="process-timeline-cards">
        {steps.map((st, i) => {
          // 4 steps -> thresholds at approx 0.05, 0.35, 0.68, 0.95
          const threshold = i === 0 ? 0.04 : i === 1 ? 0.35 : i === 2 ? 0.68 : 0.94;
          const isReached = progress >= threshold;
          const Icon = st.icon;

          return (
            <article
              key={st.title}
              className={`process-timeline-card hd-card ${isReached ? 'is-reached' : ''}`}
              data-step-index={i}
            >
              <div className="card-glare" aria-hidden="true" />
              <div className={`process-node-tile ${isReached ? 'is-active' : ''}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="process-step-title">{st.title}</h3>
              <p className="process-step-desc">{st.desc}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
