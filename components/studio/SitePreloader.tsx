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

  const [progress, setProgress] = useState(30);
  const [fadingOut, setFadingOut] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isDoneRef = useRef(false);

  useEffect(() => {
    // If already loaded once in this session, hide immediately and never show again
    if (typeof window !== 'undefined') {
      try {
        const win = window as CustomWindow;
        if (sessionStorage.getItem('hd_site_loaded') || win.__hd_site_loaded) {
          setHidden(true);
          return;
        }
      } catch {}
    }

    const clearAllTimers = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };

    const finishWhenReady = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(100);

      try {
        sessionStorage.setItem('hd_site_loaded', '1');
        (window as CustomWindow).__hd_site_loaded = true;
      } catch {}

      // Smooth dissolve matching CSS transition
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
        const hideTimer = setTimeout(() => {
          setHidden(true);
        }, 250);
        timersRef.current.push(hideTimer);
      }, 40);
      timersRef.current.push(fadeTimer);
    };

    // Fast progress ticks for initial visual feedback
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + 25;
        if (prev < 90) return prev + 15;
        if (prev < 98) return prev + 8;
        return 98;
      });
    }, 30);

    const onModelReady = () => {
      finishWhenReady();
    };

    window.addEventListener('hd:model-ready', onModelReady, { once: true });
    window.addEventListener('load', onModelReady, { once: true });

    // If model is already ready or document is already complete, finish immediately
    if (
      (typeof window !== 'undefined' && Boolean((window as CustomWindow).__hd_model_ready)) ||
      (typeof document !== 'undefined' && document.readyState === 'complete')
    ) {
      finishWhenReady();
    } else {
      // Non-blocking fallback for interior pages (/about, /contact, /work, etc.) where 3D scene is absent
      const fallbackTimer = setTimeout(() => {
        finishWhenReady();
      }, 250);
      timersRef.current.push(fallbackTimer);
    }

    // Maximum safety timer: never block screen under any circumstance
    const safetyTimer = setTimeout(() => {
      finishWhenReady();
    }, 500);
    timersRef.current.push(safetyTimer);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearAllTimers();
      window.removeEventListener('hd:model-ready', onModelReady);
      window.removeEventListener('load', onModelReady);
    };
  }, []); // Runs once on site open

  if (hidden) return null;

  return (
    <div
      className={`hd-site-preloader ${fadingOut ? 'is-fading' : ''}`}
      style={{ pointerEvents: fadingOut ? 'none' : 'auto' }}
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
