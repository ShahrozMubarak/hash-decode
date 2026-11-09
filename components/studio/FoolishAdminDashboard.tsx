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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Table as TableIcon,
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
};

export type ChatThread = {
  id: string;
  name: string;
  email: string;
  updated: number;
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
  initialChatThreads?: ChatThread[];
  trafficStats?: { results: Array<{ source: string; n: number }> };
  totalViews?: number;
}

const blankProject = (): Project => ({
  slug: '',
  tech: 'TypeScript, Next.js, React',
  result: 'Production release delivered on schedule',
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
  image: '/team/shahroz.jpg',
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
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Image must be under 2MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
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
  initialMongoStatus = { configured: false, connected: false, dbName: '' },
  initialEntries = [],
  initialLinks = { whatsapp: '', booking: '' },
  initialChatThreads = [],
  totalViews = 0,
}: Props) {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'inquiries' | 'chat' | 'founders' | 'editorial' | 'subscribers' | 'settings'
  >('overview');

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState<boolean>(false);
  const [cmdQuery, setCmdQuery] = useState<string>('');

  // Persist sidebar collapsed preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hd-admin-sidebar');
      if (saved === 'collapsed') setSidebarCollapsed(true);
    } catch {}
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try {
      localStorage.setItem('hd-admin-sidebar', next ? 'collapsed' : 'expanded');
    } catch {}
  };

  // Global Keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCmdPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Data Collections
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [messages, setMessages] = useState<InquiryMessage[]>(initialMessages);
  const [founders, setFounders] = useState<Founder[]>(initialFounders);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [copy, setCopy] = useState(initialCopy);
  const [links, setLinks] = useState(initialLinks);
  const [chatThreads] = useState<ChatThread[]>(initialChatThreads);
  const [mongoStatus, setMongoStatus] = useState<MongoStatus>(initialMongoStatus);

  // Global Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [timeRange, setTimeRange] = useState('All Time');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');

  // Bulk Selection
  const [selectedInquiries, setSelectedInquiries] = useState<Set<string>>(new Set());
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  // Pagination states
  const [inquiryPage, setInquiryPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Drawers
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<InquiryMessage | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [founderModalOpen, setFounderModalOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNext, setPwdNext] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTableAlt, setShowTableAlt] = useState(false);

  // Unsaved changes detection for settings
  const hasUnsavedSettings = useMemo(() => {
    return (
      copy.intro !== initialCopy.intro ||
      copy.about !== initialCopy.about ||
      links.whatsapp !== initialLinks.whatsapp ||
      links.booking !== initialLinks.booking
    );
  }, [copy, links, initialCopy, initialLinks]);

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
  // Filtering & Pagination Calculations
  // -------------------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (projectCategoryFilter !== 'all') {
      if (projectCategoryFilter === 'published' || projectCategoryFilter === 'draft') {
        list = list.filter((p) => p.status === projectCategoryFilter);
      } else {
        list = list.filter((p) => p.category === projectCategoryFilter);
      }
    }
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, projectCategoryFilter, globalSearch]);

  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, projectPage]);

  const filteredMessages = useMemo(() => {
    let list = messages;
    if (inquiryStatusFilter !== 'all') {
      list = list.filter((m) => m.status === inquiryStatusFilter);
    }
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.topic.toLowerCase().includes(q) ||
          m.brief.toLowerCase().includes(q)
      );
    }
    return list;
  }, [messages, inquiryStatusFilter, globalSearch]);

  const paginatedMessages = useMemo(() => {
    const start = (inquiryPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, inquiryPage]);

  // Real KPI Counts (No fake numbers, no fake deltas)
  const newInquiriesCount = useMemo(() => messages.filter((m) => m.status === 'new').length, [messages]);
  const publishedCount = useMemo(() => projects.filter((p) => p.status === 'published').length, [projects]);

  // Real Inquiries Volume Trend (Computed from real messages)
  const inquiryTrendData = useMemo(() => {
    if (messages.length < 2) return [];
    const countsByDate = new Map<string, number>();
    const sorted = [...messages].sort((a, b) => a.created - b.created);

    for (const m of sorted) {
      const dateKey = new Date(m.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
    }

    return Array.from(countsByDate.entries()).map(([date, count]) => ({ date, count }));
  }, [messages]);

  // Real Project Category Breakdown
  const realCategoryBreakdown = useMemo(() => {
    if (projects.length === 0) return [];
    const counts = new Map<string, number>();
    for (const p of projects) {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / projects.length) * 100),
    }));
  }, [projects]);

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
      setSelectedProjects((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
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
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`hash-decode-inquiries-${Date.now()}.csv`, csv);
    showToast('Inquiries CSV exported.');
  };

  // Bulk Inquiries Actions
  const toggleSelectInquiry = (id: string) => {
    setSelectedInquiries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInquiries = () => {
    if (selectedInquiries.size === paginatedMessages.length) {
      setSelectedInquiries(new Set());
    } else {
      setSelectedInquiries(new Set(paginatedMessages.map((m) => m.id)));
    }
  };

  const handleBulkInquiryStatus = async (status: string) => {
    for (const id of Array.from(selectedInquiries)) {
      await submitAPI({ action: 'message_status', id, status }).catch(() => {});
    }
    setMessages((prev) =>
      prev.map((m) => (selectedInquiries.has(m.id) ? { ...m, status } : m))
    );
    setSelectedInquiries(new Set());
    showToast(`Updated ${selectedInquiries.size} inquiries to ${status}.`);
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
      showToast('Founder profile removed.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Password Rotation
  // -------------------------------------------------------------------------
  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCurrent || !pwdNext) return;
    try {
      const res = await submitAPI({
        action: 'rotate_password',
        currentPassword: pwdCurrent,
        nextPassword: pwdNext,
      });
      showToast(res.message || 'Owner password rotated successfully.');
      setPasswordModalOpen(false);
      setPwdCurrent('');
      setPwdNext('');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Command Palette Items
  const cmdPaletteItems = useMemo(() => {
    const list: Array<{ label: string; group: string; action: () => void }> = [
      { label: 'Overview', group: 'Navigation', action: () => setActiveTab('overview') },
      { label: 'Projects', group: 'Navigation', action: () => setActiveTab('projects') },
      { label: 'Inquiries', group: 'Navigation', action: () => setActiveTab('inquiries') },
      { label: 'Chat Conversations', group: 'Navigation', action: () => setActiveTab('chat') },
      { label: 'Founding Team', group: 'Navigation', action: () => setActiveTab('founders') },
      { label: 'Editorial & Notes', group: 'Navigation', action: () => setActiveTab('editorial') },
      { label: 'Subscribers', group: 'Navigation', action: () => setActiveTab('subscribers') },
      { label: 'Studio Settings', group: 'Navigation', action: () => setActiveTab('settings') },
      {
        label: 'Create New Project',
        group: 'Actions',
        action: () => {
          setActiveTab('projects');
          setEditingProject(blankProject());
          setProjectModalOpen(true);
        },
      },
      {
        label: 'Add Founder Member',
        group: 'Actions',
        action: () => {
          setActiveTab('founders');
          setEditingFounder({ ...blankFounder(), id: 'founder-' + Date.now() });
          setFounderModalOpen(true);
        },
      },
      { label: 'Export Inquiries CSV', group: 'Actions', action: handleExportInquiriesCSV },
    ];

    // Add projects
    for (const p of projects) {
      list.push({
        label: `Project: ${p.title}`,
        group: 'Projects',
        action: () => {
          setActiveTab('projects');
          setEditingProject({ ...p });
          setProjectModalOpen(true);
        },
      });
    }

    if (!cmdQuery) return list;
    const q = cmdQuery.toLowerCase();
    return list.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q));
  }, [projects, cmdQuery]);

  return (
    <div className="fd-dashboard-wrapper">
      <div className="fd-dashboard-canvas">
        {/* Mobile Drawer Overlay Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fd-sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ------------------------------------------------------------------
            SIDEBAR (256px, collapsible to 72px icon rail)
            ------------------------------------------------------------------ */}
        <aside
          className={`fd-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${
            isMobileMenuOpen ? 'is-drawer-open' : ''
          }`}
          aria-label="Studio admin navigation"
        >
          {/* Brand & Collapse Header */}
          <div className="fd-sidebar-brand">
            <div className="fd-brand-mark" aria-hidden="true">
              <span>HD</span>
            </div>
            <div className="fd-brand-titles">
              <span className="fd-brand-name">Hash Decode</span>
              <span className="fd-brand-sub">Studio Command</span>
            </div>
            <button
              type="button"
              className="fd-sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="fd-nav-sections">
            <div className="fd-nav-group">
              <span className="fd-nav-label">Workspace</span>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                title="Overview"
              >
                <LayoutDashboard size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Overview</span>
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('projects');
                  setIsMobileMenuOpen(false);
                }}
                title="Projects"
              >
                <FolderGit2 size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Projects</span>
                <span className="fd-nav-badge">{projects.length}</span>
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('inquiries');
                  setIsMobileMenuOpen(false);
                }}
                title="Inquiries"
              >
                <Inbox size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Inquiries</span>
                {newInquiriesCount > 0 && <span className="fd-nav-badge">{newInquiriesCount}</span>}
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('chat');
                  setIsMobileMenuOpen(false);
                }}
                title="Chat"
              >
                <MessageSquare size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Chat</span>
                {chatThreads.length > 0 && (
                  <span className="fd-nav-badge">{chatThreads.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'founders' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('founders');
                  setIsMobileMenuOpen(false);
                }}
                title="Team"
              >
                <Users size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Team</span>
                <span className="fd-nav-badge">{founders.length}</span>
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'editorial' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('editorial');
                  setIsMobileMenuOpen(false);
                }}
                title="Posts"
              >
                <FileText size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Posts</span>
                <span className="fd-nav-badge">{entries.length}</span>
              </button>

              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('subscribers');
                  setIsMobileMenuOpen(false);
                }}
                title="Subscribers"
              >
                <Mail size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Subscribers</span>
                <span className="fd-nav-badge">{subscribers.length}</span>
              </button>
            </div>

            <div className="fd-nav-group">
              <span className="fd-nav-label">System</span>
              <button
                type="button"
                className={`fd-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('settings');
                  setIsMobileMenuOpen(false);
                }}
                title="Settings"
              >
                <Settings size={18} className="fd-nav-icon" />
                <span className="fd-nav-text">Settings</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer with Owner Card & Visible Sign Out */}
          <div className="fd-sidebar-footer">
            <div className="fd-user-card">
              <div className="fd-user-avatar" aria-hidden="true">
                <span>SD</span>
              </div>
              <div className="fd-user-info">
                <span className="fd-user-name">Shahroz Dogar</span>
                <span className="fd-user-role">Studio Owner</span>
              </div>
            </div>

            <form action="/api/session" method="POST" style={{ margin: 0 }}>
              <input type="hidden" name="action" value="logout" />
              <button type="submit" className="fd-signout-btn" title="Sign out of owner session">
                <LogOut size={16} />
                <span className="fd-signout-text">Sign out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* ------------------------------------------------------------------
            MAIN WORKSPACE AREA
            ------------------------------------------------------------------ */}
        <div className="fd-main-content">
          {/* Sticky Topbar */}
          <header className="fd-topbar">
            <div className="fd-breadcrumbs">
              <button
                type="button"
                className="fd-topbar-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ display: 'inline-flex', padding: '0.4rem', marginRight: '0.25rem' }}
                aria-label="Toggle Navigation"
              >
                <Menu size={18} />
              </button>
              <span className="fd-breadcrumb-root">Hash Decode</span>
              <span className="fd-breadcrumb-sep">/</span>
              <span className="fd-breadcrumb-root">Admin</span>
              <span className="fd-breadcrumb-sep">/</span>
              <span className="fd-breadcrumb-current" style={{ textTransform: 'capitalize' }}>
                {activeTab}
              </span>
            </div>

            <div className="fd-topbar-actions">
              {/* Global Search with Full Placeholder */}
              <div className="fd-search-box">
                <Search size={15} className="fd-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search projects, inquiries, posts"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onClick={() => setCmdPaletteOpen(true)}
                  className="fd-search-input"
                />
                <kbd className="fd-search-kbd">⌘K</kbd>
              </div>

              {/* Time Range Selector */}
              <select
                className="fd-topbar-btn"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="All Time">All Time</option>
                <option value="This Quarter">This Quarter</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 14 Days">Last 14 Days</option>
              </select>

              {/* Primary action shortcut */}
              {activeTab === 'projects' && (
                <button
                  type="button"
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingProject(blankProject());
                    setProjectModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>New project</span>
                </button>
              )}

              {/* View site as normal text button */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="fd-topbar-btn"
                title="Open live public studio"
              >
                <span>View site</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </header>

          {/* ----------------------------------------------------------------
              TAB 1: OVERVIEW & REAL ANALYTICS
              ---------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="fd-workspace-body">
              {/* 4 Real KPI Stat Cards (Numbers count up once, no loops, no fake deltas) */}
              <div className="fd-kpi-grid">
                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Inquiries</span>
                    <div className="fd-kpi-icon-wrap" aria-hidden="true">
                      <Inbox size={18} />
                    </div>
                  </div>
                  <div className="fd-kpi-val">{messages.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-kpi-subtext">
                      {newInquiriesCount > 0
                        ? `${newInquiriesCount} awaiting review`
                        : 'All briefs reviewed'}
                    </span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Projects</span>
                    <div className="fd-kpi-icon-wrap" aria-hidden="true">
                      <FolderGit2 size={18} />
                    </div>
                  </div>
                  <div className="fd-kpi-val">{projects.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-kpi-subtext">
                      {publishedCount} published · {projects.length - publishedCount} drafts
                    </span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Chat conversations</span>
                    <div className="fd-kpi-icon-wrap" aria-hidden="true">
                      <MessageSquare size={18} />
                    </div>
                  </div>
                  <div className="fd-kpi-val">{chatThreads.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-kpi-subtext">
                      {chatThreads.length > 0
                        ? `${chatThreads.length} visitor threads`
                        : 'No active chat threads'}
                    </span>
                  </div>
                </div>

                <div className="fd-kpi-card">
                  <div className="fd-kpi-top">
                    <span className="fd-kpi-title">Subscribers</span>
                    <div className="fd-kpi-icon-wrap" aria-hidden="true">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="fd-kpi-val">{subscribers.length}</div>
                  <div className="fd-kpi-bottom">
                    <span className="fd-kpi-subtext">
                      {subscribers.length} newsletter contacts
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Page Views from real platformDb traffic_totals */}
              {totalViews > 0 && (
                <div
                  className="fd-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <span className="fd-kpi-title">Total page views</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
                      {totalViews.toLocaleString()} views
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#5b6b7f' }}>
                    Sourced from verified internal traffic counters
                  </span>
                </div>
              )}

              {/* Charts Section: Inquiries Activity & Real Domain Architecture */}
              <div className="fd-charts-grid">
                {/* Real Data Trend Line or Clean Empty State */}
                <div className="fd-card">
                  <div className="fd-card-header">
                    <div>
                      <h3 className="fd-card-heading">Inquiries activity</h3>
                      <p className="fd-card-sub">
                        Submissions over time ({messages.length} total)
                      </p>
                    </div>
                    {inquiryTrendData.length >= 2 && (
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        style={{ height: '32px', fontSize: '0.78rem' }}
                        onClick={() => setShowTableAlt(!showTableAlt)}
                      >
                        <TableIcon size={14} />
                        <span>{showTableAlt ? 'Show chart' : 'Show table view'}</span>
                      </button>
                    )}
                  </div>

                  {inquiryTrendData.length >= 2 ? (
                    showTableAlt ? (
                      /* Accessible Table Alternative */
                      <div className="fd-table-wrap">
                        <table className="fd-table" aria-label="Inquiry volume over time">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Inquiry count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiryTrendData.map((d) => (
                              <tr key={d.date}>
                                <td>{d.date}</td>
                                <td>{d.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Real SVG Blue Line Chart (draws in over 800ms) */
                      <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                        <svg
                          viewBox="0 0 500 160"
                          style={{ width: '100%', height: '100%', overflow: 'visible' }}
                        >
                          {/* Grid lines */}
                          <line
                            x1="0"
                            y1="40"
                            x2="500"
                            y2="40"
                            stroke="rgba(11, 31, 58, 0.08)"
                            strokeDasharray="4 4"
                          />
                          <line
                            x1="0"
                            y1="80"
                            x2="500"
                            y2="80"
                            stroke="rgba(11, 31, 58, 0.08)"
                            strokeDasharray="4 4"
                          />
                          <line
                            x1="0"
                            y1="120"
                            x2="500"
                            y2="120"
                            stroke="rgba(11, 31, 58, 0.08)"
                            strokeDasharray="4 4"
                          />

                          {/* Calculated Points */}
                          {(() => {
                            const maxVal = Math.max(...inquiryTrendData.map((d) => d.count), 1);
                            const stepX = 500 / Math.max(inquiryTrendData.length - 1, 1);
                            const points = inquiryTrendData
                              .map((d, i) => {
                                const x = i * stepX;
                                const y = 140 - (d.count / maxVal) * 110;
                                return `${x},${y}`;
                              })
                              .join(' ');

                            return (
                              <>
                                <polyline
                                  points={points}
                                  fill="none"
                                  stroke="#1E40AF"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="chart-draw-line"
                                />
                                {inquiryTrendData.map((d, i) => {
                                  const cx = i * stepX;
                                  const cy = 140 - (d.count / maxVal) * 110;
                                  return (
                                    <g key={d.date}>
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r="4"
                                        fill="#ffffff"
                                        stroke="#1E40AF"
                                        strokeWidth="2"
                                      />
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.75rem',
                            fontSize: '0.75rem',
                            color: '#5b6b7f',
                          }}
                        >
                          <span>{inquiryTrendData[0]?.date}</span>
                          <span>{inquiryTrendData[inquiryTrendData.length - 1]?.date}</span>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Honest Empty State */
                    <div className="fd-empty-state">
                      <div className="fd-empty-icon" aria-hidden="true">
                        <Inbox size={22} />
                      </div>
                      <h4 className="fd-empty-title">No inquiries yet</h4>
                      <p className="fd-empty-desc">
                        When clients submit project briefs through your contact form, volume metrics
                        will appear here.
                      </p>
                      <a
                        href="/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fd-topbar-btn"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <span>View contact form</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Real Category Distribution */}
                <div className="fd-card">
                  <div className="fd-card-header">
                    <div>
                      <h3 className="fd-card-heading">Project domains</h3>
                      <p className="fd-card-sub">Architecture distribution</p>
                    </div>
                  </div>

                  {realCategoryBreakdown.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {realCategoryBreakdown.map((item) => (
                        <div key={item.category}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.88rem',
                              marginBottom: '0.35rem',
                            }}
                          >
                            <span style={{ fontWeight: 500, color: '#0B1F3A' }}>
                              {item.category}
                            </span>
                            <span style={{ color: '#5b6b7f' }}>
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div
                            style={{
                              height: '6px',
                              borderRadius: '999px',
                              background: 'rgba(11, 31, 58, 0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${item.percentage}%`,
                                height: '100%',
                                background: '#1E40AF',
                                borderRadius: '999px',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="fd-empty-state">
                      <div className="fd-empty-icon" aria-hidden="true">
                        <FolderGit2 size={22} />
                      </div>
                      <h4 className="fd-empty-title">No projects recorded yet</h4>
                      <p className="fd-empty-desc">
                        Create projects in the Projects tab to display domain distribution.
                      </p>
                      <button
                        type="button"
                        className="fd-topbar-btn primary"
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => {
                          setActiveTab('projects');
                          setEditingProject(blankProject());
                          setProjectModalOpen(true);
                        }}
                      >
                        <Plus size={14} />
                        <span>Create project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Inquiries Quick Feed */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <div>
                    <h3 className="fd-card-heading">Recent client inquiries</h3>
                    <p className="fd-card-sub">Latest incoming project briefs</p>
                  </div>
                  <button
                    type="button"
                    className="fd-topbar-btn"
                    onClick={() => setActiveTab('inquiries')}
                  >
                    <span>View all inquiries</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className="fd-table-wrap">
                  <table className="fd-table" aria-label="Recent inquiries table">
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
                            <small
                              style={{ display: 'block', color: '#5b6b7f', fontSize: '0.78rem' }}
                            >
                              {m.email}
                            </small>
                          </td>
                          <td>{m.topic}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1E40AF' }}>
                              {m.budget || 'Custom'}
                            </span>
                          </td>
                          <td>
                            <span className={`fd-status-badge ${m.status}`}>{m.status}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#5b6b7f' }}>
                              {new Date(m.created).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fd-topbar-btn"
                              style={{ height: '32px', fontSize: '0.78rem' }}
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
                      {messages.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                            No client inquiries submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 2: PROJECTS MANAGEMENT
              ---------------------------------------------------------------- */}
          {activeTab === 'projects' && (
            <div className="fd-workspace-body">
              {/* Filter Pills & Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {['all', 'published', 'draft', 'Web application', 'Security audit', 'API platform'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="fd-topbar-btn"
                        style={{
                          background: projectCategoryFilter === cat ? '#eff6ff' : '#ffffff',
                          borderColor: projectCategoryFilter === cat ? '#1E40AF' : 'rgba(11,31,58,0.12)',
                          color: projectCategoryFilter === cat ? '#1E40AF' : '#1d3350',
                          fontWeight: projectCategoryFilter === cat ? 600 : 500,
                          textTransform: 'capitalize',
                        }}
                        onClick={() => {
                          setProjectCategoryFilter(cat);
                          setProjectPage(1);
                        }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingProject(blankProject());
                    setProjectModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>Create project</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {paginatedProjects.map((proj) => (
                  <div
                    key={proj.slug}
                    className="fd-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* Artwork thumbnail with clean fallback (no banned labels) */}
                      <div
                        style={{
                          width: '100%',
                          height: '170px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          overflow: 'hidden',
                          position: 'relative',
                          marginBottom: '1rem',
                          border: '1px solid rgba(11,31,58,0.08)',
                        }}
                      >
                        {proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#5b6b7f',
                            }}
                          >
                            <FolderGit2 size={32} />
                          </div>
                        )}
                        <span
                          className={`fd-status-badge ${proj.status}`}
                          style={{ position: 'absolute', top: '10px', right: '10px' }}
                        >
                          {proj.status}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: '#1E40AF',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {proj.category}
                      </span>
                      <h4
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0B1F3A',
                          margin: '0 0 0.4rem',
                        }}
                      >
                        {proj.title || 'Untitled project'}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: '#1d3350',
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {proj.summary}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(11,31,58,0.08)',
                      }}
                    >
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        style={{ height: '32px', fontSize: '0.78rem' }}
                        onClick={() => handleToggleProjectStatus(proj)}
                      >
                        {proj.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="fd-topbar-btn"
                          style={{ height: '32px', padding: '0 0.6rem' }}
                          onClick={() => {
                            setEditingProject({ ...proj });
                            setProjectModalOpen(true);
                          }}
                          title="Edit project"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className="fd-topbar-btn"
                          style={{ height: '32px', padding: '0 0.6rem', color: '#dc2626' }}
                          onClick={() => handleDeleteProject(proj.slug)}
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects Pagination */}
              {filteredProjects.length > itemsPerPage && (
                <div className="fd-pagination-bar">
                  <span>
                    Showing {(projectPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(projectPage * itemsPerPage, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
                  </span>
                  <div className="fd-pagination-controls">
                    <button
                      type="button"
                      className="fd-topbar-btn"
                      disabled={projectPage === 1}
                      onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={15} />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      className="fd-topbar-btn"
                      disabled={projectPage * itemsPerPage >= filteredProjects.length}
                      onClick={() => setProjectPage((p) => p + 1)}
                    >
                      <span>Next</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 3: INQUIRIES & BRIEFS PIPELINE
              ---------------------------------------------------------------- */}
          {activeTab === 'inquiries' && (
            <div className="fd-workspace-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {['all', 'new', 'contacted', 'in_progress', 'completed', 'archived'].map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        className="fd-topbar-btn"
                        style={{
                          background: inquiryStatusFilter === st ? '#eff6ff' : '#ffffff',
                          borderColor: inquiryStatusFilter === st ? '#1E40AF' : 'rgba(11,31,58,0.12)',
                          color: inquiryStatusFilter === st ? '#1E40AF' : '#1d3350',
                          fontWeight: inquiryStatusFilter === st ? 600 : 500,
                          textTransform: 'capitalize',
                        }}
                        onClick={() => {
                          setInquiryStatusFilter(st);
                          setInquiryPage(1);
                        }}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="fd-topbar-btn primary"
                  onClick={handleExportInquiriesCSV}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Inquiries Table */}
              <div className="fd-table-wrap">
                <table className="fd-table" aria-label="Client inquiries pipeline">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <button
                          type="button"
                          onClick={selectAllInquiries}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Select all"
                        >
                          {selectedInquiries.size === paginatedMessages.length &&
                          paginatedMessages.length > 0 ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th>Client</th>
                      <th>Topic / Scope</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMessages.map((m) => {
                      const isSelected = selectedInquiries.has(m.id);
                      return (
                        <tr key={m.id} className={isSelected ? 'is-selected' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectInquiry(m.id)}
                            />
                          </td>
                          <td>
                            <strong>{m.name}</strong>
                            <a
                              href={`mailto:${m.email}`}
                              style={{ display: 'block', color: '#5b6b7f', fontSize: '0.78rem' }}
                            >
                              {m.email}
                            </a>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{m.topic}</span>
                            <p
                              style={{
                                margin: '0.15rem 0 0',
                                fontSize: '0.8rem',
                                color: '#5b6b7f',
                                maxWidth: '320px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {m.brief}
                            </p>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1E40AF' }}>
                              {m.budget || 'Flexible'}
                            </span>
                          </td>
                          <td>
                            <select
                              value={m.status}
                              onChange={(e) => handleUpdateMessageStatus(m.id, e.target.value)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid rgba(11,31,58,0.15)',
                                color: '#0B1F3A',
                                fontSize: '0.8rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '8px',
                              }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: '#5b6b7f' }}>
                              {new Date(m.created).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fd-topbar-btn"
                              style={{ height: '32px', fontSize: '0.78rem' }}
                              onClick={() => {
                                setSelectedMessage(m);
                                setEditingNotes(m.notes || '');
                              }}
                            >
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMessages.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <p style={{ color: '#5b6b7f', margin: 0 }}>No inquiries matching this filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredMessages.length > itemsPerPage && (
                  <div className="fd-pagination-bar">
                    <span>
                      Showing {(inquiryPage - 1) * itemsPerPage + 1} -{' '}
                      {Math.min(inquiryPage * itemsPerPage, filteredMessages.length)} of{' '}
                      {filteredMessages.length} inquiries
                    </span>
                    <div className="fd-pagination-controls">
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        disabled={inquiryPage === 1}
                        onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={15} />
                        <span>Previous</span>
                      </button>
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        disabled={inquiryPage * itemsPerPage >= filteredMessages.length}
                        onClick={() => setInquiryPage((p) => p + 1)}
                      >
                        <span>Next</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Bulk Action Bar */}
              {selectedInquiries.size > 0 && (
                <div className="fd-bulk-bar">
                  <span className="fd-bulk-count">
                    {selectedInquiries.size} selected
                  </span>
                  <div className="fd-bulk-actions">
                    <button
                      type="button"
                      className="fd-bulk-btn"
                      onClick={() => handleBulkInquiryStatus('contacted')}
                    >
                      Mark contacted
                    </button>
                    <button
                      type="button"
                      className="fd-bulk-btn"
                      onClick={() => handleBulkInquiryStatus('archived')}
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      className="fd-bulk-btn"
                      onClick={() => setSelectedInquiries(new Set())}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 4: CHAT CONVERSATIONS
              ---------------------------------------------------------------- */}
          {activeTab === 'chat' && (
            <div className="fd-workspace-body">
              <div className="fd-card">
                <div className="fd-card-header">
                  <div>
                    <h3 className="fd-card-heading">Live studio conversations</h3>
                    <p className="fd-card-sub">Visitor chat threads</p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '1.5rem',
                    minHeight: '380px',
                  }}
                >
                  {/* Threads List */}
                  <div
                    style={{
                      borderRight: '1px solid rgba(11,31,58,0.08)',
                      paddingRight: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMessage(m)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: selectedMessage?.id === m.id ? '#eff6ff' : 'transparent',
                          border:
                            selectedMessage?.id === m.id
                              ? '1px solid #bfdbfe'
                              : '1px solid transparent',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <strong style={{ fontSize: '0.9rem', color: '#0B1F3A' }}>{m.name}</strong>
                          <span className={`fd-status-badge ${m.status}`}>{m.status}</span>
                        </div>
                        <small style={{ color: '#5b6b7f', display: 'block', marginTop: '0.2rem' }}>
                          {m.topic}
                        </small>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p style={{ color: '#5b6b7f', fontSize: '0.88rem' }}>No active chat threads.</p>
                    )}
                  </div>

                  {/* Active Thread Details & Notes */}
                  <div>
                    {selectedMessage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div
                          style={{
                            borderBottom: '1px solid rgba(11,31,58,0.08)',
                            paddingBottom: '0.75rem',
                          }}
                        >
                          <h3 style={{ fontSize: '1.15rem', color: '#0B1F3A', margin: 0 }}>
                            {selectedMessage.name}
                          </h3>
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            style={{ color: '#1E40AF', fontSize: '0.85rem' }}
                          >
                            {selectedMessage.email}
                          </a>
                        </div>
                        <div
                          style={{
                            background: '#f8fafc',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(11,31,58,0.08)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#5b6b7f',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Client submission
                          </span>
                          <p style={{ marginTop: '0.45rem', lineHeight: 1.6, color: '#0B1F3A' }}>
                            {selectedMessage.brief}
                          </p>
                        </div>

                        <div>
                          <label
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#0B1F3A',
                              display: 'block',
                              marginBottom: '0.45rem',
                            }}
                          >
                            Internal notes
                          </label>
                          <textarea
                            rows={4}
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            placeholder="Add evaluation, proposal status, or technical notes..."
                            style={{
                              width: '100%',
                              borderRadius: '10px',
                              border: '1px solid rgba(11,31,58,0.15)',
                              padding: '0.75rem',
                              fontFamily: 'inherit',
                              fontSize: '0.9rem',
                            }}
                          />
                          <button
                            type="button"
                            className="fd-topbar-btn primary"
                            style={{ marginTop: '0.75rem' }}
                            onClick={() =>
                              handleSaveMessageNotes(selectedMessage.id, editingNotes)
                            }
                          >
                            <span>Save notes</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#5b6b7f',
                        }}
                      >
                        Select a client thread to inspect details.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 5: TEAM & FOUNDERS
              ---------------------------------------------------------------- */}
          {activeTab === 'founders' && (
            <div className="fd-workspace-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ color: '#5b6b7f', margin: 0 }}>
                  Founding team and lead engineering roster
                </p>
                <button
                  type="button"
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    setEditingFounder({ ...blankFounder(), id: 'founder-' + Date.now() });
                    setFounderModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>Add team member</span>
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {founders.map((f) => (
                  <div
                    key={f.id}
                    className="fd-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: '#0B1F3A',
                            color: '#ffffff',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 700,
                            overflow: 'hidden',
                          }}
                        >
                          {f.image && !f.image.endsWith('.svg') ? (
                            <img
                              src={f.image}
                              alt={f.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span>{f.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.15rem' }}>
                            {f.name}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: 600 }}>
                            {f.role}
                          </span>
                        </div>
                      </div>

                      {f.quote && (
                        <blockquote
                          style={{
                            fontStyle: 'italic',
                            color: '#5b6b7f',
                            fontSize: '0.88rem',
                            margin: '0 0 0.85rem',
                            borderLeft: '2px solid #1E40AF',
                            paddingLeft: '0.75rem',
                          }}
                        >
                          &ldquo;{f.quote}&rdquo;
                        </blockquote>
                      )}

                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: '#1d3350',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {f.bio}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.35rem',
                          flexWrap: 'wrap',
                          marginTop: '0.85rem',
                        }}
                      >
                        {f.skills?.map((sk) => (
                          <span
                            key={sk}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(11,31,58,0.06)',
                              color: '#0B1F3A',
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.45rem',
                        marginTop: '1.25rem',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(11,31,58,0.08)',
                      }}
                    >
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        style={{ height: '32px', padding: '0 0.65rem' }}
                        onClick={() => {
                          setEditingFounder({ ...f });
                          setFounderModalOpen(true);
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        style={{ height: '32px', padding: '0 0.65rem', color: '#dc2626' }}
                        onClick={() => handleDeleteFounder(f.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 6: EDITORIAL & NOTES
              ---------------------------------------------------------------- */}
          {activeTab === 'editorial' && (
            <div className="fd-workspace-body">
              <div className="fd-card-header">
                <div>
                  <h3 className="fd-card-heading">Studio journal notes</h3>
                  <p className="fd-card-sub">Engineering notes and articles</p>
                </div>
              </div>

              <div className="fd-table-wrap">
                <table className="fd-table" aria-label="Editorial entries table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((ent: any) => (
                      <tr key={ent.slug || ent.id}>
                        <td>
                          <strong>{ent.title}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#5b6b7f', fontSize: '0.8rem' }}>
                            {ent.slug || ent.id}
                          </span>
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>
                            {ent.label || ent.kind || 'Note'}
                          </span>
                        </td>
                        <td>
                          <span className={`fd-status-badge ${ent.status || 'published'}`}>
                            {ent.status || 'published'}
                          </span>
                        </td>
                        <td>
                          {new Date(ent.updated || ent.created || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                          No published engineering notes yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 7: SUBSCRIBERS
              ---------------------------------------------------------------- */}
          {activeTab === 'subscribers' && (
            <div className="fd-workspace-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ color: '#5b6b7f', margin: 0 }}>
                  Confirmed newsletter contacts ({subscribers.length})
                </p>
                <button
                  type="button"
                  className="fd-topbar-btn primary"
                  onClick={() => {
                    const csv = [
                      'Email,Status,SubscribedAt',
                      ...subscribers.map(
                        (s) => `${s.email},${s.status},${new Date(s.created).toISOString()}`
                      ),
                    ].join('\n');
                    downloadCSV(`hash-decode-subscribers-${Date.now()}.csv`, csv);
                    showToast('Subscribers CSV exported.');
                  }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="fd-table-wrap">
                <table className="fd-table" aria-label="Subscribers list">
                  <thead>
                    <tr>
                      <th>Email address</th>
                      <th>Status</th>
                      <th>Subscribed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.email}>
                        <td>
                          <strong>{s.email}</strong>
                        </td>
                        <td>
                          <span className="fd-status-badge active">{s.status}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#5b6b7f' }}>
                            {new Date(s.created).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="fd-topbar-btn"
                            style={{ height: '30px', padding: '0 0.6rem', color: '#dc2626' }}
                            onClick={async () => {
                              if (!confirm(`Remove ${s.email} from subscribers?`)) return;
                              await submitAPI({ action: 'subscriberRemove', email: s.email });
                              setSubscribers((prev) => prev.filter((x) => x.email !== s.email));
                              showToast('Subscriber removed.');
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscribers.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                          No subscribers registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              TAB 8: STUDIO SETTINGS & SECURITY
              ---------------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="fd-workspace-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {/* Site Narrative & Identity */}
                <div className="fd-card">
                  <h3 className="fd-card-heading" style={{ marginBottom: '1.25rem' }}>
                    Studio narrative &amp; channels
                  </h3>

                  <div className="fd-form-group">
                    <label>Landing page intro narrative</label>
                    <textarea
                      rows={3}
                      value={copy.intro}
                      onChange={(e) => setCopy({ ...copy, intro: e.target.value })}
                    />
                  </div>

                  <div className="fd-form-group">
                    <label>About studio philosophy</label>
                    <textarea
                      rows={3}
                      value={copy.about}
                      onChange={(e) => setCopy({ ...copy, about: e.target.value })}
                    />
                  </div>

                  <div className="fd-form-group">
                    <label>Studio WhatsApp number (E.164)</label>
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
                </div>

                {/* Infrastructure & Authentication */}
                <div
                  className="fd-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 className="fd-card-heading" style={{ marginBottom: '1.25rem' }}>
                      Security &amp; infrastructure
                    </h3>

                    {/* MongoDB Status Box */}
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(11,31,58,0.08)',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontWeight: 600,
                            color: '#0B1F3A',
                          }}
                        >
                          <Database size={16} style={{ color: '#1E40AF' }} />
                          MongoDB Atlas Cluster
                        </span>
                        <span
                          className={`fd-status-badge ${
                            mongoStatus.connected ? 'active' : 'archived'
                          }`}
                        >
                          {mongoStatus.connected ? 'Connected' : 'Standby'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#5b6b7f', margin: 0 }}>
                        Database: <code>{mongoStatus.dbName || 'hash_decode'}</code>
                      </p>
                    </div>

                    {/* Owner Auth Box */}
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(11,31,58,0.08)',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontWeight: 600,
                          color: '#0B1F3A',
                          marginBottom: '0.45rem',
                        }}
                      >
                        <Lock size={16} style={{ color: '#1E40AF' }} />
                        Owner authentication
                      </span>
                      <p style={{ fontSize: '0.82rem', color: '#5b6b7f', margin: '0 0 1rem' }}>
                        Secured by PBKDF2 hash with 100,000 salt iterations and SameSite session
                        isolation.
                      </p>
                      <button
                        type="button"
                        className="fd-topbar-btn"
                        onClick={() => setPasswordModalOpen(true)}
                      >
                        <span>Change owner password</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(11,31,58,0.08)',
                    }}
                  >
                    <button
                      type="button"
                      className="fd-topbar-btn"
                      onClick={async () => {
                        const res = await submitAPI({ action: 'syncMongo' });
                        showToast(res.message || 'MongoDB synchronized.');
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Sync MongoDB</span>
                    </button>
                    <button
                      type="button"
                      className="fd-topbar-btn"
                      onClick={async () => {
                        const res = await submitAPI({ action: 'clearRateLimits' });
                        showToast(res.message || 'Rate limits cleared.');
                      }}
                    >
                      <span>Reset rate limits</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Save Bar when Settings Modified */}
              {hasUnsavedSettings && (
                <div className="fd-sticky-save-bar">
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    You have unsaved changes
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="fd-bulk-btn"
                      onClick={() => {
                        setCopy(initialCopy);
                        setLinks(initialLinks);
                      }}
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      className="fd-bulk-btn"
                      style={{ background: '#1E40AF' }}
                      disabled={isSaving}
                      onClick={async () => {
                        await submitAPI({ action: 'copy', intro: copy.intro, about: copy.about });
                        await submitAPI({
                          action: 'connections',
                          whatsapp: links.whatsapp,
                          booking: links.booking,
                        });
                        showToast('Settings saved successfully.');
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------
          COMMAND PALETTE MODAL (Cmd+K / Ctrl+K)
          -------------------------------------------------------------------- */}
      {cmdPaletteOpen && (
        <div className="fd-modal-backdrop" onClick={() => setCmdPaletteOpen(false)}>
          <div className="cmd-palette-box" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-palette-header">
              <Search size={18} style={{ color: '#5b6b7f' }} />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search..."
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                className="cmd-palette-input"
              />
              <button
                type="button"
                className="fd-sidebar-toggle-btn"
                onClick={() => setCmdPaletteOpen(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="cmd-palette-results">
              {cmdPaletteItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="cmd-palette-item"
                  onClick={() => {
                    item.action();
                    setCmdPaletteOpen(false);
                    setCmdQuery('');
                  }}
                >
                  <span>{item.label}</span>
                  <span className="cmd-palette-meta">{item.group}</span>
                </button>
              ))}
              {cmdPaletteItems.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#5b6b7f' }}>
                  No matches found for &ldquo;{cmdQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL: PROJECT CREATE / EDIT
          -------------------------------------------------------------------- */}
      {projectModalOpen && editingProject && (
        <div className="fd-modal-backdrop" onClick={() => setProjectModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 className="fd-modal-title">
                {editingProject.slug ? 'Edit project' : 'Create new project'}
              </h3>
              <button
                type="button"
                className="fd-topbar-btn"
                style={{ padding: '0.35rem' }}
                onClick={() => setProjectModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject}>
              <div className="fd-form-group">
                <label>Project title</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    setEditingProject((p) => (p ? { ...p, title, slug: p.slug || slug } : null));
                  }}
                  placeholder="e.g. Distributed Core Gateway"
                />
              </div>

              <div className="fd-form-group">
                <label>URL slug</label>
                <input
                  type="text"
                  required
                  value={editingProject.slug}
                  onChange={(e) =>
                    setEditingProject((p) => (p ? { ...p, slug: e.target.value } : null))
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="fd-form-group">
                  <label>Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject((p) => (p ? { ...p, category: e.target.value } : null))
                    }
                  >
                    <option value="Web application">Web application</option>
                    <option value="Security audit">Security audit</option>
                    <option value="API platform">API platform</option>
                    <option value="Studio concept">Studio concept</option>
                  </select>
                </div>
                <div className="fd-form-group">
                  <label>Publication status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject((p) =>
                        p ? { ...p, status: e.target.value as 'published' | 'draft' } : null
                      )
                    }
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>
              </div>

              <div className="fd-form-group">
                <label>Summary</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.summary}
                  onChange={(e) =>
                    setEditingProject((p) => (p ? { ...p, summary: e.target.value } : null))
                  }
                  placeholder="Concise overview of engineering approach..."
                />
              </div>

              <div className="fd-form-group">
                <label>Artwork image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const dataUrl = await processImageFile(file);
                      setEditingProject((p) => (p ? { ...p, image: dataUrl } : null));
                      showToast('Artwork loaded.');
                    } catch (err: any) {
                      showToast(err.message);
                    }
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type="button"
                  className="fd-topbar-btn"
                  onClick={() => setProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fd-topbar-btn primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL: INQUIRY INSPECT & NOTES
          -------------------------------------------------------------------- */}
      {selectedMessage && (
        <div className="fd-modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 className="fd-modal-title">Client inquiry details</h3>
              <button
                type="button"
                className="fd-topbar-btn"
                style={{ padding: '0.35rem' }}
                onClick={() => setSelectedMessage(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '1.15rem', color: '#0B1F3A' }}>
                  {selectedMessage.name}
                </strong>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{ display: 'block', color: '#1E40AF', fontSize: '0.88rem' }}
                >
                  {selectedMessage.email}
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#5b6b7f' }}>Topic</span>
                  <p style={{ margin: '0.15rem 0 0', fontWeight: 600 }}>{selectedMessage.topic}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#5b6b7f' }}>Budget</span>
                  <p style={{ margin: '0.15rem 0 0', fontWeight: 600, color: '#1E40AF' }}>
                    {selectedMessage.budget || 'Custom'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(11,31,58,0.08)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#5b6b7f',
                    textTransform: 'uppercase',
                  }}
                >
                  Client submission brief
                </span>
                <p style={{ marginTop: '0.5rem', lineHeight: 1.6, color: '#0B1F3A' }}>
                  {selectedMessage.brief}
                </p>
              </div>

              <div className="fd-form-group">
                <label>Internal notes</label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record call summaries, milestones, or private notes..."
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleUpdateMessageStatus(selectedMessage.id, e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(11,31,58,0.15)',
                  }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="fd-topbar-btn"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="fd-topbar-btn primary"
                    onClick={() => {
                      handleSaveMessageNotes(selectedMessage.id, editingNotes);
                      setSelectedMessage(null);
                    }}
                  >
                    Save notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL: FOUNDER MEMBER CREATE / EDIT
          -------------------------------------------------------------------- */}
      {founderModalOpen && editingFounder && (
        <div className="fd-modal-backdrop" onClick={() => setFounderModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 className="fd-modal-title">
                {editingFounder.id ? 'Edit team member' : 'Add team member'}
              </h3>
              <button
                type="button"
                className="fd-topbar-btn"
                style={{ padding: '0.35rem' }}
                onClick={() => setFounderModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFounder}>
              <div className="fd-form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={editingFounder.name}
                  onChange={(e) =>
                    setEditingFounder((f) => (f ? { ...f, name: e.target.value } : null))
                  }
                />
              </div>

              <div className="fd-form-group">
                <label>Role</label>
                <input
                  type="text"
                  required
                  value={editingFounder.role}
                  onChange={(e) =>
                    setEditingFounder((f) => (f ? { ...f, role: e.target.value } : null))
                  }
                  placeholder="e.g. Co-founder and lead systems architect"
                />
              </div>

              <div className="fd-form-group">
                <label>Quote (optional)</label>
                <input
                  type="text"
                  value={editingFounder.quote || ''}
                  onChange={(e) =>
                    setEditingFounder((f) => (f ? { ...f, quote: e.target.value } : null))
                  }
                />
              </div>

              <div className="fd-form-group">
                <label>Bio narrative</label>
                <textarea
                  rows={3}
                  required
                  value={editingFounder.bio}
                  onChange={(e) =>
                    setEditingFounder((f) => (f ? { ...f, bio: e.target.value } : null))
                  }
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type="button"
                  className="fd-topbar-btn"
                  onClick={() => setFounderModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fd-topbar-btn primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODAL: ROTATE PASSWORD
          -------------------------------------------------------------------- */}
      {passwordModalOpen && (
        <div className="fd-modal-backdrop" onClick={() => setPasswordModalOpen(false)}>
          <div className="fd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3 className="fd-modal-title">Rotate owner password</h3>
              <button
                type="button"
                className="fd-topbar-btn"
                style={{ padding: '0.35rem' }}
                onClick={() => setPasswordModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRotatePassword}>
              <div className="fd-form-group">
                <label>Current password</label>
                <input
                  type="password"
                  required
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                />
              </div>
              <div className="fd-form-group">
                <label>New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pwdNext}
                  onChange={(e) => setPwdNext(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  type="button"
                  className="fd-topbar-btn"
                  onClick={() => setPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fd-topbar-btn primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          TOAST NOTIFICATION
          -------------------------------------------------------------------- */}
      {toastMessage && (
        <div className="fd-toast" role="status">
          <Check size={16} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
