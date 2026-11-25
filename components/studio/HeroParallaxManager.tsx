'use client';

import { useEffect } from 'react';

export default function HeroParallaxManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    let lastCompressed: boolean | null = null;

    const updateHeader = () => {
      ticking = false;
      const compressed = (window.scrollY || window.pageYOffset) > 40;
      if (compressed !== lastCompressed) {
        lastCompressed = compressed;
        document.documentElement.classList.toggle('header-compressed', compressed);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeader);
      }
    };

    updateHeader();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.classList.remove('header-compressed');
    };
  }, []);

  return null;
}
