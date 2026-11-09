'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Route transition completed
    setProgress(100);
    const timer = setTimeout(() => {
      setNavigating(false);
      setProgress(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        target.target !== '_blank' &&
        href !== pathname
      ) {
        setNavigating(true);
        setProgress(35);
        setTimeout(() => setProgress(75), 150);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [pathname]);

  if (!navigating && progress === 0) return null;

  return (
    <div
      className="nav-top-progress-track"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        className="nav-top-progress-fill"
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#1E40AF',
          boxShadow: '0 0 10px rgba(30, 64, 175, 0.5)',
          transition: progress === 100 ? 'width 150ms ease-out, opacity 150ms ease-out' : 'width 300ms ease-out',
        }}
      />
    </div>
  );
}
