'use client';

/**
 * Mobile Circuit Rail
 * Renders an animated SVG circuit trace line with glowing dots on mobile devices.
 * Visible exclusively on mobile viewports (< 768px).
 */
export default function MobileCircuitRail() {
  return (
    <aside className="mobile-circuit-rail" aria-hidden="true">
      <svg
        className="mobile-circuit-svg"
        viewBox="0 0 20 800"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle background circuit track */}
        <line
          x1="10"
          y1="20"
          x2="10"
          y2="780"
          className="circuit-track"
        />

        {/* Animated glowing pulse beam travelling along the circuit line */}
        <line
          x1="10"
          y1="20"
          x2="10"
          y2="780"
          className="circuit-glow-track"
        />

        {/* Node 1: Top initiator */}
        <circle cx="10" cy="40" r="3.5" className="circuit-dot" />
        <circle cx="10" cy="40" r="1.5" fill="#ffffff" />

        {/* Node 2: Section marker (Blue pulse) */}
        <circle cx="10" cy="220" r="4" className="circuit-dot" />
        <circle cx="10" cy="220" r="2" fill="#ffffff" />

        {/* Node 3: Midpoint connector (Coral pulse) */}
        <circle cx="10" cy="430" r="4.5" className="circuit-dot-coral" />
        <circle cx="10" cy="430" r="2" fill="#ffffff" />

        {/* Node 4: Lower track connector (Blue pulse) */}
        <circle cx="10" cy="620" r="4" className="circuit-dot" />
        <circle cx="10" cy="620" r="1.8" fill="#ffffff" />

        {/* Node 5: Terminal node */}
        <circle cx="10" cy="760" r="3" className="circuit-dot-coral" />
        <circle cx="10" cy="760" r="1.2" fill="#ffffff" />
      </svg>
    </aside>
  );
}
