'use client';

import { useEffect, useRef } from 'react';

export default function HeroParallaxManager() {
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero = document.querySelector<HTMLElement>('.hero-sheet');
    const runway = document.querySelector<HTMLElement>('.hero-runway');
    if (!hero) return;

    let isHeroInView = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isHeroInView = entries[0]?.isIntersecting ?? true;
        if (hero) {
          hero.classList.toggle('hero-offscreen', !isHeroInView);
        }
      },
      { threshold: 0 }
    );

    if (runway) {
      observer.observe(runway);
    } else {
      observer.observe(hero);
    }

    const handlePointerMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX.current = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      targetY.current = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    };

    const handlePointerLeave = () => {
      targetX.current = 0;
      targetY.current = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    let rafId = 0;
    const update = () => {
      // Lerp .08 for smooth pointer tracking
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      const px = currentX.current;
      const py = currentY.current;

      const scrollY = window.scrollY || window.pageYOffset;
      const heroHeight = hero.offsetHeight || window.innerHeight;
      const scrollRatio = Math.max(0, Math.min(1, scrollY / heroHeight));

      // L1 Spotlight: pointer +-6px, scroll opacity 1 -> 0
      hero.style.setProperty('--spotlight-px', `${(px * 6).toFixed(2)}px`);
      hero.style.setProperty('--spotlight-py', `${(py * 6).toFixed(2)}px`);
      hero.style.setProperty('--spotlight-opacity', `${(1 - scrollRatio).toFixed(3)}`);

      // L3 Floor: pointer +-10px, scroll 0.5x
      hero.style.setProperty('--floor-px', `${(px * 10).toFixed(2)}px`);
      hero.style.setProperty('--floor-py', `${(py * 10).toFixed(2)}px`);
      hero.style.setProperty('--floor-scroll-y', `${(scrollY * 0.5).toFixed(2)}px`);

      // L5 Wordmark: pointer +-14px, scroll 0.7x
      hero.style.setProperty('--wm-px', `${(px * 14).toFixed(2)}px`);
      hero.style.setProperty('--wm-py', `${(py * 14).toFixed(2)}px`);
      hero.style.setProperty('--wm-scroll-y', `${(scrollY * 0.7).toFixed(2)}px`);

      // L4 Dust: scroll 0.3x
      hero.style.setProperty('--dust-scroll-y', `${(scrollY * 0.3).toFixed(2)}px`);

      // Header compression after 40px scroll
      document.documentElement.classList.toggle('header-compressed', scrollY > 40);

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.documentElement.classList.remove('header-compressed');
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return null;
}
