'use client';
import { useEffect, useRef, useState } from 'react';

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only activate on devices with fine pointer (mouse / trackpad)
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setMounted(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isMouseDown = false;
    let isVisible = false;
    let animId = 0;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
      }
      const target = e.target as HTMLElement | null;
      isHovering = !!target?.closest('a, button, input, textarea, select, [role="button"], .work-card, .service-card, .cta, .outline, summary, .chat-trigger');
    };

    const onPointerDown = () => {
      isMouseDown = true;
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onPointerLeave = () => {
      isVisible = false;
    };

    const loop = () => {
      // Lerp outer ring toward cursor
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isMouseDown ? 0.7 : isHovering ? 1.4 : 1})`;
        dotRef.current.style.opacity = isVisible ? '1' : '0';
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isMouseDown ? 0.8 : isHovering ? 1.45 : 1})`;
        ringRef.current.style.opacity = isVisible ? '1' : '0';
        ringRef.current.classList.toggle('cursor-hovering', isHovering);
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="custom-cursor-layer" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        <span className="ring-corner tl" />
        <span className="ring-corner tr" />
        <span className="ring-corner bl" />
        <span className="ring-corner br" />
      </div>
    </div>
  );
}
