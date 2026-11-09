'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speedY: number;
  speedX: number;
  twinklePeriod: number;
  twinklePhase: number;
}

export default function HeroDustMotes() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();
    let isVisible = true;
    let isHeroInView = true;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 70 particles on desktop, 35 on phones
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 35 : 70;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 1.5, // 1 to 2.5px
        baseAlpha: 0.35 + Math.random() * 0.35, // 35% to 70% opacity
        speedY: -(3 + Math.random() * 5), // drift 3 to 8px/s up
        speedX: 0.5 + Math.random() * 1.5, // slightly right
        twinklePeriod: 3 + Math.random() * 3, // twinkle every 3-6s
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Pause when tab is hidden
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pause when hero is off-screen
    const heroEl = canvas.closest('.hero-runway') || canvas.parentElement;
    let observer: IntersectionObserver | null = null;
    if (heroEl) {
      observer = new IntersectionObserver(
        (entries) => {
          isHeroInView = entries[0]?.isIntersecting ?? true;
          if (isHeroInView) lastTime = performance.now();
        },
        { threshold: 0 }
      );
      observer.observe(heroEl);
    }

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isVisible && isHeroInView && dt > 0) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < count; i++) {
          const p = particles[i];
          p.y += p.speedY * dt;
          p.x += p.speedX * dt;

          // Wrap around top to bottom
          if (p.y < -10) {
            p.y = height + 5;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) {
            p.x = -5;
          }

          // Smooth sinusoidal twinkle
          const twinkle = 0.65 + 0.35 * Math.sin((now / 1000) * ((2 * Math.PI) / p.twinklePeriod) + p.twinklePhase);
          const alpha = p.baseAlpha * twinkle;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-dust-canvas" aria-hidden="true" />;
}

