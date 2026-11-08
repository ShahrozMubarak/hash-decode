'use client';
import { useEffect, useRef } from 'react';
import { clampUnit, journeyAt } from '@/lib/journey';
import { poseAt, ease, type Pose } from '@/lib/scroll-scene';
export default function JourneyControl() {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement, landing = document.querySelector<HTMLElement>('.landing'), track = rail.current;
    if (!landing || !track) return;
    const stations = Array.from(landing.querySelectorAll<HTMLElement>('[data-station]'));
    const showcase = landing.querySelector<HTMLElement>('#showcase')!, process = landing.querySelector<HTMLElement>('#process')!;
    const heroAnchor = landing.querySelector<HTMLElement>('#hero-model-anchor')!;
    const headings = Array.from(landing.querySelectorAll<HTMLElement>('.band h2'));
    const label = track.querySelector<HTMLElement>('.rail-label')!, dots = Array.from(track.querySelectorAll<SVGCircleElement>('.journey-rail circle'));
    const trail = track.querySelector<SVGSVGElement>('.journey-trail')!, paths = Array.from(trail.querySelectorAll('path'));
    const orbCore = trail.querySelector<SVGCircleElement>('.trail-orb-core');
    const orbGlow = trail.querySelector<SVGCircleElement>('.trail-orb-glow');
    const pathInk = trail.querySelector<SVGPathElement>('.trail-ink');
    let offsets: number[] = [], headingTops: number[] = [], height = 0, heroDistance = 1, processTop = 0, processHeight = 1, tick = 0, dirty = true;
    let hero = { x: 0, y: 0, width: 0, height: 0 };
    const measureBox = (element: HTMLElement, y: number) => { const r = element.getBoundingClientRect(); return { x: r.left, y: r.top + y, width: r.width, height: r.height }; };
    const update = () => {
      tick = 0; const y = window.scrollY, v = window.innerHeight, w = window.innerWidth, mobile = w <= 850, motion = root.dataset.motion === 'on';
      if (dirty) {
        height = root.scrollHeight; offsets = stations.map(el => el.getBoundingClientRect().top + y); headingTops = headings.map(el => el.getBoundingClientRect().top + y); heroDistance = Math.max(v * .45, stations[0].offsetHeight - v); processTop = process.getBoundingClientRect().top + y; processHeight = process.offsetHeight;
        hero = measureBox(heroAnchor, y);
        if (!mobile) {
          const top = landing.getBoundingClientRect().top + y, trailHeight = landing.offsetHeight;
          trail.setAttribute('viewBox', `0 0 ${w} ${trailHeight}`);

          const startBtn = landing.querySelector<HTMLElement>('#overview .cta');
          const endBtn = landing.querySelector<HTMLElement>('#send-brief-btn') || landing.querySelector<HTMLElement>('#brief form button[type="submit"]') || landing.querySelector<HTMLElement>('#brief .cta');

          let startPt = { x: w * .22, y: v * .75 };
          if (startBtn) { const sr = startBtn.getBoundingClientRect(); startPt = { x: sr.left + sr.width * .5, y: sr.top + y - top + sr.height }; }

          let endPt = { x: w * .35, y: trailHeight - 120 };
          if (endBtn) { const er = endBtn.getBoundingClientRect(); endPt = { x: er.left + er.width * .5, y: er.top + y - top }; }

          // Continuous, elegant path starting from Start a project button and descending strictly DOWN
          const totalDy = Math.max(800, endPt.y - startPt.y);

          // Reroute strictly through the outer right margin so it never crosses any text or cards
          const rightMargin = Math.max(w - 44, w * 0.965);
          const rawPoints: { x: number; y: number }[] = [
            { x: startPt.x, y: startPt.y },
            { x: rightMargin, y: startPt.y + 70 },
            { x: rightMargin - 4, y: startPt.y + totalDy * 0.12 },
            { x: rightMargin + 4, y: startPt.y + totalDy * 0.24 },
            { x: rightMargin - 3, y: startPt.y + totalDy * 0.36 },
            { x: rightMargin + 3, y: startPt.y + totalDy * 0.50 },
            { x: rightMargin - 4, y: startPt.y + totalDy * 0.64 },
            { x: rightMargin + 4, y: startPt.y + totalDy * 0.78 },
            { x: rightMargin - 2, y: startPt.y + totalDy * 0.90 },
            { x: rightMargin, y: endPt.y - 70 },
            { x: Math.max(endPt.x + 30, rightMargin - 25), y: endPt.y - 20 },
            { x: endPt.x, y: endPt.y }
          ];

          // Smooth organic cubic Bézier curve with natural tangents
          const d = rawPoints.map((p, i) => {
            if (!i) return `M${p.x} ${p.y}`;
            const a = rawPoints[i - 1];
            const dy = p.y - a.y;
            const cy1 = a.y + dy * 0.45;
            const cy2 = p.y - dy * 0.45;
            return `C${a.x} ${cy1},${p.x} ${cy2},${p.x} ${p.y}`;
          }).join(' ');

          paths.forEach(p => p.setAttribute('d', d));
        }
        dirty = false;
      }
      const state = journeyAt(y, v, height, offsets, heroDistance, processTop, processHeight);
      landing.style.setProperty('--hero-y', '0px'); landing.style.setProperty('--hero-scale', '1');
      const pProgress = motion ? state.process : 1;
      landing.style.setProperty('--process-progress', String(pProgress));
      const processItems = process.querySelectorAll<HTMLElement>('.process-list li');
      processItems.forEach((item, idx) => {
        const threshold = idx / Math.max(1, processItems.length - 1);
        const isActive = pProgress >= threshold - 0.05;
        item.classList.toggle('step-active', isActive);
        item.classList.toggle('step-current', Math.abs(pProgress - threshold) < 0.12);
      });
      landing.style.setProperty('--scene-tint', (mobile ? 0 : Math.sin(state.page * Math.PI * 4) ** 2 * 100).toFixed(2) + '%');
      const showcaseTop = offsets[1], showcaseBottom = offsets[2] || (offsets[1] + showcase.offsetHeight);
      const enterDark = ease((y + v * .45 - showcaseTop) / (v * .45));
      const exitDark = ease((y + v * .1 - showcaseBottom) / (v * .25));
      const dark = mobile ? 0 : Math.max(0, Math.min(1, enterDark * (1 - exitDark)));
      landing.style.setProperty('--story-dark', dark.toFixed(3));
      landing.style.setProperty('--ghost-x', (-state.page * 220) + 'px');
      track.querySelectorAll('.mobile-checkpoint').forEach((dot, i) => { dot.classList.toggle('active', i <= state.current); dot.classList.toggle('current', i === state.current); });
      const gallery = clampUnit((y - offsets[1]) / Math.max(1, showcase.offsetHeight - v * .9));
      landing.style.setProperty('--collection-depth', (mobile ? 0 : gallery * 100) + '%');
      // Slower, smooth progress that doesn't jump 20% ahead
      const progressVal = Math.min(1, Math.max(0, Math.pow(state.page, 0.95) * 1.05));
      track.style.setProperty('--progress', progressVal.toFixed(4));
      label.textContent = stations[state.current].dataset.station + ' · ' + Math.round(state.page * 100) + '%';
      dots.forEach((dot, i) => { const p = clampUnit((offsets[i] - v * .38) / Math.max(1, height - v)); dot.setAttribute('cy', String(4 + 192 * p)); dot.classList.toggle('active', i <= state.current); });

      // Dynamic traveling luminous orb tracking along the exact curve
      if (pathInk && orbCore && orbGlow) {
        const totalLen = pathInk.getTotalLength();
        if (totalLen > 0) {
          const curLen = Math.min(totalLen, Math.max(0, progressVal * totalLen));
          const pt = pathInk.getPointAtLength(curLen);
          orbCore.setAttribute('cx', String(pt.x));
          orbCore.setAttribute('cy', String(pt.y));
          orbGlow.setAttribute('cx', String(pt.x));
          orbGlow.setAttribute('cy', String(pt.y));
        }
      }

      // Pure clean white background throughout the site
      landing.style.setProperty('--scroll-bg', '#ffffff');
      headings.forEach((el, i) => { const on = headingTops[i] < y + v * .94; el.classList.toggle('await-reveal', !on && motion); if (on) el.classList.add('revealed'); });
      const base = (at: number, x: number, cy: number, size: number, phase: number, yaw: number, pitch: number, alpha: number): Pose => ({ at, x, y: cy, size, phase, yaw, pitch, distance: 3.8 - Math.sin(phase * Math.PI / 2) * .65, alpha });
      const hsize = Math.min(hero.width * .36, hero.height * .4);
      const stops = [
        base(0, hero.x + hero.width * .5, hero.y + hero.height * .45, hsize, 0, -.4, -.18, 0),
        base(offsets[1], hero.x + hero.width * .5, hero.y + hero.height * .45, hsize, 0, -.4, -.18, 0),
        base(offsets[2] - v * .25, w * .7, v * .5, 160, 1, 1.3, -.25, 0),
        base(offsets[2], w * .26, v * .46, Math.min(w * .22, v * .32), 1, .8, .5, 1),
        { ...base(offsets[3], w * .72, v * .52, v * .48, 3, 0, 0, 1), distance: 3.4 },
        { ...base(offsets[3] + v * .65, w * .6, v * .52, v * .48, 3, .15, .08, 1), distance: 1.1 },
        { ...base(offsets[3] + v * 1.1, w * .5, v * .52, v * .48, 3, .25, .1, .85), distance: -.45 },
        base(offsets[4] - v * .2, w * .28, v * .52, Math.min(w * .2, v * .3), 3, 2.6, -.3, .8),
        base(offsets[5] - v * .55, w * .86, v * .26, 70, 3, 3.6, .65, .4),
        base(offsets[6] - v * .4, w * .8, v * .2, 54, 3, 4.2, -.4, .15),
        base(offsets[7] - v * .5, w * .88, v * .22, 58, 3.7, 5, .1, 0)];
      const desktop = poseAt(y, stops);
      window.dispatchEvent(new CustomEvent('hd:scroll', { detail: { ...state, gallery, position: y, desktop } }));
    };
    const schedule = () => { if (!tick) tick = requestAnimationFrame(update); }; const measure = () => { dirty = true; schedule(); };
    const resize = new ResizeObserver(measure); resize.observe(landing); resize.observe(document.body); document.fonts?.ready.then(measure).catch(() => { });
    let hovered: HTMLElement | null = null;
    const reset = () => { if (!hovered) return; for (const prop of ['--tilt-x', '--tilt-y', '--mouse-x', '--mouse-y', '--pull-x', '--pull-y']) hovered.style.removeProperty(prop); hovered = null; };
    const move = (e: PointerEvent) => {
      if (!matchMedia('(hover:hover) and (pointer:fine)').matches || root.dataset.motion !== 'on') { reset(); return; }
      const card = e.target instanceof Element ? e.target.closest<HTMLElement>('.service-card,.work-card,.cta') : null; if (hovered !== card) reset(); if (!card) return; hovered = card;
      const box = card.getBoundingClientRect(), x = clampUnit((e.clientX - box.left) / box.width), y = clampUnit((e.clientY - box.top) / box.height);
      card.style.setProperty('--mouse-x', x * 100 + '%'); card.style.setProperty('--mouse-y', y * 100 + '%'); card.style.setProperty('--tilt-x', (0.5 - y) * 3 + 'deg'); card.style.setProperty('--tilt-y', (x - .5) * 3 + 'deg'); card.style.setProperty('--pull-x', (x - .5) * 4 + 'px'); card.style.setProperty('--pull-y', (y - .5) * 4 + 'px');
    };
    const onMotion = () => { reset(); measure(); }; update();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', measure); window.addEventListener('hd:measure', measure); window.addEventListener('hd:motion', onMotion); landing.addEventListener('pointermove', move); landing.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(tick); resize.disconnect(); reset(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); window.removeEventListener('hd:measure', measure); window.removeEventListener('hd:motion', onMotion); landing.removeEventListener('pointermove', move); landing.removeEventListener('pointerleave', reset); };
  }, []);
  return (
    <div ref={rail} aria-hidden="true" className="journey-decoration">
      <svg className="journey-trail" preserveAspectRatio="none">
        <defs>
          <filter id="whiteTrailGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="trail-ambient-glow" />
        <path className="trail-base" />
        <path className="trail-ink" pathLength="1" filter="url(#whiteTrailGlow)" />
        <circle className="trail-orb-glow" r="9" />
        <circle className="trail-orb-core" r="4.2" />
      </svg>
      <aside className="journey-rail">
        <svg viewBox="0 0 8 200" preserveAspectRatio="none">
          <path d="M4 4V196" className="rail-base" />
          <path pathLength="1" d="M4 4V196" className="rail-ink" />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx="4" cy={4 + i * 24} r="2.45" />
          ))}
        </svg>
        <span className="rail-label">Overview</span>
      </aside>
      <div className="mobile-checkpoints">
        {Array.from({ length: 8 }, (_, i) => (
          <i className="mobile-checkpoint" key={i} />
        ))}
      </div>
    </div>
  );
}
