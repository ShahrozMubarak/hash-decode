'use client';

import { ShieldCheck } from 'lucide-react';

export default function StudioManifesto() {
  return (
    <section className="studio-manifesto-section" aria-label="Studio Manifesto">
      <div className="wrap studio-manifesto-wrap">
        <div className="studio-manifesto-card" data-reveal="up">
          <div className="manifesto-top-meta">
            <span className="manifesto-badge">
              <ShieldCheck size={14} className="manifesto-badge-icon" aria-hidden="true" />
              <span>THE STUDIO MANIFESTO · ZERO COMPROMISE</span>
            </span>
            <span className="manifesto-kicker">INDEPENDENT SOFTWARE ENGINEERING</span>
          </div>

          <h2 className="manifesto-title">
            Engineering software that endures.
          </h2>

          <p className="manifesto-paragraph">
            We believe software should be built with mathematical discipline, architectural honesty, and uncompromising security. In an era of bloated frameworks, fragile abstractions, and hidden vendor dependencies, Hash Decode operates as an independent engineering atelier. We do not delegate to junior contractors or hide behind account managers; we sit shoulder-to-shoulder with founders and engineering leaders to design resilient platforms, audit critical attack surfaces, and transfer 100% of the code, keys, and cloud infrastructure directly to you. From sub-second API pipelines to penetration-tested authentication boundaries, every system we release is engineered to outlast hype cycles and perform under real-world pressure.
          </p>

          <div className="manifesto-footer">
            <div className="manifesto-signature">
              <span className="signature-name">Shahroz Dogar</span>
              <span className="signature-role">Founder &amp; Chief Architect, Hash Decode</span>
            </div>
            <div className="manifesto-accreditation">
              <span className="accreditation-dot" aria-hidden="true" />
              <span>100% Client-Owned Code &amp; Cloud Credentials</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
