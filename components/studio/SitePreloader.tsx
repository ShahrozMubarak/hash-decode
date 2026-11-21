'use client';

import { useEffect, useState } from 'react';

export default function SitePreloader() {
  // Check if site has already been loaded in this browser session
  const [hidden, setHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return Boolean(
          (window as any).__hd_site_loaded ||
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

  useEffect(() => {
    // If already loaded once in this session, never show again
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('hd_site_loaded') || (window as any).__hd_site_loaded) {
          setHidden(true);
          return;
        }
      } catch {}
    }

    let isDone = false;

    // Ultra-fast progress ticks for initial model load
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + 25;
        if (prev < 90) return prev + 15;
        if (prev < 98) return prev + 8;
        return 98;
      });
    }, 30);

    const finishWhenReady = () => {
      if (isDone) return;
      isDone = true;
      clearInterval(progressInterval);
      setProgress(100);

      try {
        sessionStorage.setItem('hd_site_loaded', '1');
        (window as any).__hd_site_loaded = true;
      } catch {}

      // Fast, smooth dissolve
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setHidden(true);
        }, 160);
      }, 40);
    };

    const onModelReady = () => {
      finishWhenReady();
    };

    window.addEventListener('hd:model-ready', onModelReady, { once: true });

    // If model is already ready or DOM is complete, finish right away
    if (typeof window !== 'undefined' && Boolean((window as any).__hd_model_ready)) {
      finishWhenReady();
    } else if (document.readyState === 'complete') {
      // Allow a brief moment for model initialisation
      const quickCheck = setTimeout(() => {
        finishWhenReady();
      }, 350);
      return () => {
        clearInterval(progressInterval);
        clearTimeout(quickCheck);
        window.removeEventListener('hd:model-ready', onModelReady);
      };
    }

    // Safety timeout: never block longer than 600ms on first load
    const maxSafetyTimer = setTimeout(() => {
      finishWhenReady();
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(maxSafetyTimer);
      window.removeEventListener('hd:model-ready', onModelReady);
    };
  }, []); // Empty dependency array: runs ONLY ONCE on site open, NEVER on route changes!

  if (hidden) return null;

  return (
    <div
      className={`hd-site-preloader ${fadingOut ? 'is-fading' : ''}`}
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
