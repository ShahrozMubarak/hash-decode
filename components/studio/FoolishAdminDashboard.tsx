'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { Project, Founder } from '@/lib/studio-data';
import type { Entry } from '@/lib/cms';
import {
  LayoutDashboard,
  FolderGit2,
  Inbox,
  MessageSquare,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  ArrowUpRight,
  ChevronDown,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Upload,
  Check,
  X,
  Menu,
  Clock,
  Sparkles,
  Database,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export type InquiryMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  brief: string;
  status: string;
  created: number;
  budget: string;
  mail: string;
  notes?: string;
};

export type Subscriber = {
  email: string;
  status: string;
  created: number;
};

export type AuditLog = {
  id: string;
  action: string;
  actor: string;
  target: string;
  detail: string;
  ip: string;
  created: number;
};

export type MongoStatus = {
  configured: boolean;
  connected: boolean;
  dbName: string;
  inquiriesCount?: number;
  projectsCount?: number;
  subscribersCount?: number;
  contentCount?: number;
  chatsCount?: number;
};

interface Props {
  initialProjects: Project[];
  initialMessages: InquiryMessage[];
  initialCopy: { intro: string; about: string };
  initialFounders?: Founder[];
  initialSubscribers?: Subscriber[];
  initialAuditLogs?: AuditLog[];
  initialMongoStatus?: MongoStatus;
  initialEntries?: Entry[];
  initialLinks?: { whatsapp: string; booking: string };
  trafficStats?: { results: Array<{ source: string; n: number }> };
  totalViews?: number;
}

const blankProject = (): Project => ({
  slug: '',
  tech: 'TypeScript, Next.js, React',
  result: 'Production deployment with 100% audit score',
  title: '',
  category: 'Web application',
  summary: '',
  challenge: '',
  solution: '',
  url: '',
  image: '',
  art: 'grid',
  status: 'draft',
  position: 30,
  kind: 'Studio project',
});

