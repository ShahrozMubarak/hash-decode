'use client';

const LETTERS = [
  { char: 'H', x: 80 },
  { char: 'A', x: 180 },
  { char: 'S', x: 280 },
  { char: 'H', x: 380 },
  { char: 'D', x: 780 },
  { char: 'E', x: 855 },
  { char: 'C', x: 930 },
  { char: 'O', x: 1005 },
  { char: 'D', x: 1080 },
  { char: 'E', x: 1155 },
];

export default function HeroWordmark() {
  return (
    <div className="hero-wordmark-backdrop" aria-hidden="true">
      <svg
        viewBox="0 0 1240 160"
        className="hero-wordmark-svg"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          {/* Mask for rising letters through floor */}
          <clipPath id="wmLetterClip">
            <rect x="0" y="0" width="1240" height="160" />
          </clipPath>

          {/* Letter shape clipping mask for light sweep overlay */}
          <clipPath id="wmLettersShape">
            {LETTERS.map((item, idx) => (
              <text
                key={`clip-${item.char}-${idx}`}
                x={item.x}
                y="125"
                textAnchor="middle"
                className="wm-clip-text"
              >
                {item.char}
              </text>
            ))}
          </clipPath>

          {/* 105deg diagonal light sweep gradient */}
          <linearGradient
            id="wmSweepGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientTransform="rotate(15)"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.55)" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Base rising letters layer */}
        <g clipPath="url(#wmLetterClip)">
          {LETTERS.map((item, idx) => (
            <text
              key={`letter-${item.char}-${idx}`}
              x={item.x}
              y="125"
              textAnchor="middle"
              className="wm-letter-node"
              style={{ animationDelay: `${500 + idx * 40}ms` }}
            >
              {item.char}
            </text>
          ))}
        </g>

        {/* Traveling light sweep highlight every 7s (2.2s active duration) */}
        <g clipPath="url(#wmLettersShape)" className="wm-sweep-layer" aria-hidden="true">
          <rect
            className="wm-sweep-runner"
            x="-600"
            y="0"
            width="600"
            height="160"
            fill="url(#wmSweepGrad)"
          />
        </g>
      </svg>
    </div>
  );
}
