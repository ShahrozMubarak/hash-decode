'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SitePreloader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(15);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {

    let isDomReady = typeof document !== 'undefined' && (document.readyState === 'interactive' || document.readyState === 'complete');
    let isModelLoaded = typeof window !== 'undefined' && Boolean((window as any).__hd_model_ready);
    let isDone = false;

    // Fast, responsive progress ticks (completes well within ~400-600ms)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 20;
        if (prev < 85) return prev + 15;
        if (prev < 98) return prev + 8;
        return 98;
      });
    }, 45);

    const finishWhenReady = () => {
      if (isDone) return;
      isDone = true;
      clearInterval(progressInterval);
      setProgress(100);

      // Fast, smooth dissolve without artificial lag
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setHidden(true);
        }, 220);
      }, 50);
    };

    const checkComplete = () => {
      if (isModelLoaded || isDomReady) {
        finishWhenReady();
      }
    };

    const onDomReady = () => {
      isDomReady = true;
      checkComplete();
    };

    const onModelReady = () => {
      isModelLoaded = true;
      finishWhenReady();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDomReady, { once: true });
      window.addEventListener('load', onDomReady, { once: true });
    } else {
      isDomReady = true;
      checkComplete();
    }
    window.addEventListener('hd:model-ready', onModelReady, { once: true });

    // Strict safety cap: never let the preloader hold screen longer than 850ms
    const maxSafetyTimer = setTimeout(() => {
      finishWhenReady();
    }, 850);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(maxSafetyTimer);
      document.removeEventListener('DOMContentLoaded', onDomReady);
      window.removeEventListener('load', onDomReady);
      window.removeEventListener('hd:model-ready', onModelReady);
    };
  }, [pathname]);

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

        {/* High-tech Glowing Lazy Line only - no dots */}
        <div className="preloader-lazy-line-track">
          <div
            className="preloader-lazy-line-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle dynamic status text */}
        <span className="preloader-status-text">
          {progress >= 100 ? 'READY' : 'INITIALIZING SYSTEMS'}
        </span>
      </div>
    </div>
  );
}
