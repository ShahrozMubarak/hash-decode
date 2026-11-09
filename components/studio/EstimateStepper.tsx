'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw, Sparkles } from 'lucide-react';

export const scopes = [
  {
    title: 'Web platform',
    price: 1800,
    desc: 'Bespoke web applications, interactive client portals, and performance-focused corporate web presences.',
  },
  {
    title: 'Digital product',
    price: 4500,
    desc: 'End-to-end SaaS products, rich interactive dashboards, customer-facing portals, and MVPs.',
  },
  {
    title: 'Business system',
    price: 3500,
    desc: 'Internal tooling, workflow automations, inventory management, and mission-critical operations backends.',
  },
  {
    title: 'Security audit',
    price: 1200,
    desc: 'Authorized vulnerability assessments, penetration testing, HTTP header hardening, and security audits.',
  },
] as const;

export const features = [
  {
    title: 'User accounts',
    price: 650,
    desc: 'Secure authentication, session management, passwordless or OAuth logins, and user profile management.',
  },
  {
    title: 'Admin dashboard',
    price: 950,
    desc: 'Internal operations cockpit with analytics, content editing, user administration, and audit logs.',
  },
  {
    title: 'External integration',
    price: 850,
    desc: 'Connecting third-party APIs, webhooks, CRMs, payment gateways, and external data feeds.',
  },
  {
    title: 'Multilingual content',
    price: 550,
    desc: 'Localized interface, multi-currency display, and international routing structures.',
  },
  {
    title: 'Data migration',
    price: 900,
    desc: 'Safely extracting, cleaning, mapping, and migrating legacy customer and transaction databases.',
  },
] as const;

export const complexityLevels = [
  {
    label: 'Focused first release',
    multiplier: 1,
    desc: 'Essential core features, clean baseline launch, straightforward data structures.',
  },
  {
    label: 'Multiple workflows',
    multiplier: 1.4,
    desc: 'Multiple user roles, deeper permissions logic, automated alerts, and background jobs.',
  },
  {
    label: 'Complex or regulated',
    multiplier: 2,
    desc: 'Strict compliance requirements, high concurrency, zero-trust security audits, or legacy system bridges.',
  },
] as const;

function formatMoney(amount: number): string {
  const rounded = Math.round(amount / 100) * 100;
  return `US$${rounded.toLocaleString('en-US')}`;
}