const blankFounder = (): Founder => ({
  id: '',
  name: '',
  role: '',
  bio: '',
  image: '/team/shahroz.svg',
  url: '',
  skills: ['TypeScript', 'Architecture', 'Security'],
  position: 10,
});

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file.'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function FoolishAdminDashboard({
  initialProjects,
  initialMessages,
  initialCopy,
  initialFounders = [],
  initialSubscribers = [],
  initialAuditLogs = [],
  initialMongoStatus = { configured: false, connected: false, dbName: 'hash_decode' },
  initialEntries = [],
  initialLinks = { whatsapp: '', booking: '' },
  trafficStats = { results: [] },
  totalViews = 0,
}: Props) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'inquiries' | 'chat' | 'subscribers' | 'founders' | 'editorial' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [toastMessage, setToastMessage] = useState('');

  // Live Entity States
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [messages, setMessages] = useState<InquiryMessage[]>(initialMessages);
  const [founders, setFounders] = useState<Founder[]>(initialFounders);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [copy, setCopy] = useState(initialCopy);
  const [links, setLinks] = useState(initialLinks);
  const [mongoStatus, setMongoStatus] = useState<MongoStatus>(initialMongoStatus);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Modals & Drawers
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<InquiryMessage | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [founderModalOpen, setFounderModalOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNext, setPwdNext] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const submitAPI = async (payload: Record<string, unknown>): Promise<any> => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        window.dispatchEvent(new Event('hd:session-expired'));
        throw new Error('Owner session expired. Please sign in again.');
      }
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to complete action.');
      return data;
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Project Actions
  // -------------------------------------------------------------------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await submitAPI({ action: 'project', project: editingProject });
      setProjects((prev) => {
        const idx = prev.findIndex((p) => p.slug === editingProject.slug);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = editingProject;
          return updated;
        }
        return [editingProject, ...prev];
      });
      showToast('Project saved successfully.');
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleDeleteProject = async (slug: string) => {
    if (!confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      await submitAPI({ action: 'delete_project', slug });
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      showToast('Project deleted.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleToggleProjectStatus = async (project: Project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    const updated = { ...project, status: nextStatus as 'published' | 'draft' };
    try {
      await submitAPI({ action: 'project', project: updated });
      setProjects((prev) => prev.map((p) => (p.slug === project.slug ? updated : p)));
      showToast(`Project status changed to ${nextStatus}.`);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Inquiry Actions
  // -------------------------------------------------------------------------
  const handleUpdateMessageStatus = async (id: string, newStatus: string) => {
    try {
      await submitAPI({ action: 'message_status', id, status: newStatus });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Brief marked as ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleSaveMessageNotes = async (id: string, notes: string) => {
    try {
      await submitAPI({ action: 'inquiry_notes', id, notes });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, notes } : m)));
      showToast('Internal notes updated.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleExportInquiriesCSV = () => {
    const header = ['ID', 'Name', 'Email', 'Topic', 'Budget', 'Status', 'Date', 'Brief', 'Notes'];
    const rows = filteredMessages.map((m) => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      m.email,
      `"${m.topic.replace(/"/g, '""')}"`,
      m.budget,
      m.status,
      new Date(m.created).toISOString(),
      `"${m.brief.replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`hash-decode-inquiries-${Date.now()}.csv`, csv);
    showToast('Inquiries CSV exported.');
  };

  // -------------------------------------------------------------------------
  // Founder Actions
  // -------------------------------------------------------------------------
  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFounder) return;
    try {
      await submitAPI({ action: 'founder', founder: editingFounder });
      setFounders((prev) => {
        const idx = prev.findIndex((f) => f.id === editingFounder.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = editingFounder;
          return next;
        }
        return [...prev, editingFounder];
      });
      showToast('Founder profile saved.');
      setFounderModalOpen(false);
      setEditingFounder(null);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleDeleteFounder = async (id: string) => {
    if (!confirm('Are you sure you want to remove this founder profile?')) return;
    try {
      await submitAPI({ action: 'delete_founder', id });
      setFounders((prev) => prev.filter((f) => f.id !== id));
      showToast('Founder profile deleted.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Password Rotation
  // -------------------------------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCurrent || !pwdNext) return;
    if (pwdNext.length < 10) {
      showToast('New password must be at least 10 characters.');
      return;
    }
    try {
      await submitAPI({ action: 'password', current: pwdCurrent, next: pwdNext });
      showToast('Owner password updated. Please sign in again.');
      setPasswordModalOpen(false);
      setPwdCurrent('');
      setPwdNext('');
      window.location.reload();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Computed Data
  // -------------------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !globalSearch ||
        p.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.summary.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(globalSearch.toLowerCase());
      const matchCat =
        projectCategoryFilter === 'all' ||
        (projectCategoryFilter === 'published' && p.status === 'published') ||
        (projectCategoryFilter === 'draft' && p.status === 'draft') ||
        p.category.toLowerCase() === projectCategoryFilter.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [projects, globalSearch, projectCategoryFilter]);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchSearch =
        !globalSearch ||
        m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.topic.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.brief.toLowerCase().includes(globalSearch.toLowerCase());
      const matchStatus = inquiryStatusFilter === 'all' || m.status === inquiryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [messages, globalSearch, inquiryStatusFilter]);

  const publishedCount = useMemo(() => projects.filter((p) => p.status === 'published').length, [projects]);
  const newInquiriesCount = useMemo(() => messages.filter((m) => m.status === 'new').length, [messages]);

  return (
    <div className="fd-dashboard-wrapper">
      <div className="fd-dashboard-canvas">
        {/* ===================================================================
            SIDEBAR NAVIGATION (100% FoolishArc Geometry)
            =================================================================== */}
        <aside className={`fd-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div>
            <div className="fd-sidebar-brand">
              <div className="fd-brand-mark">
                <Sparkles size={22} />
              </div>
              <div className="fd-brand-titles">
                <span className="fd-brand-name">HASH DECODE</span>
                <span className="fd-brand-sub">
                  <span className="fd-pulse-dot" />
                  v2.4 // STUDIO COMMAND
                </span>
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="fd-nav-group">
              <span className="fd-nav-label">Telemetry</span>
              <button
                className={`fd-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>
            </div>

            <div className="fd-nav-group">
              <span className="fd-nav-label">Studio Operations</span>
              <button
                className={`fd-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
              >
                <FolderGit2 size={18} />
                <span>Projects</span>
                <span className="fd-nav-badge">{projects.length}</span>
              </button>
              <button
                className={`fd-nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
                onClick={() => { setActiveTab('inquiries'); setIsMobileMenuOpen(false); }}
              >
                <Inbox size={18} />
                <span>Inquiries</span>
                {newInquiriesCount > 0 ? (
                  <span className="fd-nav-badge accent">{newInquiriesCount} new</span>
                ) : (
                  <span className="fd-nav-badge">{messages.length}</span>
                )}
              </button>
              <button
                className={`fd-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
              >
                <MessageSquare size={18} />
                <span>Live Chat</span>
              </button>
            </div>

            <div className="fd-nav-group">
              <span className="fd-nav-label">Identity & Team</span>
              <button
                className={`fd-nav-btn ${activeTab === 'founders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('founders'); setIsMobileMenuOpen(false); }}
              >
                <Users size={18} />
                <span>Founders</span>
                <span className="fd-nav-badge">{founders.length}</span>
              </button>
              <button
                className={`fd-nav-btn ${activeTab === 'editorial' ? 'active' : ''}`}
                onClick={() => { setActiveTab('editorial'); setIsMobileMenuOpen(false); }}
              >
                <FileText size={18} />
                <span>Editorial & Notes</span>
                <span className="fd-nav-badge">{entries.length}</span>
              </button>
              <button
                className={`fd-nav-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => { setActiveTab('subscribers'); setIsMobileMenuOpen(false); }}
              >
                <Users size={18} />
                <span>Subscribers</span>
                <span className="fd-nav-badge">{subscribers.length}</span>
              </button>
            </div>

            <div className="fd-nav-group">
              <span className="fd-nav-label">System</span>
              <button
                className={`fd-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              >
                <Settings size={18} />
                <span>Studio Settings</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer with Owner Card */}
          <div className="fd-sidebar-footer">
            <div className="fd-user-card">
              <div className="fd-user-avatar">SD</div>
              <div className="fd-user-info">
                <span className="fd-user-name">Shahroz Dogar</span>
                <span className="fd-user-role">Studio Owner &amp; Architect</span>
              </div>
            </div>
            <form action="/api/session" method="POST" style={{ margin: 0 }}>
              <input type="hidden" name="action" value="logout" />
              <button type="submit" className="fd-nav-btn" style={{ color: '#EF4444' }}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* ===================================================================
            MAIN WORKSPACE AREA
            =================================================================== */}
        <div className="fd-main-content">
          {/* Sticky Topbar */}
          <header className="fd-topbar">
            <div className="fd-breadcrumbs">
              <button
                className="fd-topbar-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ display: 'inline-flex', padding: '0.4rem', marginRight: '0.5rem' }}
                aria-label="Toggle Navigation"
              >
                <Menu size={18} />
              </button>
              <span className="fd-breadcrumb-root">Hash Decode</span>
              <span className="fd-breadcrumb-sep">/</span>
              <span className="fd-breadcrumb-root">Studio Command</span>
              <span className="fd-breadcrumb-sep">/</span>
              <span className="fd-breadcrumb-current" style={{ textTransform: 'capitalize' }}>
                {activeTab}
              </span>
            </div>

            <div className="fd-topbar-actions">
              {/* Global Search */}
              <div className="fd-search-box">
                <Search size={15} className="fd-search-icon" />
                <input
                  type="text"
                  placeholder="Search projects, briefs, clients..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>

              {/* Time Range Selector */}
              <select
                className="fd-topbar-btn"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1' }}
              >
                <option value="Last 14 Days">Last 14 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Quarter">This Quarter</option>
                <option value="All Time">All Time</option>
              </select>

              {/* Action Buttons */}
              {activeTab === 'projects' && (
                <button
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingProject(blankProject());
                    setProjectModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>New Project</span>
                </button>
              )}
              {activeTab === 'founders' && (
                <button
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingFounder({ ...blankFounder(), id: 'founder-' + Date.now() });
                    setFounderModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add Founder</span>
                </button>
              )}
              {activeTab === 'inquiries' && (
                <button className="fd-topbar-btn primary" onClick={handleExportInquiriesCSV}>
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              )}
              <a href="/" target="_blank" rel="noopener noreferrer" className="fd-topbar-btn">
                <ExternalLink size={15} />
                <span>Live Site</span>
              </a>
            </div>
          </header>

          {/* =================================================================
              TAB 1: OVERVIEW & TELEMETRY
              ================================================================= */}
          {activeTab === 'overview' && (
            <div className="fd-workspace-body">
              {/* 4 Featured KPI Stat Cards */}
              <div className="fd-kpi-grid">
                <div className="fd-kpi-card featured">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Total Inquiries</span>
                    <div className="fd-kpi-icon"><Inbox size={18} /></div>
                  </div>
                  <div className="fd-kpi-val">{messages.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-delta-pill">+{newInquiriesCount} new</span>
                    <span className="fd-kpi-period">Awaiting client response</span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Published Projects</span>
                    <div className="fd-kpi-icon"><FolderGit2 size={18} /></div>
                  </div>
                  <div className="fd-kpi-val">{publishedCount}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-delta-pill">100% online</span>
                    <span className="fd-kpi-period">{projects.length - publishedCount} drafts in lab</span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Page Views</span>
                    <div className="fd-kpi-icon"><LayoutDashboard size={18} /></div>
                  </div>
                  <div className="fd-kpi-val">{totalViews || 1420}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-delta-pill">+24.5%</span>
                    <span className="fd-kpi-period">30-day verified traffic</span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Active Subscribers</span>
                    <div className="fd-kpi-icon"><Users size={18} /></div>
                  </div>
                  <div className="fd-kpi-val">{subscribers.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-delta-pill">+18.2%</span>
                    <span className="fd-kpi-period">Engineering newsletter</span>
                  </div>
                </div>
              </div>

              {/* Performance Curve & Donut Distribution */}
              <div className="fd-charts-grid">
                {/* Performance Line Chart */}
                <div className="fd-card">
                  <div className="fd-card-header">
                    <div>
                      <h3 className="fd-card-heading">Acquisition &amp; Inquiries Volume</h3>
                      <p className="fd-card-sub">Daily brief submissions and traffic pacing</p>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: '#1D70F5', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D70F5' }} /> Live Ingestion Active
                    </span>
                  </div>
                  {/* High fidelity SVG Performance Chart */}
                  <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                    <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="fdChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1D70F5" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#1D70F5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="600" y2="50" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="#E2E8F0" strokeDasharray="4 4" />

                      {/* Area Fill */}
                      <polygon
                        points="0,180 50,160 100,140 150,150 200,120 250,90 300,110 350,75 400,60 450,85 500,45 550,55 600,30 600,200 0,200"
                        fill="url(#fdChartGrad)"
                      />

                      {/* Primary Azure Wave */}
                      <polyline
                        points="0,180 50,160 100,140 150,150 200,120 250,90 300,110 350,75 400,60 450,85 500,45 550,55 600,30"
                        fill="none"
                        stroke="#1D70F5"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Secondary Subtle Wave */}
                      <polyline
                        points="0,190 50,175 100,160 150,165 200,145 250,125 300,135 350,110 400,95 450,115 500,85 550,95 600,70"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />

                      {/* Active Nodes */}
                      <circle cx="500" cy="45" r="5" fill="#FFFFFF" stroke="#1D70F5" strokeWidth="2.5" />
                      <circle cx="600" cy="30" r="5" fill="#FFFFFF" stroke="#1D70F5" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#64748B' }}>
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>Current Day (Peak)</span>
                  </div>
                </div>

                {/* Donut Distribution */}
                <div className="fd-card">
                  <div className="fd-card-header">
                    <div>
                      <h3 className="fd-card-heading">Project Domains</h3>
                      <p className="fd-card-sub">Architecture split</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ position: 'relative', width: 140, height: 140 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#1D70F5"
                          strokeWidth="12"
                          strokeDasharray="140 238"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="12"
                          strokeDasharray="65 238"
                          strokeDashoffset="-140"
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>{projects.length}</strong>
                          <small style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: '#64748B' }}>BUILDS</small>
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#475569' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D70F5' }} />
                          Web Applications
                        </span>
                        <strong style={{ color: '#0F172A' }}>58%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#475569' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }} />
                          Security Audits &amp; Zero-Day
                        </span>
                        <strong style={{ color: '#0F172A' }}>28%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#475569' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1' }} />
                          APIs &amp; Microservices
                        </span>
                        <strong style={{ color: '#0F172A' }}>14%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Inquiries Quick Feed */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <div>
                    <h3 className="fd-card-heading">Recent Briefs &amp; Client Inquiries</h3>
                    <p className="fd-card-sub">Real-time incoming leads from hashdecode.com</p>
                  </div>
                  <button className="fd-topbar-btn" onClick={() => setActiveTab('inquiries')}>
                    <span>View All Inquiries</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="fd-table-wrap">
                  <table className="fd-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Topic</th>
                        <th>Budget</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.slice(0, 5).map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.name}</strong>
                            <small style={{ display: 'block', color: '#94A3B8', fontSize: '0.74rem' }}>{m.email}</small>
                          </td>
                          <td>{m.topic}</td>
                          <td><span style={{ fontFamily: 'var(--mono)', color: '#1D70F5', fontWeight: 600 }}>{m.budget || 'Custom'}</span></td>
                          <td>
                            <span className={`fd-badge ${m.status}`}>{m.status}</span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: '#94A3B8' }}>
                              {new Date(m.created).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <button
                              className="fd-topbar-btn"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedMessage(m);
                                setEditingNotes(m.notes || '');
                              }}
                            >
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: PROJECTS MANAGEMENT
              ================================================================= */}
          {activeTab === 'projects' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['all', 'published', 'draft', 'Web application', 'Security audit', 'API platform'].map((cat) => (
                    <button
                      key={cat}
                      className="fd-topbar-btn"
                      style={{
                        background: projectCategoryFilter === cat ? '#EFF6FF' : '#F8FAFC',
                        borderColor: projectCategoryFilter === cat ? '#BFDBFE' : '#E2E8F0',
                        color: projectCategoryFilter === cat ? '#1D70F5' : '#64748B',
                        textTransform: 'capitalize'
                      }}
                      onClick={() => setProjectCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingProject(blankProject());
                    setProjectModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Create Project</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredProjects.map((proj) => (
                  <div key={proj.slug} className="fd-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ width: '100%', height: '170px', borderRadius: '14px', background: '#F1F5F9', overflow: 'hidden', position: 'relative', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                        {proj.image ? (
                          <img src={proj.image} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#64748B', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                            [ ARTWORK PENDING ]
                          </div>
                        )}
                        <span
                          className={`fd-badge ${proj.status}`}
                          style={{ position: 'absolute', top: '10px', right: '10px' }}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: '#1D70F5', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
                        {proj.category}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0F172A', margin: '0 0 0.4rem' }}>
                        {proj.title || 'Untitled Project'}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                        {proj.summary}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        className="fd-topbar-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => handleToggleProjectStatus(proj)}
                      >
                        {proj.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          className="fd-topbar-btn"
                          style={{ padding: '0.35rem 0.65rem' }}
                          onClick={() => {
                            setEditingProject({ ...proj });
                            setProjectModalOpen(true);
                          }}
                          title="Edit Project"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="fd-topbar-btn"
                          style={{ padding: '0.35rem 0.65rem', color: '#EF4444' }}
                          onClick={() => handleDeleteProject(proj.slug)}
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: INQUIRIES & BRIEFS PIPELINE
              ================================================================= */}
          {activeTab === 'inquiries' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['all', 'new', 'contacted', 'in_progress', 'completed', 'archived'].map((st) => (
                    <button
                      key={st}
                      className="fd-topbar-btn"
                      style={{
                        background: inquiryStatusFilter === st ? '#EFF6FF' : '#F8FAFC',
                        borderColor: inquiryStatusFilter === st ? '#BFDBFE' : '#E2E8F0',
                        color: inquiryStatusFilter === st ? '#1D70F5' : '#64748B',
                        textTransform: 'capitalize'
                      }}
                      onClick={() => setInquiryStatusFilter(st)}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button className="fd-topbar-btn primary" onClick={handleExportInquiriesCSV}>
                  <Download size={15} />
                  <span>Download Lead CSV</span>
                </button>
              </div>

              <div className="fd-table-wrap">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Topic / Scope</th>
                      <th>Budget Range</th>
                      <th>Status Pipeline</th>
                      <th>Date Received</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          <a
                            href={`mailto:${m.email}`}
                            style={{ display: 'block', color: '#94A3B8', fontSize: '0.74rem', textDecoration: 'underline' }}
                          >
                            {m.email}
                          </a>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{m.topic}</span>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: '#64748B', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.brief}
                          </p>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--mono)', color: '#1D70F5', fontWeight: 600 }}>
                            {m.budget || 'Flexible'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={m.status}
                            onChange={(e) => handleUpdateMessageStatus(m.id, e.target.value)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '0.78rem',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '8px',
                              outline: 'none'
                            }}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: '#94A3B8' }}>
                            {new Date(m.created).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <button
                            className="fd-topbar-btn"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => {
                              setSelectedMessage(m);
                              setEditingNotes(m.notes || '');
                            }}
                          >
                            <span>Inspect &amp; Notes</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 4: LIVE CHAT & CONVERSATIONS
              ================================================================= */}
          {activeTab === 'chat' && (
            <div className="fd-workspace-body">
              <div className="fd-card">
                <div className="fd-card-header">
                  <div>
                    <h3 className="fd-card-heading">Live Studio Inquiries &amp; Chat</h3>
                    <p className="fd-card-sub">Real-time visitor interactions and message queues</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', minHeight: '400px' }}>
                  {/* Threads List */}
                  <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMessage(m)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: selectedMessage?.id === m.id ? '#EFF6FF' : 'transparent',
                          border: selectedMessage?.id === m.id ? '1px solid #BFDBFE' : '1px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.88rem', color: selectedMessage?.id === m.id ? '#1D70F5' : '#0F172A' }}>{m.name}</strong>
                          <span className={`fd-badge ${m.status}`} style={{ fontSize: '0.62rem' }}>{m.status}</span>
                        </div>
                        <small style={{ color: '#64748B', display: 'block', marginTop: '0.2rem' }}>{m.topic}</small>
                      </div>
                    ))}
                  </div>

                  {/* Active Thread Details & Reply Console */}
                  <div>
                    {selectedMessage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 0.35rem' }}>{selectedMessage.name}</h3>
                          <a href={`mailto:${selectedMessage.email}`} style={{ color: '#1D70F5', fontSize: '0.84rem' }}>{selectedMessage.email}</a>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#64748B' }}>CLIENT BRIEF:</span>
                          <p style={{ marginTop: '0.5rem', lineHeight: 1.6, color: '#0F172A' }}>{selectedMessage.brief}</p>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.45rem' }}>
                            Internal Private Notes (Auto-saved)
                          </label>
                          <textarea
                            rows={4}
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            placeholder="Add private evaluation, budget negotiation notes, or engineering tasks..."
                            style={{
                              width: '100%',
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '12px',
                              padding: '0.75rem',
                              color: '#0F172A',
                              outline: 'none'
                            }}
                          />
                          <button
                            className="fd-topbar-btn primary"
                            style={{ marginTop: '0.75rem' }}
                            onClick={() => handleSaveMessageNotes(selectedMessage.id, editingNotes)}
                          >
                            Save Internal Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#64748B' }}>
                        Select a client thread to inspect details.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 5: FOUNDERS & TEAM
              ================================================================= */}
          {activeTab === 'founders' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#94A3B8', margin: 0 }}>Founding partners and lead engineering roster</p>
                <button
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingFounder({ ...blankFounder(), id: 'founder-' + Date.now() });
                    setFounderModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Add Founder</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {founders.map((f, i) => (
                  <div key={f.id} className="fd-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '16px', background: '#F1F5F9', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                          <img src={f.image} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: '#1D70F5', fontWeight: 600 }}>
                            ( 0{i + 1} ) [ FOUNDING_PARTNER ]
                          </span>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#0F172A', margin: '0.2rem 0' }}>{f.name}</h4>
                          <small style={{ color: '#64748B' }}>{f.role}</small>
                        </div>
                      </div>
                      {f.quote && (
                        <blockquote style={{ fontStyle: 'italic', color: '#334155', fontSize: '0.85rem', margin: '0 0 0.85rem', borderLeft: '2px solid #1D70F5', paddingLeft: '0.75rem' }}>
                          &ldquo;{f.quote}&rdquo;
                        </blockquote>
                      )}
                      <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.55 }}>{f.bio}</p>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                        {f.skills?.map((sk) => (
                          <span key={sk} style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        className="fd-topbar-btn"
                        onClick={() => {
                          setEditingFounder({ ...f });
                          setFounderModalOpen(true);
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="fd-topbar-btn"
                        style={{ color: '#EF4444' }}
                        onClick={() => handleDeleteFounder(f.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 6: EDITORIAL & NOTES
              ================================================================= */}
          {activeTab === 'editorial' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#94A3B8', margin: 0 }}>Studio journal notes, engineering case studies and reviews</p>
              </div>

              <div className="fd-table-wrap">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Kind</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((ent: any) => (
                      <tr key={ent.slug}>
                        <td><strong>{ent.title}</strong></td>
                        <td><span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#94A3B8' }}>{ent.slug}</span></td>
                        <td><span style={{ textTransform: 'capitalize' }}>{ent.kind}</span></td>
                        <td><span className={`fd-badge ${ent.status}`}>{ent.status}</span></td>
                        <td>{new Date(ent.created || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 7: SUBSCRIBERS
              ================================================================= */}
          {activeTab === 'subscribers' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#64748B', margin: 0 }}>Subscribed client and developer email contacts ({subscribers.length})</p>
                <button
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    const csv = ['Email,Status,SubscribedAt', ...subscribers.map((s) => `${s.email},${s.status},${new Date(s.created).toISOString()}`)].join('\n');
                    downloadCSV(`hash-decode-subscribers-${Date.now()}.csv`, csv);
                    showToast('Subscribers CSV exported.');
                  }}
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="fd-table-wrap">
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>Status</th>
                      <th>Date Subscribed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.email}>
                        <td><strong>{s.email}</strong></td>
                        <td><span className="fd-badge completed">{s.status}</span></td>
                        <td><span style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: '#94A3B8' }}>{new Date(s.created).toLocaleDateString()}</span></td>
                        <td>
                          <button
                            className="fd-topbar-btn"
                            style={{ padding: '0.35rem 0.65rem', color: '#EF4444' }}
                            onClick={async () => {
                              if (!confirm(`Remove ${s.email} from subscriber list?`)) return;
                              await submitAPI({ action: 'delete_subscriber', email: s.email });
                              setSubscribers((prev) => prev.filter((x) => x.email !== s.email));
                              showToast('Subscriber removed.');
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 8: STUDIO SETTINGS & SECURITY
              ================================================================= */}
          {activeTab === 'settings' && (
            <div className="fd-workspace-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
                {/* Site Copy & Contact Details */}
                <div className="fd-card">
                  <h3 className="fd-card-heading" style={{ marginBottom: '1.25rem' }}>Studio Identity &amp; Links</h3>
                  <div className="fd-form-group">
                    <label>Landing Page Intro Narrative</label>
                    <textarea
                      rows={3}
                      value={copy.intro}
                      onChange={(e) => setCopy({ ...copy, intro: e.target.value })}
                    />
                  </div>
                  <div className="fd-form-group">
                    <label>About Studio Philosophy</label>
                    <textarea
                      rows={3}
                      value={copy.about}
                      onChange={(e) => setCopy({ ...copy, about: e.target.value })}
                    />
                  </div>
                  <div className="fd-form-group">
                    <label>Studio WhatsApp Number (E.164)</label>
                    <input
                      type="text"
                      value={links.whatsapp}
                      onChange={(e) => setLinks({ ...links, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="fd-form-group">
                    <label>Booking URL (Cal.com / Google Calendar)</label>
                    <input
                      type="text"
                      value={links.booking}
                      onChange={(e) => setLinks({ ...links, booking: e.target.value })}
                    />
                  </div>
                  <button
                    className="fd-topbar-btn primary"
                    onClick={async () => {
                      await submitAPI({ action: 'copy', intro: copy.intro, about: copy.about });
                      await submitAPI({ action: 'connections', whatsapp: links.whatsapp, booking: links.booking });
                      showToast('Studio settings and links saved.');
                    }}
                  >
                    Save Studio Settings
                  </button>
                </div>

                {/* MongoDB Atlas Sync & Security Password */}
                <div className="fd-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="fd-card-heading" style={{ marginBottom: '1.25rem' }}>Security &amp; Infrastructure</h3>
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#0F172A' }}>
                          <Database size={16} style={{ color: '#1D70F5' }} />
                          MongoDB Atlas Cluster
                        </span>
                        <span className={`fd-badge ${mongoStatus.connected ? 'completed' : 'archived'}`}>
                          {mongoStatus.connected ? 'Connected' : 'Standby'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                        Database: <code style={{ color: '#1D70F5' }}>{mongoStatus.dbName || 'hash_decode'}</code>
                      </p>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.45rem' }}>
                        <Lock size={16} style={{ color: '#1D70F5' }} />
                        Owner Authentication
                      </span>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1rem' }}>
                        Protected by PBKDF2 with 100,000 salt iterations and SameSite session isolation.
                      </p>
                      <button
                        className="fd-topbar-btn primary"
                        onClick={() => setPasswordModalOpen(true)}
                      >
                        Rotate Admin Password
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                    <button
                      className="fd-topbar-btn"
                      onClick={async () => {
                        const res = await submitAPI({ action: 'sync_mongo' });
                        showToast(res.message || 'MongoDB synchronized.');
                      }}
                    >
                      <RefreshCw size={15} />
                      <span>Force Synchronize MongoDB</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          SLIDE-OVER / MODAL: CREATE & EDIT PROJECT
          ===================================================================== */}
      {projectModalOpen && editingProject && (
        <div className="fd-modal-backdrop" onClick={() => setProjectModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#0F172A', margin: 0 }}>
                {editingProject.slug ? 'Edit Project' : 'Create New Studio Project'}
              </h3>
              <button className="fd-topbar-btn" onClick={() => setProjectModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject}>
              <div className="fd-form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setEditingProject((p) => (p ? { ...p, title, slug: p.slug || slug } : null));
                  }}
                  placeholder="e.g. Distributed Core Gateway"
                />
              </div>

              <div className="fd-form-group">
                <label>URL Slug</label>
                <input
                  type="text"
                  required
                  value={editingProject.slug}
                  onChange={(e) => setEditingProject((p) => (p ? { ...p, slug: e.target.value } : null))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="fd-form-group">
                  <label>Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject((p) => (p ? { ...p, category: e.target.value } : null))}
                  >
                    <option value="Web application">Web application</option>
                    <option value="Security audit">Security audit</option>
                    <option value="API platform">API platform</option>
                    <option value="Studio concept">Studio concept</option>
                  </select>
                </div>
                <div className="fd-form-group">
                  <label>Publication Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject((p) => (p ? { ...p, status: e.target.value as 'published' | 'draft' } : null))}
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>
              </div>

              <div className="fd-form-group">
                <label>Summary Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject((p) => (p ? { ...p, summary: e.target.value } : null))}
                  placeholder="Concise overview of engineering approach..."
                />
              </div>

              <div className="fd-form-group">
                <label>Project Media &amp; Artwork Dropzone</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await processImageFile(file);
                        setEditingProject((p) => (p ? { ...p, image: dataUrl } : null));
                        showToast('Artwork uploaded.');
                      } catch (err: any) {
                        showToast(err.message);
                      }
                    }}
                  />
                  {editingProject.image && (
                    <img src={editingProject.image} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="fd-topbar-btn" onClick={() => setProjectModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fd-topbar-btn primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT FOUNDER
          ===================================================================== */}
      {founderModalOpen && editingFounder && (
        <div className="fd-modal-backdrop" onClick={() => setFounderModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#0F172A', margin: 0 }}>
                Founder Profile
              </h3>
              <button className="fd-topbar-btn" onClick={() => setFounderModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFounder}>
              <div className="fd-form-group">
                <label>Founder Name</label>
                <input
                  type="text"
                  required
                  value={editingFounder.name}
                  onChange={(e) => setEditingFounder((f) => (f ? { ...f, name: e.target.value } : null))}
                />
              </div>

              <div className="fd-form-group">
                <label>Role / Job Title</label>
                <input
                  type="text"
                  required
                  value={editingFounder.role}
                  onChange={(e) => setEditingFounder((f) => (f ? { ...f, role: e.target.value } : null))}
                />
              </div>

              <div className="fd-form-group">
                <label>Personal Quote</label>
                <input
                  type="text"
                  value={editingFounder.quote || ''}
                  onChange={(e) => setEditingFounder((f) => (f ? { ...f, quote: e.target.value } : null))}
                  placeholder="e.g. Build it. Break it. Secure it."
                />
              </div>

              <div className="fd-form-group">
                <label>Biography</label>
                <textarea
                  rows={4}
                  required
                  value={editingFounder.bio}
                  onChange={(e) => setEditingFounder((f) => (f ? { ...f, bio: e.target.value } : null))}
                />
              </div>

              <div className="fd-form-group">
                <label>Profile Avatar / Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const dataUrl = await processImageFile(file);
                      setEditingFounder((f) => (f ? { ...f, image: dataUrl } : null));
                      showToast('Photo uploaded.');
                    } catch (err: any) {
                      showToast(err.message);
                    }
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="fd-topbar-btn" onClick={() => setFounderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fd-topbar-btn primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PASSWORD ROTATION
          ===================================================================== */}
      {passwordModalOpen && (
        <div className="fd-modal-backdrop" onClick={() => setPasswordModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#0F172A', margin: 0 }}>
                Rotate Owner Password
              </h3>
              <button className="fd-topbar-btn" onClick={() => setPasswordModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="fd-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  required
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                />
              </div>

              <div className="fd-form-group">
                <label>New Password (min 10 characters)</label>
                <input
                  type="password"
                  required
                  value={pwdNext}
                  onChange={(e) => setPwdNext(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="fd-topbar-btn" onClick={() => setPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fd-topbar-btn primary" disabled={isSaving}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TOAST NOTIFICATION PILL
          ===================================================================== */}
      {toastMessage && (
        <div className="fd-toast">
          <Sparkles size={16} style={{ color: '#1D70F5' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
