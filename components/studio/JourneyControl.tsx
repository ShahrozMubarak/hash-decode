'use client';

import { useEffect } from 'react';
import { clampUnit } from '@/lib/journey';

export default function JourneyControl() {
  useEffect(() => {
    let rafId = 0;

    const emitScrollProgress = () => {
      rafId = 0;
      const y = window.scrollY;
      const v = Math.max(1, window.innerHeight);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - v);
      const page = clampUnit(y / maxScroll);
      const hero = clampUnit(y / Math.max(1, v * 0.85));
      window.dispatchEvent(
        new CustomEvent('hd:scroll', { detail: { hero, gallery: 0, crystal: 0, page, position: y } })
      );
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(emitScrollProgress);
    };

    emitScrollProgress();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('hd:measure', schedule);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('hd:measure', schedule);
    };
  }, []);

  return null;
}
