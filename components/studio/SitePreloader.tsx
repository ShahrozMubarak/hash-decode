'use client';

import { useEffect, useState } from 'react';

export default function SitePreloader() {
  const [mounted, setMounted] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);

    const startTime = Date.now();
    const minDisplayTime = 800; // Smooth showcase for opening animation
    const maxSafetyTimeout = 1800; // Never block longer than 1.8s

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setHidden(true);
        }, 450);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    const safetyTimer = setTimeout(finishLoading, maxSafetyTimeout);

    return () => {
      window.removeEventListener('load', finishLoading);
      clearTimeout(safetyTimer);
    };
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      className={`hd-site-preloader ${fadingOut ? 'is-fading' : ''}`}
      aria-hidden="true"
      role="progressbar"
      aria-label="Loading Hash Decode"
    >
      <div className="preloader-content">
        {/* Brand wordmark */}
        <div className="preloader-brand">
          <span className="brand-h">HASH</span>
          <span className="brand-d">DECODE</span>
        </div>

        {/* TikTok-style 2-dot dynamic loader */}
        <div className="preloader-dots-wrap">
          <div className="tiktok-dot dot-blue" />
          <div className="tiktok-dot dot-red" />
        </div>

        {/* Lazy Line Progress */}
        <div className="preloader-lazy-line-track">
          <div className="preloader-lazy-line-fill" />
        </div>

        {/* High-tech status indicator */}
        <span className="preloader-status-text">INITIALIZING SYSTEMS</span>
      </div>
    </div>
  );
}
