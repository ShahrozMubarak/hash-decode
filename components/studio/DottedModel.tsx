'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createDottedRenderer, DottedRenderer } from '@/lib/dotted-models';

export type DottedFormKey = 0 | 1 | 2 | 3 | 'hash' | 'knot' | 'sphere' | 'torus';

export interface DottedModelProps {
  form?: DottedFormKey;
  badge?: string;
  title?: string;
  caption?: string;
  interactive?: boolean;
  autoRotate?: boolean;
  height?: number | string;
  particlesCount?: number;
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
  onExplore?: () => void;
}

const FORM_MAP: Record<string, number> = {
  hash: 0,
  knot: 1,
  sphere: 2,
  torus: 3,
};

export default function DottedModel(props:DottedModelProps){return <DottedInstance key={props.form??0} {...props}/>;}
function DottedInstance({
  form = 0,
  badge = 'SPECIMEN // 3D',
  title,
  caption,
  interactive = true,
  autoRotate = true,
  height = '360px',
  particlesCount = 4500,
  theme = 'auto',
  className = '',
}: DottedModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DottedRenderer | null>(null);

  const [activeForm, setActiveForm] = useState<number>(() => {
    return typeof form === 'string' ? (FORM_MAP[form] ?? 0) : form;
  });

  const [isInteractiveActive, setIsInteractiveActive] = useState(false);


  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: DottedRenderer | null = null;
    try {
      renderer = createDottedRenderer(canvas, particlesCount);
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGL initialization failed for DottedModel:', e);
      return;
    }

    let isVisible = true;
    const isPaused = false;
    let animId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let rot = -0.35;

    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000, active: 0 };
    let isDragging = false;
    let dragStartX = 0;
    let dragStartRot = 0;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function handleResize() {
      if (!canvas || !renderer || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.resize(w, h, dpr);
    }

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(loop);
      }
    }, { threshold: 0.1 });
    io.observe(container);

    function loop(now: number) {
      if (!isVisible || !renderer || !container) {
        animId = 0;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000 || 0.016, 0.05);
      lastTime = now;

      if (!isPaused) {
        elapsed += dt;
        if (autoRotate && !isDragging) {
          rot += (isReduced ? 0.01 : 0.28) * dt;
        }
      }

      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 15));
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 15));

      const w = container.clientWidth;
      const h = container.clientHeight;
      const baseScale = Math.min(w * 0.35, h * 0.42);

      let isDark = 0;
      if (theme === 'dark') isDark = 1;
      else if (theme === 'light') isDark = 0;
      else {
        isDark = document.documentElement.dataset.theme === 'dark' ? 1 : 0;
      }

      renderer.draw({
        x: w * 0.5,
        y: h * 0.5,
        size: baseScale,
        phase: activeForm,
        rotation: rot,
        explode: 0,
        time: elapsed,
        ambient: 1,
        dark: isDark,
        alpha: 1,
      }, {
        x: pointer.x,
        y: pointer.y,
        active: pointer.active,
      });

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    // Pointer events
    function onPointerMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      pointer.tx = clientX;
      pointer.ty = clientY;
      pointer.active = 1;

      if (isDragging) {
        const dx = e.clientX - dragStartX;
        rot = dragStartRot + dx * 0.01;
      }
    }

    function onPointerLeave() {
      pointer.active = 0;
      pointer.tx = -1000;
      pointer.ty = -1000;
      isDragging = false;
      setIsInteractiveActive(false);
    }

    function onPointerDown(e: PointerEvent) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartRot = rot;
      setIsInteractiveActive(true);
    }

    function onPointerUp() {
      isDragging = false;
    }

    if (interactive) {
      canvas.addEventListener('pointermove', onPointerMove, { passive: true });
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
    }

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      if (interactive && canvas) {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
      }
      renderer?.destroy();
      rendererRef.current = null;
    };
  }, [activeForm, autoRotate, interactive, particlesCount, theme]);

  const formLabels = [
    { id: 0, name: 'Hash #' },
    { id: 1, name: 'Torus Knot' },
    { id: 2, name: 'Cyber Sphere' },
    { id: 3, name: 'Fluted Torus' },
  ];

  return (
    <div
      ref={containerRef}
      className={`dotted-model-card ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '12px',
        border: '1px solid var(--line)',
        background: 'radial-gradient(ellipse at 50% 30%, var(--ice), var(--wash) 70%, transparent)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
        <span
          style={{
            font: '600 0.65rem/1.4 var(--mono, monospace)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <i
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--coral)',
              boxShadow: 'none',
            }}
          />
          {badge}
        </span>

        {/* Morph Form Switcher Buttons */}
        <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'var(--frost)', backdropFilter: 'blur(8px)', padding: '3px', borderRadius: '100px', border: '1px solid var(--line)' }}>
          {formLabels.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveForm(f.id)}
              style={{
                border: 0,
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontFamily: 'var(--mono, monospace)',
                letterSpacing: '0.04em',
                fontWeight: activeForm === f.id ? 700 : 500,
                background: activeForm === f.id ? 'var(--coral)' : 'transparent',
                color: activeForm === f.id ? 'var(--navy)' : 'var(--text)',
                boxShadow: activeForm === f.id ? 'none' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: interactive ? (isInteractiveActive ? 'grabbing' : 'grab') : 'default',
          zIndex: 1,
        }}
      />

      <div style={{ zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', pointerEvents: 'none' }}>
        <div>
          {title && (
            <h4
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
              }}
            >
              {title}
            </h4>
          )}
          {caption && (
            <p
              style={{
                margin: '0.2rem 0 0',
                fontSize: '0.74rem',
                color: 'var(--text)',
                maxWidth: '45ch',
                lineHeight: 1.45,
              }}
            >
              {caption}
            </p>
          )}
        </div>
        <span
          style={{
            font: '0.62rem var(--mono, monospace)',
            color: 'var(--text)',
            opacity: 0.75,
            letterSpacing: '0.05em',
          }}
        >
          DRAG TO ROTATE · HOVER TO DEFLECT
        </span>
      </div>
    </div>
  );
}

