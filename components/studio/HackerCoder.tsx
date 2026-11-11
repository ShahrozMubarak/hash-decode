'use client';
import { useEffect, useRef, useState } from 'react';

export default function HackerCoder() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTypingFast, setIsTypingFast] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMove);
      return () => node.removeEventListener('mousemove', handleMove);
    }
  }, []);

  // Parallax subtle shifts
  const headShiftX = mousePos.x * 12;
  const headShiftY = mousePos.y * 6;
  const laptopGlowIntensity = isTypingFast ? 1.6 : 1.0;

  return (
    <div
      ref={containerRef}
      className="hacker-coder-wrapper"
      onMouseEnter={() => setIsTypingFast(true)}
      onMouseLeave={() => setIsTypingFast(false)}
      onClick={() => {
        setIsTypingFast(true);
        setTimeout(() => setIsTypingFast(false), 2000);
      }}
      title="Click or hover to accelerate security analysis"
    >
      <div className="hacker-ambient-glow" style={{ opacity: laptopGlowIntensity }} />

      <svg
        viewBox="0 0 800 620"
        className="hacker-svg-stage"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for dark hoodie silhouette */}
          <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#141926" />
            <stop offset="60%" stop-color="#090d18" />
            <stop offset="100%" stop-color="#04060c" />
          </linearGradient>

          {/* Frosted White & Coral Magma Laptop Cast Light */}
          <radialGradient id="screenCastGrad" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.45)" />
            <stop offset="40%" stop-color="rgba(255, 77, 54, 0.25)" />
            <stop offset="100%" stop-color="transparent" />
          </radialGradient>

          {/* Screen Light Reflection on Face and Hood */}
          <linearGradient id="faceRimLight" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.7)" />
            <stop offset="60%" stop-color="rgba(255, 77, 54, 0.25)" />
            <stop offset="100%" stop-color="transparent" />
          </linearGradient>

          {/* Frosted White & Coral rim highlight */}
          <linearGradient id="neonRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="50%" stop-color="#ff4d36" />
            <stop offset="100%" stop-color="#ffffff" />
          </linearGradient>

          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="skullGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffffff" flood-opacity="0.85" />
          </filter>
        </defs>

        {/* Ambient Desk Surface Reflection */}
        <ellipse cx="400" cy="540" rx="360" ry="60" fill="url(#screenCastGrad)" />

        {/* ==============================================================
            ENGINEER IN HOODIE (Back/Side 3/4 perspective matching Image 3)
            ============================================================== */}
        <g style={{ transform: `translate(${headShiftX * 0.4}px, ${headShiftY * 0.3}px)` }}>
          {/* Main Body & Shoulders */}
          <path
            d="M240 560 C240 440, 290 350, 400 350 C510 350, 560 440, 560 560 L240 560 Z"
            fill="url(#hoodieGrad)"
          />

          {/* Shoulder folds & shadows */}
          <path
            d="M250 540 C280 470, 340 430, 400 430 C460 430, 520 470, 550 540"
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            stroke-width="3"
            stroke-opacity="0.25"
          />

          {/* Hoodie Body (Arms coming forward toward desk) */}
          <path
            d="M260 520 C280 460, 310 440, 340 440 L350 490 L290 530 Z"
            fill="#09101f"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="1.5"
            stroke-opacity="0.3"
          />
          <path
            d="M540 520 C520 460, 490 440, 460 440 L450 490 L510 530 Z"
            fill="#09101f"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="1.5"
            stroke-opacity="0.3"
          />

          {/* Hood Shape */}
          <path
            d="M325 350 C325 210, 475 210, 475 350 C475 385, 450 405, 400 405 C350 405, 325 385, 325 350 Z"
            fill="url(#hoodieGrad)"
            stroke="rgba(255, 255, 255, 0.35)"
            stroke-width="2.5"
            stroke-opacity="0.4"
          />

          {/* Inner Hood Dark Void & Silhouette Face */}
          <path
            d="M345 340 C345 240, 455 240, 455 340 C455 375, 435 390, 400 390 C365 390, 345 375, 345 340 Z"
            fill="#03060d"
          />

          {/* Profile Jaw / Nose Rim Light from Laptop */}
          <path
            d="M385 290 Q405 315 395 345 L380 350"
            fill="none"
            stroke="url(#neonRim)"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.75"
          />

          {/* Hoodie Creases and Folds (Image 3 Art Style) */}
          <path
            d="M360 250 C375 235, 425 235, 440 250"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="3"
            stroke-opacity="0.3"
          />
          <path
            d="M340 310 C360 300, 370 320, 375 350"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="2.5"
            stroke-opacity="0.3"
          />
          <path
            d="M460 310 C440 300, 430 320, 425 350"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            stroke-width="2.5"
            stroke-opacity="0.3"
          />

          {/* Hoodie Drawstrings */}
          <path d="M375 385 Q370 430 365 460" fill="none" stroke="#ff4d36" stroke-width="2.5" />
          <path d="M425 385 Q430 430 435 460" fill="none" stroke="#ff4d36" stroke-width="2.5" />
        </g>

        {/* ==============================================================
            CYBERNETIC TYPING HANDS (Moving rapidly on keyboard)
            ============================================================== */}
        <g className={`hacker-hands ${isTypingFast ? 'typing-intense' : 'typing-normal'}`}>
          {/* Left Hand & Forearm */}
          <path
            d="M320 480 L355 465 L375 490 L335 505 Z"
            fill="#0c172d"
            stroke="rgba(255, 255, 255, 0.45)"
            stroke-width="1.5"
            stroke-opacity="0.5"
          />
          <g className="hand-left-fingers">
            <ellipse cx="370" cy="482" rx="7" ry="4" fill="#ffffff" opacity="0.85" />
            <ellipse cx="380" cy="486" rx="6" ry="4" fill="#ff4d36" opacity="0.85" />
            <ellipse cx="390" cy="490" rx="6" ry="4" fill="#ffffff" opacity="0.85" />
          </g>

          {/* Right Hand & Forearm */}
          <path
            d="M480 480 L445 465 L425 490 L465 505 Z"
            fill="#0c172d"
            stroke="rgba(255, 255, 255, 0.45)"
            stroke-width="1.5"
            stroke-opacity="0.5"
          />
          <g className="hand-right-fingers">
            <ellipse cx="430" cy="482" rx="7" ry="4" fill="#ffffff" opacity="0.85" />
            <ellipse cx="420" cy="486" rx="6" ry="4" fill="#ff4d36" opacity="0.85" />
            <ellipse cx="410" cy="490" rx="6" ry="4" fill="#ffffff" opacity="0.85" />
          </g>
        </g>

        {/* ==============================================================
            THE LAPTOP (Turned slightly, with Skull & Crossbones on Lid)
            ============================================================== */}
        <g style={{ transform: `translate(${headShiftX * 0.15}px, ${headShiftY * 0.15}px)` }}>
          {/* Laptop Base (Keyboard Deck) */}
          <polygon
            points="280,510 520,510 570,555 230,555"
            fill="#060c18"
            stroke="#ffffff"
            stroke-width="2.5"
          />

          {/* Glowing Trackpad */}
          <polygon
            points="375,532 425,532 432,548 368,548"
            fill="none"
            stroke="#ff4d36"
            stroke-width="1.2"
            opacity="0.65"
          />

          {/* Keyboard Grid with animated neon key strikes */}
          <g opacity="0.85">
            <line x1="295" y1="518" x2="505" y2="518" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="8 3" opacity="0.6" />
            <line x1="290" y1="524" x2="510" y2="524" stroke="#ff4d36" stroke-width="1.5" stroke-dasharray="10 4" opacity="0.8" />
            <line x1="285" y1="530" x2="515" y2="530" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="9 3" opacity="0.6" />
          </g>

          {/* Laptop Screen Lid (Facing the Viewer at an angle) */}
          <polygon
            points="310,340 490,340 520,510 280,510"
            fill="#02050c"
            stroke="#ffffff"
            stroke-width="3"
            className="laptop-screen-lid"
          />

          {/* Inner Bezel Accent */}
          <polygon
            points="318,348 482,348 510,504 290,504"
            fill="none"
            stroke="#ff4d36"
            stroke-width="1.4"
            opacity="0.5"
          />

          {/* ==============================================================
              SKULL & CROSSBONES EMBLEM (Matching Image 3)
              ============================================================== */}
          <g filter="url(#skullGlow)" transform="translate(400, 425) scale(0.92)">
            {/* Crossbones Underneath */}
            <path
              d="M-45 -28 L45 28 M-45 28 L45 -28"
              stroke="#ffffff"
              stroke-width="9"
              stroke-linecap="round"
            />
            {/* Bone End Knobs */}
            <circle cx="-47" cy="-30" r="5.5" fill="#ffffff" />
            <circle cx="-43" cy="-24" r="5.5" fill="#ffffff" />
            <circle cx="47" cy="30" r="5.5" fill="#ffffff" />
            <circle cx="43" cy="24" r="5.5" fill="#ffffff" />
            <circle cx="-47" cy="30" r="5.5" fill="#ffffff" />
            <circle cx="-43" cy="24" r="5.5" fill="#ffffff" />
            <circle cx="47" cy="-30" r="5.5" fill="#ffffff" />
            <circle cx="43" cy="-24" r="5.5" fill="#ffffff" />

            {/* Skull Main Cranium */}
            <path
              d="M-26 -16 C-26 -38, 26 -38, 26 -16 C26 -4, 18 6, 14 12 L-14 12 C-18 6, -26 -4, -26 -16 Z"
              fill="#ffffff"
            />

            {/* Skull Eye Sockets */}
            <ellipse cx="-10" cy="-14" rx="6" ry="7" fill="#02050c" />
            <ellipse cx="10" cy="-14" rx="6" ry="7" fill="#02050c" />

            {/* Skull Inverted Heart Nose */}
            <polygon points="0,-4 -3,2 3,2" fill="#02050c" />

            {/* Skull Teeth Row */}
            <g fill="#02050c">
              <rect x="-10" y="8" width="3" height="6" rx="1" />
              <rect x="-5" y="8" width="3" height="6" rx="1" />
              <rect x="0" y="8" width="3" height="6" rx="1" />
              <rect x="5" y="8" width="3" height="6" rx="1" />
              <rect x="10" y="8" width="3" height="6" rx="1" />
            </g>
          </g>

          {/* Screen Light Projection Particles Emitted Upwards */}
          <g className="data-fumes">
            <circle cx="360" cy="460" r="2" fill="#ffffff" opacity="0.9" />
            <circle cx="440" cy="450" r="2.5" fill="#ff4d36" opacity="0.85" />
            <circle cx="390" cy="430" r="1.5" fill="#ffffff" opacity="0.9" />
            <circle cx="420" cy="410" r="2" fill="#ff4d36" opacity="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}

