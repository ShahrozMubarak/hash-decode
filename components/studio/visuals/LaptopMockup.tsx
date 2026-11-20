'use client';

import type { HTMLAttributes } from 'react';
import {
  Server,
  Globe,
  Database,
  ShieldCheck,
  Activity,
  Lock,
  Terminal,
  RefreshCw,
} from 'lucide-react';

export interface LaptopMockupProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'cloud' | 'web' | 'security';
  className?: string;
}

export default function LaptopMockup({
  variant = 'cloud',
  className = '',
  ...props
}: LaptopMockupProps) {
  return (
    <div className={`laptop-device-wrapper ${className}`.trim()} {...props}>
      {/* MacBook Pro Display Lid */}
      <div className="laptop-lid">
        {/* Subtle camera notch at top */}
        <div className="laptop-notch" aria-hidden="true">
          <span className="laptop-camera-eye" />
        </div>

        {/* macOS Browser Window Frame */}
        <div className="laptop-screen">
          {/* macOS Title Bar */}
          <div className="laptop-titlebar" aria-hidden="true">
            <div className="laptop-traffic-lights">
              <span className="laptop-light laptop-light--red" />
              <span className="laptop-light laptop-light--yellow" />
              <span className="laptop-light laptop-light--green" />
            </div>

            {/* Address Pill */}
            <div className="laptop-address-pill">
              <Lock size={10} className="laptop-ssl-icon" />
              <span>app.hashdecode.com/console</span>
              <RefreshCw size={10} className="laptop-reload-icon" />
            </div>

            <div className="laptop-window-actions">
              <span className="laptop-badge-live">● Prod Active</span>
            </div>
          </div>

          {/* Browser Content Area: Cloud Architecture Console */}
          <div className="laptop-content-grid">
            {/* Sidebar */}
            <div className="laptop-sidebar">
              <div className="laptop-sb-brand">
                <div className="laptop-sb-logo">HD</div>
                <span className="laptop-sb-name">CloudOS</span>
              </div>
              <div className="laptop-sb-nav">
                <div className="laptop-sb-item is-active">
                  <Activity size={12} />
                  <span>Overview</span>
                </div>
                <div className="laptop-sb-item">
                  <Server size={12} />
                  <span>Clusters</span>
                </div>
                <div className="laptop-sb-item">
                  <Globe size={12} />
                  <span>Edge DNS</span>
                </div>
                <div className="laptop-sb-item">
                  <Database size={12} />
                  <span>Storage</span>
                </div>
                <div className="laptop-sb-item">
                  <ShieldCheck size={12} />
                  <span>Zero-Trust</span>
                </div>
              </div>
            </div>

            {/* Main Dashboard Canvas */}
            <div className="laptop-main-panel">
              {/* Header metrics bar */}
              <div className="laptop-kpi-row">
                <div className="laptop-kpi-card">
                  <div className="laptop-kpi-label">Edge Ingress</div>
                  <div className="laptop-kpi-val">1.42M <span className="laptop-kpi-unit">req/m</span></div>
                  <div className="laptop-kpi-sub">99.999% SLA</div>
                </div>
                <div className="laptop-kpi-card">
                  <div className="laptop-kpi-label">Global P95</div>
                  <div className="laptop-kpi-val">11 <span className="laptop-kpi-unit">ms</span></div>
                  <div className="laptop-kpi-sub">Sub-second routing</div>
                </div>
                <div className="laptop-kpi-card">
                  <div className="laptop-kpi-label">Threats Blocked</div>
                  <div className="laptop-kpi-val">100%</div>
                  <div className="laptop-kpi-sub">WAF + DDoS Hardened</div>
                </div>
              </div>

              {/* Topology Grid with Live Nodes */}
              <div className="laptop-topology-box">
                <div className="laptop-box-head">
                  <span className="laptop-box-title">Active Edge Node Fleet</span>
                  <span className="laptop-box-badge">All 3 Regions Healthy</span>
                </div>
                <div className="laptop-nodes-grid">
                  <div className="laptop-node-item">
                    <span className="laptop-node-dot" />
                    <div>
                      <div className="laptop-node-name">fra-1 (Frankfurt)</div>
                      <div className="laptop-node-meta">32 vCPUs · 12ms</div>
                    </div>
                  </div>
                  <div className="laptop-node-item">
                    <span className="laptop-node-dot" />
                    <div>
                      <div className="laptop-node-name">iad-1 (Virginia)</div>
                      <div className="laptop-node-meta">48 vCPUs · 16ms</div>
                    </div>
                  </div>
                  <div className="laptop-node-item">
                    <span className="laptop-node-dot" />
                    <div>
                      <div className="laptop-node-name">sin-1 (Singapore)</div>
                      <div className="laptop-node-meta">24 vCPUs · 24ms</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console log footer */}
              <div className="laptop-log-strip">
                <Terminal size={11} className="laptop-log-icon" />
                <span className="laptop-log-code">2026-11-21 03:28:10 UTC [ingress] verified mutual TLS on all boundaries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MacBook Bottom Base & Notch */}
      <div className="laptop-base" aria-hidden="true">
        <div className="laptop-base-notch" />
      </div>
    </div>
  );
}
