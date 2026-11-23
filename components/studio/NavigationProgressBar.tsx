'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Route transition completed
    clearAllTimers();
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      setNavigating(false);
      setProgress(0);
    }, 200);

    return () => {
      clearAllTimers();
    };
  }, [pathname, clearAllTimers]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore clicks with modifier keys, right clicks, or already handled events
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      if (target.target && target.target !== '_self') return;
      if (target.hasAttribute('download')) return;

      const href = target.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) {
        return;
      }

      try {
        const url = new URL(target.href, window.location.href);
        // Only internal links
        if (url.origin !== window.location.origin) return;

        const targetPath = url.pathname;
        const currentPath = window.location.pathname;

        // Skip in-page hash links (e.g. /services#audit while on /services) or query-only updates
        if (targetPath === currentPath) {
          return;
        }

        // Skip if target path matches current pathname
        if (targetPath === pathname) {
          return;
        }

        clearAllTimers();
        setNavigating(true);
        setProgress(35);

        stepTimerRef.current = setTimeout(() => {
          setProgress(75);
        }, 150);

        // Safety fallback: auto-reset after 1200ms if navigation stalls or is intercepted
        safetyTimerRef.current = setTimeout(() => {
          setNavigating(false);
          setProgress(0);
        }, 1200);
      } catch {
        // Invalid URL, ignore
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
      clearAllTimers();
    };
  }, [pathname, clearAllTimers]);

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
          backgroundColor: '#000000',
          boxShadow: 'none',
          transition: progress === 100 ? 'width 150ms ease-out, opacity 150ms ease-out' : 'width 300ms ease-out',
        }}
      />
    </div>
  );
}
