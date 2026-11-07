'use client';
import { useEffect, useRef } from 'react';

const CYBER_GLYPHS = [
  '⬡', '◈', '₿', 'Ξ', 'Ł', '⬢', 'λ', '⏣', '⌖', '⚡', '✦',
  '0', '1', 'B', 'D', 'X', 'E', 'C', 'O', 'D', 'E',
  '0x', 'FF', '::', '&&', '=>', '{ }', '</>', '🔒', 'λ',
  '10', '01', 'HEX', 'SYS', 'NET', 'API', 'KEY', 'BOT'
];

interface StreamCol {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  chars: string[];
  length: number;
  fontSize: number;
  oscSpeed: number;
  oscAmp: number;
  dir: number;
}

export default function CodingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let cols: StreamCol[] = [];

    const initCols = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width || window.innerWidth);
      height = Math.floor(rect.height || window.innerHeight);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);

      const colSpacing = Math.max(22, Math.floor(width / 48));
      const colCount = Math.floor(width / colSpacing);

      cols = Array.from({ length: colCount }, (_, i) => {
        const length = 18 + Math.floor(Math.random() * 22);
        const chars = Array.from({ length }, () =>
          CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)]
        );
        const fontSize = 13 + Math.floor(Math.random() * 4);
        const speed = 1.0 + Math.random() * 2.2;
        const dir = i % 3 === 0 ? -1 : 1; // Some streams oscillate up/down
        return {
          x: i * colSpacing + Math.floor(colSpacing * 0.15),
          y: Math.random() * height * 1.5 - height * 0.5,
          baseY: Math.random() * height,
          speed,
          chars,
          length,
          fontSize,
          oscSpeed: 0.0015 + Math.random() * 0.003,
          oscAmp: 25 + Math.random() * 45,
          dir
        };
      });
    };

    initCols();

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 60);
      lastTime = time;

      // Dark background trail persistence
      ctx.fillStyle = 'rgba(2, 8, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      cols.forEach((col) => {
        // Vertical movement with continuous up/down oscillation
        const osc = Math.sin(time * col.oscSpeed + col.x) * col.oscAmp;
        col.y += col.speed * (delta / 16.6);

        if (col.y - col.length * col.fontSize > height) {
          col.y = -col.length * col.fontSize - Math.random() * 100;
          col.speed = 1.0 + Math.random() * 2.2;
        }

        // Randomly mutate random character in column for cyber flicker
        if (Math.random() < 0.12) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] = CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
        }

        ctx.font = `600 ${col.fontSize}px var(--mono, "JetBrains Mono", monospace)`;

        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * col.fontSize + (col.dir === -1 ? osc : 0);
          if (charY < -20 || charY > height + 20) continue;

          const char = col.chars[j];

          if (j === 0) {
            // Bright neon head
            ctx.fillStyle = '#f0fdf4';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 14;
            ctx.fillText(char, col.x, charY);
          } else if (j < 3) {
            // Neon cyan aura
            ctx.fillStyle = '#67e8f9';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
            ctx.fillText(char, col.x, charY);
          } else {
            // Fading cyber trail
            const fade = 1 - j / col.length;
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(14, 165, 233, ${Math.max(0.06, (fade * 0.75)).toFixed(3)})`;
            ctx.fillText(char, col.x, charY);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      initCols();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="coding-bg-canvas" aria-hidden="true">
      <canvas ref={canvasRef} className="cyber-matrix-canvas" />
      <div className="coding-bg-vignette" />
    </div>
  );
}
