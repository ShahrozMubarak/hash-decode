'use client';

import { useEffect } from 'react';

export default function CardTiltManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 1. Tilt and cursor-follow glare for cards
    const cardSelectors =
      '.hd-card, .service-tri-card, .service-card, .service-detail-card, .process-card, .principle-card, .outcome-card, .work-cta-card, .work-card, .team-card, .team-strip-card, .security-strip-card, .process-timeline-card';
    const cards = Array.from(document.querySelectorAll<HTMLElement>(cardSelectors));

    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      let rafId = 0;
      let targetTiltX = 0;
      let targetTiltY = 0;
      let currentTiltX = 0;
      let currentTiltY = 0;
      let isHovered = false;

      const onMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        card.style.setProperty('--mx', `${x.toFixed(1)}px`);
        card.style.setProperty('--my', `${y.toFixed(1)}px`);

        // Only tilt service, work and team cards (max 4deg)
        if (card.matches('.hd-card-tilt, .service-tri-card, .service-card, .work-card, .team-card, .team-strip-card')) {
          targetTiltX = -((y - cy) / cy) * 4;
          targetTiltY = ((x - cx) / cx) * 4;
        }
      };

      const onMouseEnter = () => {
        isHovered = true;
        loop();
      };

      const onMouseLeave = () => {
        isHovered = false;
        targetTiltX = 0;
        targetTiltY = 0;
      };

      const loop = () => {
        currentTiltX += (targetTiltX - currentTiltX) * 0.12;
        currentTiltY += (targetTiltY - currentTiltY) * 0.12;

        card.style.setProperty('--tilt-x', `${currentTiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);

        if (isHovered || Math.abs(currentTiltX) > 0.05 || Math.abs(currentTiltY) > 0.05) {
          rafId = requestAnimationFrame(loop);
        } else {
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        }
      };

      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseenter', onMouseEnter);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    // 2. Magnetic effect on hero and final CTA primary buttons (90px radius, max 8px pull, lerp .15)
    const magneticButtons = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.hero-start-cta, .cta-magnetic, #brief .hd-btn-primary, #brief .btn-primary, #brief button[type="submit"], #send-brief-btn'
      )
    );

    magneticButtons.forEach((btn) => {
      let rafId = 0;
      let targetPullX = 0;
      let targetPullY = 0;
      let currentPullX = 0;
      let currentPullY = 0;
      let isNear = false;

      const onWindowMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

        if (dist < 90) {
          isNear = true;
          const pullRatio = (90 - dist) / 90;
          targetPullX = ((e.clientX - btnCenterX) / 90) * 8 * pullRatio;
          targetPullY = ((e.clientY - btnCenterY) / 90) * 8 * pullRatio;
          runLoop();
        } else if (isNear) {
          isNear = false;
          targetPullX = 0;
          targetPullY = 0;
        }
      };

      const runLoop = () => {
        currentPullX += (targetPullX - currentPullX) * 0.15;
        currentPullY += (targetPullY - currentPullY) * 0.15;

        btn.style.setProperty('--pull-x', `${currentPullX.toFixed(2)}px`);
        btn.style.setProperty('--pull-y', `${currentPullY.toFixed(2)}px`);

        if (isNear || Math.abs(currentPullX) > 0.05 || Math.abs(currentPullY) > 0.05) {
          rafId = requestAnimationFrame(runLoop);
        } else {
          btn.style.setProperty('--pull-x', '0px');
          btn.style.setProperty('--pull-y', '0px');
        }
      };

      window.addEventListener('mousemove', onWindowMouseMove, { passive: true });

      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', onWindowMouseMove);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}
