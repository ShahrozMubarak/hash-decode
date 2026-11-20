'use client';

import type { ReactNode, HTMLAttributes } from 'react';
import type { LiquidPalette } from './Liquid';
import { getPaletteMode } from './Liquid';
import PhoneMockup, { type PhoneMockupVariant } from './visuals/PhoneMockup';
import LaptopMockup from './visuals/LaptopMockup';

export interface AppleDeviceCardProps extends HTMLAttributes<HTMLElement> {
  palette?: LiquidPalette;
  eyebrow?: string;
  title?: string;
  highlightWords?: string[];
  sub?: string;
  deviceType?: 'phone' | 'laptop';
  serviceVariant?: PhoneMockupVariant;
  interactive?: boolean;
  ctaText?: string;
  ctaHref?: string;
  ctaVariant?: 'coral' | 'azure' | 'dark' | 'white';
  children?: ReactNode;
  className?: string;
}

export default function AppleDeviceCard({
  palette = 'cloud',
  eyebrow,
  title,
  highlightWords = [],
  sub,
  deviceType = 'phone',
  serviceVariant = 'web',
  interactive = false,
  ctaText,
  ctaHref,
  ctaVariant = 'coral',
  children,
  className = '',
  ...props
}: AppleDeviceCardProps) {
  const mode = getPaletteMode(palette);

  return (
    <article
      className={`apple-device-card liquid liquid--${palette} ${className}`.trim()}
      data-mode={mode}
      {...props}
    >
      <span className="liquid__blob liquid__blob--a" aria-hidden="true" />
      <span className="liquid__blob liquid__blob--b" aria-hidden="true" />

      <div className="apple-device-card__inner">
        {/* Top Header Section */}
        <header className="apple-device-card__header">
          {eyebrow && <span className="apple-device-card__eyebrow">{eyebrow}</span>}
          {title && <h3 className="apple-device-card__title">{title}</h3>}

          {/* Optional Stylized Word Tiles (Apple News+ 'P U Z Z L E S' tribute style) */}
          {highlightWords && highlightWords.length > 0 && (
            <div className="apple-word-tiles-row" aria-label={highlightWords.join(' ')}>
              {highlightWords.map((word, wIdx) => (
                <div key={wIdx} className="apple-word-tile-group">
                  {word.split('').map((char, cIdx) => (
                    <span key={cIdx} className="apple-char-tile">
                      {char}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Center: Device Stage */}
        <div className="apple-device-card__stage">
          {deviceType === 'phone' ? (
            <PhoneMockup
              variant={serviceVariant}
              interactive={interactive}
            />
          ) : (
            <LaptopMockup />
          )}
        </div>

        {/* Bottom Descriptive Copy & Actions */}
        {(sub || (ctaText && ctaHref) || children) && (
          <footer className="apple-device-card__footer">
            {sub && <p className="apple-device-card__sub">{sub}</p>}

            {ctaText && ctaHref && (
              <div className="apple-device-card__actions">
                <a
                  href={ctaHref}
                  className={
                    ctaVariant === 'coral'
                      ? 'hd-btn-coral'
                      : cVariantClass(ctaVariant)
                  }
                >
                  <span className="btn-label">{ctaText}</span>
                </a>
              </div>
            )}

            {children}
          </footer>
        )}
      </div>
    </article>
  );
}

function cVariantClass(v: 'coral' | 'azure' | 'dark' | 'white') {
  switch (v) {
    case 'coral':
      return 'hd-btn-coral';
    case 'azure':
      return 'hd-btn-azure';
    case 'white':
      return 'hd-btn-white';
    default:
      return 'hd-btn-dark';
  }
}
