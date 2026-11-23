'use client';

import { useEffect, useState, useRef } from 'react';

type CustomWindow = Window & { __hd_site_loaded?: boolean; __hd_model_ready?: boolean };

export default function SitePreloader() {
  // Check if site has already been loaded in this browser session
  const [hidden, setHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const win = window as CustomWindow;
        return Boolean(
          win.__hd_site_loaded ||
          sessionStorage.getItem('hd_site_loaded')
        );
      } catch {
        return false;
      }
    }
    return false;
  });

  const [progress, setProgress] = useState(15);
  const [fadingOut, setFadingOut] = useState(false);

  const isDoneRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If already loaded once in this session, hide immediately
    if (typeof window !== 'undefined') {
      try {
        const win = window as CustomWindow;
        if (sessionStorage.getItem('hd_site_loaded') || win.__hd_site_loaded) {
          setHidden(true);
          return;
        }
      } catch {}
    }

    const clearAll = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    const finishDismiss = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;

      setProgress(100);

      try {
        sessionStorage.setItem('hd_site_loaded', '1');
        (window as CustomWindow).__hd_site_loaded = true;
      } catch {}

      // Fade out smoothly
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
        // Completely remove from DOM after CSS transition
        const hideTimer = setTimeout(() => {
          setHidden(true);
        }, 250);
        timersRef.current.push(hideTimer);
      }, 100);
      timersRef.current.push(fadeTimer);
    };

    // Smooth progress progression reaching 100% at ~1000ms
    const startTime = Date.now();
    const duration = 950; // ms to reach 100%

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic curve for natural high-tech loading feel
      const eased = 1 - Math.pow(1 - t, 3);
      const currentVal = Math.round(15 + eased * 85);

      setProgress(currentVal);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        finishDismiss();
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    // Hard absolute safety timeout: DISAPPEAR IN 1.25s - 1.5s MAXIMUM, GUARANTEED
    const absoluteSafetyTimer = setTimeout(() => {
      finishDismiss();
    }, 1250);
    timersRef.current.push(absoluteSafetyTimer);

    const ultimateSafetyTimer = setTimeout(() => {
      setHidden(true);
    }, 1500);
    timersRef.current.push(ultimateSafetyTimer);

    return () => {
      clearAll();
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`hd-site-preloader ${fadingOut ? 'is-fading' : ''}`}
      style={{
        pointerEvents: fadingOut ? 'none' : 'auto',
        display: hidden ? 'none' : 'flex',
      }}
      aria-hidden="true"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Loading Hash Decode"
    >
      <div className="preloader-content">
        {/* Clean minimal brand wordmark */}
        <div className="preloader-brand">
          <span className="brand-h">HASH</span>
          <span className="brand-d">DECODE</span>
        </div>

        {/* High-tech Glowing Lazy Line */}
        <div className="preloader-lazy-line-track">
          <div
            className="preloader-lazy-line-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic status text */}
        <span className="preloader-status-text">
          {progress >= 100 ? 'READY' : 'INITIALIZING SYSTEMS'}
        </span>
      </div>
    </div>
  );
}
