'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const p = Math.min(1, Math.max(0, window.scrollY / docHeight));
      setProgress(p);
    };

    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      className="reading-progress-track"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 100,
        backgroundColor: 'rgba(11, 31, 58, 0.08)',
        pointerEvents: 'none',
      }}
    >
      <div
        className="reading-progress-bar"
        style={{
          height: '100%',
          backgroundColor: '#1E40AF',
          width: `${(progress * 100).toFixed(1)}%`,
          transition: 'width 80ms ease-out',
        }}
      />
    </div>
  );
}

