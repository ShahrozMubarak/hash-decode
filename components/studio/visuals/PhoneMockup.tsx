'use client';

import { useState, type HTMLAttributes } from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Activity,
  Layers,
  Server,
  Terminal,
  Zap,
  Globe,
  Database,
  BarChart3,
  Wifi,
  Sliders,
} from 'lucide-react';

export type PhoneMockupVariant = 'web' | 'cloud' | 'security' | 'tools';

export interface PhoneMockupProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PhoneMockupVariant;
  /** Enable interactive tab switching between service views on the phone */
  interactive?: boolean;
  className?: string;
}

export default function PhoneMockup({
  variant: initialVariant = 'web',
  interactive = false,
  className = '',
  ...props
}: PhoneMockupProps) {
  const [activeTab, setActiveTab] = useState<PhoneMockupVariant>(initialVariant);
  const currentVariant = interactive ? activeTab : initialVariant;

  return (
    <div className={`phone-mockup-wrapper ${className}`.trim()} {...props}>
      {/* Interactive Tabs above phone if interactive */}
      {interactive && (
        <div className="phone-interactive-switcher" role="tablist" aria-label="Device Service Showcase">
          <button
            type="button"
            role="tab"
            aria-selected={currentVariant === 'web'}
            onClick={() => setActiveTab('web')}
            className={`phone-tab-btn ${currentVariant === 'web' ? 'is-active' : ''}`}
          >
            Web Platform
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentVariant === 'cloud'}
            onClick={() => setActiveTab('cloud')}
            className={`phone-tab-btn ${currentVariant === 'cloud' ? 'is-active' : ''}`}
          >
            Cloud &amp; API
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentVariant === 'security'}
            onClick={() => setActiveTab('security')}
            className={`phone-tab-btn ${currentVariant === 'security' ? 'is-active' : ''}`}
          >
            Security Audit
          </button>
        </div>
      )}

      {/* Realistic Titanium Smartphone Chassis (iPhone 16 Pro Style) */}
      <div className="phone-device-frame">
        {/* Hardware side buttons */}
        <span className="phone-button phone-button--action" aria-hidden="true" />
        <span className="phone-button phone-button--vol-up" aria-hidden="true" />
        <span className="phone-button phone-button--vol-down" aria-hidden="true" />
        <span className="phone-button phone-button--power" aria-hidden="true" />

        {/* Display Screen */}
        <div className="phone-screen-display">
          {/* Glass glare gradient overlay */}
          <div className="phone-screen-glare" aria-hidden="true" />

          {/* Dynamic Island Pill with Camera & Sensor */}
          <div className="phone-dynamic-island" aria-label="Dynamic Island">
            <span className="phone-camera-lens" />
            <span className="phone-camera-sensor" />
          </div>

          {/* Top Status Bar: Clock + Signal + Wifi + Battery */}
          <div className="phone-status-bar" aria-hidden="true">
            <span className="phone-status-time">9:41</span>
            <div className="phone-status-icons">
              {/* Signal Bars */}
              <svg className="phone-status-svg" width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                <rect x="0" y="7" width="2" height="3" rx="0.5" />
                <rect x="4" y="5" width="2" height="5" rx="0.5" />
                <rect x="8" y="2.5" width="2" height="7.5" rx="0.5" />
                <rect x="12" y="0" width="2" height="10" rx="0.5" />
              </svg>
              {/* 5G / Wifi */}
              <Wifi size={12} strokeWidth={2.5} />
              {/* Battery Capsule */}
              <div className="phone-battery-capsule">
                <div className="phone-battery-fill" />
                <span className="phone-battery-nub" />
              </div>
            </div>
          </div>

          {/* Screen Content: Live Service Application */}
          <div className="phone-screen-scrollable">
            {currentVariant === 'web' && <WebPlatformScreen />}
            {currentVariant === 'cloud' && <CloudMeshScreen />}
            {currentVariant === 'security' && <SecurityAuditScreen />}
            {currentVariant === 'tools' && <InternalToolsScreen />}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="phone-home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SERVICE SCREEN 1: Web Platforms & SaaS Application (Nexus Cloud)
   ========================================================================== */
