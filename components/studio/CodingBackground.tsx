'use client';
import { useEffect, useRef } from 'react';

const CYBER_GLYPHS = [
  '⬡', '◈', '₿', 'Ξ', 'Ł', '⬢', 'λ', '⏣', '⌖', '⚡', '✦',
  '0', '1', 'B', 'D', 'X', 'E', 'C', 'O', 'D', 'E',
  '0x', 'FF', '::', '&&', '=>', '{ }', '</>', '🔒', 'λ',
  '10', '01', 'HEX', 'SYS', 'NET', 'API', 'KEY', 'BOT',
  'SHA', 'AES', 'RSA', 'HASH', 'SEED', 'NODE', 'FLOW', 'G', 'K'
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
  layer: 'fore' | 'back';
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

      // Ultra-dense column spacing (13-16px) for abundant matrix coding streams
      const colSpacing = Math.max(14, Math.floor(width / 95));
      const colCount = Math.floor(width / colSpacing);

      cols = Array.from({ length: colCount }, (_, i) => {
        const length = 32 + Math.floor(Math.random() * 42);
        const chars = Array.from({ length }, () =>
          CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)]
        );
        const isFore = i % 2 === 0;
        const fontSize = isFore ? 12 + Math.floor(Math.random() * 3) : 10 + Math.floor(Math.random() * 2);
        const speed = isFore ? 1.2 + Math.random() * 2.8 : 0.7 + Math.random() * 1.5;
        const dir = i % 3 === 0 ? -1 : 1; // Alternating subtle vertical sine drift
        return {
          x: i * colSpacing + Math.floor(colSpacing * 0.1),
          y: Math.random() * height * 1.6 - height * 0.6,
          baseY: Math.random() * height,
          speed,
          chars,
          length,
          fontSize,
          oscSpeed: 0.0012 + Math.random() * 0.0025,
          oscAmp: 20 + Math.random() * 35,
          dir,
          layer: isFore ? 'fore' : 'back',
        };
      });
    };

    initCols();

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 60);
      lastTime = time;

      // Dark background trail persistence for liquid neon blur
      ctx.fillStyle = 'rgba(2, 8, 23, 0.22)';
      ctx.fillRect(0, 0, width, height);

      cols.forEach((col) => {
        // Vertical movement with continuous up/down oscillation
        const osc = Math.sin(time * col.oscSpeed + col.x * 0.05) * col.oscAmp;
        col.y += col.speed * (delta / 16.6);

        if (col.y - col.length * col.fontSize > height + 50) {
          col.y = -col.length * col.fontSize - Math.random() * 80;
          col.speed = col.layer === 'fore' ? 1.2 + Math.random() * 2.8 : 0.7 + Math.random() * 1.5;
        }

        // Randomly mutate random character in column for digital cipher flicker
        if (Math.random() < 0.15) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] = CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
        }

        ctx.font = `600 ${col.fontSize}px var(--mono, "JetBrains Mono", monospace)`;

        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * col.fontSize + (col.dir === -1 ? osc : 0);
          if (charY < -20 || charY > height + 20) continue;

          const char = col.chars[j];

          if (j === 0) {
            // Bright luminous head
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = col.layer === 'fore' ? 14 : 7;
            ctx.fillText(char, col.x, charY);
          } else if (j < 4) {
            // Luminous frosted platinum aura
            ctx.fillStyle = '#e2e8f0';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
            ctx.shadowBlur = col.layer === 'fore' ? 8 : 3;
            ctx.fillText(char, col.x, charY);
          } else {
            // Fading cyber trail
            const fade = 1 - j / col.length;
            ctx.shadowBlur = 0;
            const alpha = col.layer === 'fore'
              ? Math.max(0.06, fade * 0.75)
              : Math.max(0.03, fade * 0.45);
            ctx.fillStyle = `rgba(203, 213, 225, ${alpha.toFixed(3)})`;
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
