'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SitePreloader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(15);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);

    let isWindowLoaded = typeof document !== 'undefined' && document.readyState === 'complete';
    let isModelLoaded = typeof window !== 'undefined' && Boolean((window as any).__hd_model_ready);
    let isDone = false;

    // Simulate natural progress step while waiting for real assets & WebGL
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) return prev + 12;
        if (prev < 75) return prev + 5;
        if (prev < 90) return prev + 2;
        return prev; // hold at ~90% until everything actually finishes loading
      });
    }, 120);

    const finishWhenReady = () => {
      if (isDone) return;
      isDone = true;
      clearInterval(progressInterval);
      setProgress(100);

      // Give a tiny moment for the user to see the complete line, then dissolve
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setHidden(true);
        }, 450);
      }, 240);
    };

    const checkComplete = () => {
      const isHome = pathname === '/';
      // If on home page, wait for BOTH window resources and 3D model ready
      if (isHome) {
        if (isWindowLoaded && isModelLoaded) {
          finishWhenReady();
        }
      } else {
        // On interior pages without hero 3D model, wait for window load
        if (isWindowLoaded) {
          finishWhenReady();
        }
      }
    };

    const onWindowLoad = () => {
      isWindowLoaded = true;
      checkComplete();
    };

    const onModelReady = () => {
      isModelLoaded = true;
      checkComplete();
    };

    if (!isWindowLoaded) {
      window.addEventListener('load', onWindowLoad, { once: true });
    }
    window.addEventListener('hd:model-ready', onModelReady, { once: true });

    // Initial check in case everything loaded instantly
    checkComplete();

    // Safety fallback: if WebGL is disabled or network hangs, open after 4.5s max
    const maxSafetyTimer = setTimeout(() => {
      finishWhenReady();
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(maxSafetyTimer);
      window.removeEventListener('load', onWindowLoad);
      window.removeEventListener('hd:model-ready', onModelReady);
    };
  }, [pathname]);

  if (!mounted || hidden) return null;

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