function WebPlatformScreen() {
  return (
    <div className="phone-service-page phone-service-page--web">
      {/* App Header */}
      <header className="psp-header">
        <div className="psp-brand">
          <div className="psp-logo-mark">
            <Zap size={13} strokeWidth={2.5} />
          </div>
          <div>
            <div className="psp-brand-title">Nexus SaaS</div>
            <div className="psp-brand-sub">Production · v2.4.0</div>
          </div>
        </div>
        <span className="psp-status-badge psp-status-badge--success">
          <span className="psp-status-dot" />
          99.99%
        </span>
      </header>

      {/* Hero Metric KPI Card with Sparkline */}
      <section className="psp-hero-metric">
        <div className="psp-metric-top">
          <span className="psp-metric-label">Monthly Gross Volume</span>
          <span className="psp-metric-pill">
            <ArrowUpRight size={11} /> +24.8%
          </span>
        </div>
        <div className="psp-metric-val">$148,290<span className="psp-metric-val-cents">.00</span></div>
        <div className="psp-metric-caption">Real-time edge transactions</div>

        {/* Crisp Vector SVG Sparkline */}
        <div className="psp-sparkline-wrap" aria-hidden="true">
          <svg viewBox="0 0 240 55" className="psp-sparkline-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pspSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0,45 Q35,42 60,34 T120,38 T165,18 T210,12 L240,4 L240,55 L0,55 Z"
              fill="url(#pspSparkGrad)"
            />
            <path
              d="M0,45 Q35,42 60,34 T120,38 T165,18 T210,12 L240,4"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Live pulsing coordinate dot */}
            <circle cx="240" cy="4" r="3.5" fill="#38bdf8" />
          </svg>
        </div>
      </section>

      {/* Mini Grid Stats */}
      <div className="psp-stats-row">
        <div className="psp-stat-card">
          <span className="psp-stat-label">Edge Latency</span>
          <span className="psp-stat-num">12<span className="psp-stat-unit">ms</span></span>
          <span className="psp-stat-sub">Frankfurt · fra-1</span>
        </div>
        <div className="psp-stat-card">
          <span className="psp-stat-label">Lighthouse</span>
          <span className="psp-stat-num">100<span className="psp-stat-unit">/100</span></span>
          <span className="psp-stat-sub">Zero Layout Shift</span>
        </div>
      </div>

      {/* Live Services Section */}
      <div className="psp-section-block">
        <div className="psp-section-title">Operational Pipelines</div>
        <div className="psp-pipeline-list">
          <div className="psp-pipeline-item">
            <div className="psp-pipe-icon psp-pipe-icon--azure">
              <Server size={12} />
            </div>
            <div className="psp-pipe-info">
              <div className="psp-pipe-name">Edge SSR Router</div>
              <div className="psp-pipe-desc">Sub-second warm cache</div>
            </div>
            <span className="psp-pipe-status">Active</span>
          </div>

          <div className="psp-pipeline-item">
            <div className="psp-pipe-icon psp-pipe-icon--coral">
              <Database size={12} />
            </div>
            <div className="psp-pipe-info">
              <div className="psp-pipe-name">Postgres Pool</div>
              <div className="psp-pipe-desc">Replication sync &lt; 2ms</div>
            </div>
            <span className="psp-pipe-status">Healthy</span>
          </div>
        </div>
      </div>

      {/* Bottom App Bar */}
      <div className="psp-bottom-nav">
        <div className="psp-nav-item is-active"><Zap size={14} /><span>Live</span></div>
        <div className="psp-nav-item"><BarChart3 size={14} /><span>Metrics</span></div>
        <div className="psp-nav-item"><Layers size={14} /><span>Deploy</span></div>
        <div className="psp-nav-item"><Sliders size={14} /><span>Config</span></div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SERVICE SCREEN 2: API & Cloud Architecture (Global Mesh)
   ========================================================================== */
function CloudMeshScreen() {
  return (
    <div className="phone-service-page phone-service-page--cloud">
      {/* App Header */}
      <header className="psp-header">
        <div className="psp-brand">
          <div className="psp-logo-mark psp-logo-mark--cloud">
            <Globe size={13} strokeWidth={2.5} />
          </div>
          <div>
            <div className="psp-brand-title">Global Mesh</div>
            <div className="psp-brand-sub">Multi-Region VPC</div>
          </div>
        </div>
        <span className="psp-status-badge psp-status-badge--cloud">
          <span className="psp-status-dot psp-status-dot--cloud" />
          Synchronized
        </span>
      </header>

      {/* Hero Throughput Counter */}
      <section className="psp-hero-metric psp-hero-metric--cloud">
        <div className="psp-metric-top">
          <span className="psp-metric-label">Global Traffic Throughput</span>
          <span className="psp-metric-pill psp-metric-pill--cloud">
            <Activity size={10} /> Live
          </span>
        </div>
        <div className="psp-metric-val">1.42<span className="psp-metric-val-cents">M req/m</span></div>
        <div className="psp-metric-caption">99.999% Service Level Agreement</div>

        {/* Traffic Load Distribution Histogram */}
        <div className="psp-histogram-wrap" aria-hidden="true">
          <div className="psp-hist-bar" style={{ height: '45%' }} />
          <div className="psp-hist-bar" style={{ height: '65%' }} />
          <div className="psp-hist-bar" style={{ height: '80%' }} />
          <div className="psp-hist-bar" style={{ height: '55%' }} />
          <div className="psp-hist-bar" style={{ height: '95%' }} />
          <div className="psp-hist-bar" style={{ height: '70%' }} />
          <div className="psp-hist-bar" style={{ height: '85%' }} />
          <div className="psp-hist-bar" style={{ height: '100%' }} />
          <div className="psp-hist-bar" style={{ height: '90%' }} />
          <div className="psp-hist-bar" style={{ height: '75%' }} />
          <div className="psp-hist-bar" style={{ height: '60%' }} />
          <div className="psp-hist-bar" style={{ height: '88%' }} />
        </div>
      </section>

      {/* Regional Nodes Status */}
      <div className="psp-section-block">
        <div className="psp-section-title">Regional Edge Clusters</div>
        <div className="psp-region-list">
          <div className="psp-region-item">
            <span className="psp-region-flag">🇩🇪</span>
            <div className="psp-region-meta">
              <span className="psp-region-name">Frankfurt (fra-1)</span>
              <span className="psp-region-specs">32 Nodes · 11ms latency</span>
            </div>
            <span className="psp-badge-tag">99.99%</span>
          </div>

          <div className="psp-region-item">
            <span className="psp-region-flag">🇺🇸</span>
            <div className="psp-region-meta">
              <span className="psp-region-name">N. Virginia (iad-1)</span>
              <span className="psp-region-specs">48 Nodes · 16ms latency</span>
            </div>
            <span className="psp-badge-tag">100.0%</span>
          </div>

          <div className="psp-region-item">
            <span className="psp-region-flag">🇸🇬</span>
            <div className="psp-region-meta">
              <span className="psp-region-name">Singapore (sin-1)</span>
              <span className="psp-region-specs">24 Nodes · 24ms latency</span>
            </div>
            <span className="psp-badge-tag">99.95%</span>
          </div>
        </div>
      </div>

      {/* Client Ownership Callout */}
      <div className="psp-ownership-callout">
        <Lock size={12} />
        <span>100% Client-Owned AWS &amp; GCP IAM Credentials</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   SERVICE SCREEN 3: Security Testing & Audits (Sentinel Suite)
   ========================================================================== */
function SecurityAuditScreen() {
  return (
    <div className="phone-service-page phone-service-page--security">
      {/* App Header */}
      <header className="psp-header">
        <div className="psp-brand">
          <div className="psp-logo-mark psp-logo-mark--security">
            <Shield size={13} strokeWidth={2.5} />
          </div>
          <div>
            <div className="psp-brand-title">Sentinel Audit</div>
            <div className="psp-brand-sub">Penetration Test Sign-Off</div>
          </div>
        </div>
        <span className="psp-status-badge psp-status-badge--security">
          Verified
        </span>
      </header>

      {/* Circular Radial Score Badge */}
      <section className="psp-hero-metric psp-hero-metric--security">
        <div className="psp-security-gauge">
          <div className="psp-gauge-circle">
            <span className="psp-gauge-num">100</span>
            <span className="psp-gauge-denom">/100</span>
          </div>
          <div className="psp-gauge-info">
            <div className="psp-gauge-status">Fully Hardened</div>
            <div className="psp-gauge-desc">0 Critical · 0 High · 0 Medium</div>
          </div>
        </div>
      </section>

      {/* Verification Matrix */}
      <div className="psp-section-block">
        <div className="psp-section-title">Tested Attack Surfaces</div>
        <div className="psp-audit-checklist">
          <div className="psp-audit-item">
            <CheckCircle2 size={13} className="psp-check-icon" />
            <span className="psp-audit-name">OWASP Top 10 Suite</span>
            <span className="psp-audit-status">Passed (10/10)</span>
          </div>

          <div className="psp-audit-item">
            <CheckCircle2 size={13} className="psp-check-icon" />
            <span className="psp-audit-name">Auth &amp; Session Boundaries</span>
            <span className="psp-audit-status">Hardened</span>
          </div>

          <div className="psp-audit-item">
            <CheckCircle2 size={13} className="psp-check-icon" />
            <span className="psp-audit-name">SQLi &amp; Command Injection</span>
            <span className="psp-audit-status">Immune</span>
          </div>

          <div className="psp-audit-item">
            <CheckCircle2 size={13} className="psp-check-icon" />
            <span className="psp-audit-name">TLS 1.3 &amp; HSTS Preload</span>
            <span className="psp-audit-status">Enforced</span>
          </div>
        </div>
      </div>

      {/* Signed Certificate Box */}
      <div className="psp-cert-seal">
        <div className="psp-cert-title">Hash Decode Security Sign-Off</div>
        <div className="psp-cert-id">SHA-256: 7f8a...c92b · Authorised Audit</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SERVICE SCREEN 4: Internal Tools & Consoles
   ========================================================================== */
function InternalToolsScreen() {
  return (
    <div className="phone-service-page phone-service-page--tools">
      <header className="psp-header">
        <div className="psp-brand">
          <div className="psp-logo-mark psp-logo-mark--tools">
            <Terminal size={13} strokeWidth={2.5} />
          </div>
          <div>
            <div className="psp-brand-title">OpsEngine Console</div>
            <div className="psp-brand-sub">Internal Tooling &amp; ERP</div>
          </div>
        </div>
        <span className="psp-status-badge psp-status-badge--tools">Synced</span>
      </header>

      <section className="psp-hero-metric psp-hero-metric--tools">
        <div className="psp-metric-top">
          <span className="psp-metric-label">Automated Workflows</span>
          <span className="psp-metric-pill psp-metric-pill--tools">100% Reliable</span>
        </div>
        <div className="psp-metric-val">8,420<span className="psp-metric-val-cents"> tasks</span></div>
        <div className="psp-metric-caption">Zero manual human bottlenecks</div>
      </section>

      <div className="psp-section-block">
        <div className="psp-section-title">Recent Automated Actions</div>
        <div className="psp-pipeline-list">
          <div className="psp-pipeline-item">
            <div className="psp-pipe-icon psp-pipe-icon--tools">
              <CheckCircle2 size={12} />
            </div>
            <div className="psp-pipe-info">
              <div className="psp-pipe-name">Invoice Settlement #8920</div>
              <div className="psp-pipe-desc">Synced with Stripe &amp; Ledger</div>
            </div>
            <span className="psp-pipe-status">Done</span>
          </div>

          <div className="psp-pipeline-item">
            <div className="psp-pipe-icon psp-pipe-icon--tools">
              <CheckCircle2 size={12} />
            </div>
            <div className="psp-pipe-info">
              <div className="psp-pipe-name">RBAC Permission Audit</div>
              <div className="psp-pipe-desc">14 admin roles reconciled</div>
            </div>
            <span className="psp-pipe-status">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
