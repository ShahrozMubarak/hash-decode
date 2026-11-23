'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function CardTiltManager() {
  const pathname = usePathname();

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
      let cachedRect: DOMRect | null = null;

      const onMouseEnter = () => {
        cachedRect = card.getBoundingClientRect();
        isHovered = true;
        loop();
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!cachedRect) {
          cachedRect = card.getBoundingClientRect();
        }
        const x = e.clientX - cachedRect.left;
        const y = e.clientY - cachedRect.top;
        const cx = cachedRect.width / 2;
        const cy = cachedRect.height / 2;

        card.style.setProperty('--mx', `${x.toFixed(1)}px`);
        card.style.setProperty('--my', `${y.toFixed(1)}px`);

        // Only tilt service, work and team cards (max 4deg)
        if (card.matches('.hd-card-tilt, .service-tri-card, .service-card, .work-card, .team-card, .team-strip-card')) {
          targetTiltX = -((y - cy) / cy) * 4;
          targetTiltY = ((x - cx) / cx) * 4;
        }
      };

      const onMouseLeave = () => {
        cachedRect = null;
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

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        card.removeEventListener('mouseenter', onMouseEnter);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    // 2. Magnetic effect on hero and final CTA primary buttons scoped directly to button bounds
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
      let cachedBtnRect: DOMRect | null = null;

      const onBtnMouseEnter = () => {
        cachedBtnRect = btn.getBoundingClientRect();
        isNear = true;
        runLoop();
      };

      const onBtnMouseMove = (e: MouseEvent) => {
        if (!cachedBtnRect) {
          cachedBtnRect = btn.getBoundingClientRect();
        }
        const btnCenterX = cachedBtnRect.left + cachedBtnRect.width / 2;
        const btnCenterY = cachedBtnRect.top + cachedBtnRect.height / 2;
        targetPullX = Math.max(-8, Math.min(8, (e.clientX - btnCenterX) * 0.25));
        targetPullY = Math.max(-8, Math.min(8, (e.clientY - btnCenterY) * 0.25));
      };

      const onBtnMouseLeave = () => {
        cachedBtnRect = null;
        isNear = false;
        targetPullX = 0;
        targetPullY = 0;
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

      btn.addEventListener('mouseenter', onBtnMouseEnter);
      btn.addEventListener('mousemove', onBtnMouseMove, { passive: true });
      btn.addEventListener('mouseleave', onBtnMouseLeave);

      cleanups.push(() => {
        cancelAnimationFrame(rafId);
        btn.removeEventListener('mouseenter', onBtnMouseEnter);
        btn.removeEventListener('mousemove', onBtnMouseMove);
        btn.removeEventListener('mouseleave', onBtnMouseLeave);
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [pathname]);

  return null;
}