export default function EstimateStepper() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedScope, setSelectedScope] = useState<number>(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<number>(0);

  // Animation states for the 700ms count-up
  const [displayedLow, setDisplayedLow] = useState<number>(0);
  const [displayedHigh, setDisplayedHigh] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Base calculation using ONLY user inputs and the real formula
  const baseCost =
    (scopes[selectedScope].price +
      features.reduce(
        (sum, item) => (selectedFeatures.includes(item.title) ? sum + item.price : sum),
        0
      )) *
    complexityLevels[selectedComplexity].multiplier;

  const targetLow = Math.round((baseCost * 0.85) / 100) * 100;
  const targetHigh = Math.round((baseCost * 1.35) / 100) * 100;
  const rangeString = `${formatMoney(targetLow)} – ${formatMoney(targetHigh)}`;
  const contactBrief = `I’m planning a ${scopes[selectedScope].title.toLowerCase()}. Features: ${
    selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'core scope'
  }. Complexity: ${complexityLevels[selectedComplexity].label}. Illustrative estimate: ${rangeString}.`;

  // 700ms count up effect when reaching result step (step 3)
  useEffect(() => {
    if (currentStep !== 3) return;

    const duration = 700;
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayedLow(Math.round(targetLow * ease));
      setDisplayedHigh(Math.round(targetHigh * ease));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateCount);
      } else {
        setDisplayedLow(targetLow);
        setDisplayedHigh(targetHigh);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentStep, targetLow, targetHigh]);

  const toggleFeature = (title: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const stepsMeta = [
    { num: '01', title: 'Scope' },
    { num: '02', title: 'Features' },
    { num: '03', title: 'Complexity' },
    { num: '04', title: 'Estimate' },
  ];

  return (
    <div className="stepper-wrapper">
      {/* Progress header with 300ms animated bar */}
      <div className="stepper-progress-box hd-card" data-reveal="fade">
        <div className="card-glare" aria-hidden="true" />
        <div className="stepper-tabs-row">
          {stepsMeta.map((s, idx) => (
            <button
              key={s.num}
              type="button"
              className={`stepper-tab-item ${idx === currentStep ? 'is-active' : ''} ${
                idx < currentStep ? 'is-completed' : ''
              }`}
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              disabled={idx > currentStep}
            >
              <span className="stepper-tab-num">{s.num}</span>
              <span className="stepper-tab-title">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="stepper-bar-track" aria-hidden="true">
          <div
            className="stepper-bar-fill"
            style={{
              width: `${((currentStep + 1) / stepsMeta.length) * 100}%`,
              transition: 'width 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Step Content Area */}
      <div className="stepper-step-body">
        {/* STEP 1: Project Scope */}
        {currentStep === 0 && (
          <div className="stepper-step-panel" data-reveal="fade">
            <div className="step-intro-text">
              <span className="section-rule-label">Step 1 of 3</span>
              <h2 className="step-section-title">Select your project type</h2>
              <p className="step-section-desc">
                Choose the foundation that best matches what you want to build or audit.
              </p>
            </div>

            <div className="stepper-options-grid grid-2">
              {scopes.map((s, i) => {
                const isSelected = selectedScope === i;
                return (
                  <button
                    key={s.title}
                    type="button"
                    className={`stepper-selectable-card hd-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedScope(i)}
                  >
                    <div className="card-glare" aria-hidden="true" />
                    <div className="card-check-indicator" aria-hidden="true">
                      {isSelected && <Check size={14} className="check-icon" />}
                    </div>
                    <div className="selectable-card-content">
                      <h3 className="selectable-card-title">{s.title}</h3>
                      <p className="selectable-card-desc">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="stepper-nav-bar">
              <div />
              <button
                type="button"
                className="hd-btn-primary"
                onClick={() => setCurrentStep(1)}
              >
                <span className="btn-label">Continue to features</span>
                <span className="btn-arrow-circle" aria-hidden="true">
                  <ArrowRight size={15} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Features */}
        {currentStep === 1 && (
          <div className="stepper-step-panel" data-reveal="fade">
            <div className="step-intro-text">
              <span className="section-rule-label">Step 2 of 3</span>
              <h2 className="step-section-title">Select additional capabilities</h2>
              <p className="step-section-desc">
                Pick all features relevant to your product. You can select multiple options or skip to keep it minimal.
              </p>
            </div>

            <div className="stepper-options-grid grid-2">
              {features.map((f) => {
                const isSelected = selectedFeatures.includes(f.title);
                return (
                  <button
                    key={f.title}
                    type="button"
                    className={`stepper-selectable-card hd-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleFeature(f.title)}
                  >
                    <div className="card-glare" aria-hidden="true" />
                    <div className="card-check-indicator" aria-hidden="true">
                      {isSelected && <Check size={14} className="check-icon" />}
                    </div>
                    <div className="selectable-card-content">
                      <h3 className="selectable-card-title">{f.title}</h3>
                      <p className="selectable-card-desc">{f.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="stepper-nav-bar">
              <button
                type="button"
                className="hd-btn-secondary"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Back to scope</span>
              </button>
              <button
                type="button"
                className="hd-btn-primary"
                onClick={() => setCurrentStep(2)}
              >
                <span className="btn-label">Continue to complexity</span>
                <span className="btn-arrow-circle" aria-hidden="true">
                  <ArrowRight size={15} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complexity */}
        {currentStep === 2 && (
          <div className="stepper-step-panel" data-reveal="fade">
            <div className="step-intro-text">
              <span className="section-rule-label">Step 3 of 3</span>
              <h2 className="step-section-title">Select scope complexity</h2>
              <p className="step-section-desc">
                Different levels of regulatory scrutiny, concurrency, or integration depth affect execution time.
              </p>
            </div>

            <div className="stepper-options-grid grid-3">
              {complexityLevels.map((lvl, idx) => {
                const isSelected = selectedComplexity === idx;
                return (
                  <button
                    key={lvl.label}
                    type="button"
                    className={`stepper-selectable-card hd-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedComplexity(idx)}
                  >
                    <div className="card-glare" aria-hidden="true" />
                    <div className="card-check-indicator" aria-hidden="true">
                      {isSelected && <Check size={14} className="check-icon" />}
                    </div>
                    <div className="selectable-card-content">
                      <h3 className="selectable-card-title">{lvl.label}</h3>
                      <p className="selectable-card-desc">{lvl.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="stepper-nav-bar">
              <button
                type="button"
                className="hd-btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                <span>Back to features</span>
              </button>
              <button
                type="button"
                className="hd-btn-primary"
                onClick={() => setCurrentStep(3)}
              >
                <span className="btn-label">Calculate estimate</span>
                <span className="btn-arrow-circle" aria-hidden="true">
                  <Sparkles size={15} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Result summary & 700ms count-up */}
        {currentStep === 3 && (
          <div className="stepper-step-panel" data-reveal="fade">
            <div className="estimate-result-card hd-card" aria-live="polite">
              <div className="card-glare" aria-hidden="true" />

              <div className="result-disclaimer-pill">
                <span>Estimate only, not a quote</span>
              </div>

              <div className="result-headline-group">
                <span className="section-rule-label">Planning range (USD)</span>
                <h2 className="result-counted-price">
                  {formatMoney(displayedLow)} – {formatMoney(displayedHigh)}
                </h2>
                <p className="result-description-lead">
                  An illustrative planning range based strictly on your selected inputs.
                  Final quotes are confirmed following a brief technical consultation.
                </p>
              </div>

              {/* Breakdown of selections */}
              <div className="result-breakdown-box">
                <h4 className="breakdown-title">Configuration summary</h4>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Foundation:</span>
                    <strong className="breakdown-value">{scopes[selectedScope].title}</strong>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Complexity:</span>
                    <strong className="breakdown-value">
                      {complexityLevels[selectedComplexity].label}
                    </strong>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Features:</span>
                    <strong className="breakdown-value">
                      {selectedFeatures.length > 0
                        ? selectedFeatures.join(', ')
                        : 'Baseline release (no extra features selected)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="result-actions-row">
                <a
                  className="hd-btn-primary"
                  href={`/contact?type=${encodeURIComponent(
                    scopes[selectedScope].title
                  )}&brief=${encodeURIComponent(contactBrief)}`}
                >
                  <span className="btn-label">Discuss this estimate</span>
                  <span className="btn-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={15} />
                  </span>
                </a>

                <button
                  type="button"
                  className="hd-btn-secondary"
                  onClick={() => setCurrentStep(0)}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  <span>Adjust selections</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

