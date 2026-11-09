'use client';

import { useState } from 'react';
import SceneSurface from './SceneSurface';

export default function HeroModelContainer() {
  const [activeModel, setActiveModel] = useState<'eva' | 'nova'>('eva');

  return (
    <figure className="hero-object">
      <div className="hero-robot-glow" aria-hidden="true" />
      <div className="hero-robot-shadow" aria-hidden="true" />

      {/* Desktop-only Model Switcher */}
      <div
        className="hero-model-switcher desktop-only"
        role="group"
        aria-label="3D Model Selection"
      >
        <button
          type="button"
          className={`hero-model-btn ${activeModel === 'eva' ? 'is-active' : ''}`}
          onClick={() => setActiveModel('eva')}
        >
          EVA Robot
        </button>
        <button
          type="button"
          className={`hero-model-btn ${activeModel === 'nova' ? 'is-active' : ''}`}
          onClick={() => setActiveModel('nova')}
        >
          Nova Model
        </button>
      </div>

      <div className="specimen-visual" id="hero-model-anchor">
        {activeModel === 'eva' ? (
          <SceneSurface model="eva" autoMobile={true} />
        ) : (
          <div className="nova-hero-viewport">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/models/novaai/hero-poster.jpg"
              src="/models/novaai/hero.mp4"
              className="nova-hero-video"
            />
          </div>
        )}
      </div>
    </figure>
  );
}
