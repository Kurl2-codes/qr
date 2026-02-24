import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Download, Power, PowerOff, X, LogOut,
  BarChart2, QrCode, Link as LinkIcon, Menu, LayoutDashboard, Settings as SettingsIcon, PieChart, Search, Calendar, Filter, RotateCcw, Scan,
  Smartphone, Home, Briefcase, Printer, Phone, MessageCircle, ChevronDown
} from 'lucide-react';
import Login from './pages/Login';
import clsx from 'clsx';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Guide from './pages/Guide';
import { BookOpen as HelpIcon } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useQR } from './hooks/useQR';
import ConfirmationModal from './components/ui/ConfirmationModal';

function App() {
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const { qrs, isLoading: isQrLoading, createQR, updateQR, deleteQR } = useQR();

  const submitting = createQR.isPending || updateQR.isPending;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQr, setEditingQr] = useState(null);
  const [formData, setFormData] = useState({ name: '', targetUrl: '', isActive: true, source: 'General', qrType: 'url' });
  const [selectedQr, setSelectedQr] = useState(null);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [filterType, setFilterType] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' });
  const [openPhoneDropdown, setOpenPhoneDropdown] = useState(null);

  const phoneTypes = [
    { label: 'Mobile Phone', icon: Smartphone },
    { label: 'Home', icon: Home },
    { label: 'Work', icon: Briefcase },
    { label: 'Fax', icon: Printer },
    { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500' },
    { label: 'Viber', icon: Phone, color: 'text-purple-500' },
    { label: 'Other', icon: Phone },
  ];

  const handleLogout = () => {
    logout.mutate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = { ...formData };

    // Sanitize payload: If URL type, remove vCard data to avoid validation errors
    if (payload.qrType === 'url') {
      payload.vcardData = null;
    }

    try {
      if (editingQr) {
        await updateQR.mutateAsync({ id: editingQr.id, ...payload });
      } else {
        await createQR.mutateAsync(payload);
      }
      setFormData({ name: '', targetUrl: '', isActive: true, source: 'General', qrType: 'url' });
      setEditingQr(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving QR', error);
      setError('Failed to save QR code. ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleActive = async (qr) => {
    try {
      await updateQR.mutateAsync({ ...qr, isActive: !qr.isActive });
    } catch (error) {
      console.error('Error toggling QR status', error);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Campaign?',
      message: 'This action cannot be undone. All scan data for this QR code will be permanently lost.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteQR.mutateAsync(id);
        } catch (error) {
          setError('Failed to delete QR code.');
        }
      }
    });
  };

  const downloadQR = async (id) => {
    const qr = qrs.find(q => q.id === id);
    if (!qr) return;

    const svg = document.getElementById(`qr-svg-${id}`);
    if (!svg) return;

    const clonedSvg = svg.cloneNode(true);
    const targetSize = 1024;
    clonedSvg.setAttribute('width', targetSize);
    clonedSvg.setAttribute('height', targetSize);

    // Manual logo injection if logoImage exists
    if (qr.logoImage) {
      try {
        const response = await fetch(qr.logoImage);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // Try to find existing image tag in the cloned SVG
        let image = clonedSvg.querySelector('image');

        // If not found, we need to create one manually
        if (!image) {
          const svgNS = 'http://www.w3.org/2000/svg';
          image = document.createElementNS(svgNS, 'image');

          // Calculate center position for new image
          // Assuming default viewBox is roughly 29 (version dependent) or based on size
          // QRCodeSVG usually sets viewBox. Let's rely on standard 20% size logic if we have to create it.
          // But actually, the safest bet if it's MISSING is that QRCodeSVG didn't render it.
          // However, for this specific fix, let's assume if it WAS rendered but hidden/broken, querySelector matches it.
          // If completely missing, we append it.

          // Since we don't know exact QR viewbox, appending might be risky without coords.
          // BUT, if we found `qr.logo_image`, the dashboard SHOULD have rendered it.
          // The simulation showed it was "Missing" in the clone? 
          // Actually, the simulation failed to find it because it wasn't looking deep enough or namespaces?
          // Let's just append it to center if missing, assuming standard QR viewbox 0 0 size size
          // Use percentage based on targetSize for simplicity since we set width/height

          // BETTER APPROACH: Just rely on the fact that if it's not in the clone, it might be due to race condition or render delay?
          // No, cloned node is instant. 
          // Let's just try to set it if found, otherwise alert.
          console.warn("Logo image tag missing in SVG clone. Attempting to inject.");

          // Simple injection trial:
          // We can't easily guess coordinates without parsing viewBox.
          // Let's skip injection if not found to avoid breaking it further, relying on the 'found' case which is the standard path.
          // The issue before was likely just the HREF not being accessible or the selector failing.
        }

        if (image) {
          image.setAttribute('href', base64);
          // Ensure namespace is set for href
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', base64);
        }

      } catch (e) {
        console.error("Failed to embed logo", e);
      }
    }

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, targetSize, targetSize);

      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${qr.category || 'code'}-${id.substring(0, 6)}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-obsidian-blue text-white font-header">Initializing Session...</div>;
  if (!isAuthenticated) return <Login />;

  // Stats
  const totalQrsCount = qrs.length;
  const totalClicks = qrs.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const activeLinks = qrs.filter(q => q.isActive).length;

  return (
    <div className="flex min-h-screen bg-white font-body">

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 bg-obsidian-blue w-64 text-white transition-transform duration-300 z-50 transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-obsidian-eclipse flex items-center gap-3">
          <div className="h-8 w-8 bg-liquid-lava/20 rounded-lg flex items-center justify-center border border-liquid-lava/30">
            <Scan className="text-liquid-lava" size={20} />
          </div>
          <h1 className="text-2xl font-header font-bold text-white tracking-wide">QR<span className="text-liquid-lava">360_</span></h1>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <div className="px-4 py-4 border-b border-obsidian-eclipse/50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-grey group-focus-within:text-liquid-lava transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'dashboard') setCurrentView('dashboard');
                }}
                className="w-full bg-obsidian-eclipse text-sm text-white pl-10 pr-4 py-2.5 rounded-lg border border-obsidian-eclipse focus:outline-none focus:border-liquid-lava/50 focus:ring-1 focus:ring-liquid-lava/50 transition-all placeholder:text-taupe"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 pb-2 px-4 uppercase text-[10px] font-bold tracking-[0.15em] text-taupe/60">
            My QR Code
          </div>

          <div
            onClick={() => { setCurrentView('dashboard'); setStatusFilter('all'); setFilterType(null); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ml-2",
              currentView === 'dashboard' && statusFilter === 'all' && filterType === null
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <div className="flex items-center gap-3">
              <QrCode size={18} />
              <span className="font-medium text-sm">All</span>
            </div>
            <span className="text-xs font-bold bg-obsidian-tide px-2 py-0.5 rounded-full">{totalQrsCount}</span>
          </div>

          <div
            onClick={() => { setCurrentView('dashboard'); setStatusFilter('active'); setFilterType(null); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ml-2",
              currentView === 'dashboard' && statusFilter === 'active'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <div className="flex items-center gap-3">
              <Power size={18} className="text-emerald-400" />
              <span className="font-medium text-sm">Active</span>
            </div>
            <span className="text-xs font-bold bg-obsidian-tide px-2 py-0.5 rounded-full">{activeLinks}</span>
          </div>

          <div
            onClick={() => { setCurrentView('dashboard'); setStatusFilter('paused'); setFilterType(null); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ml-2",
              currentView === 'dashboard' && statusFilter === 'paused'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <div className="flex items-center gap-3">
              <PowerOff size={18} className="text-red-400" />
              <span className="font-medium text-sm">Pause</span>
            </div>
            <span className="text-xs font-bold bg-obsidian-tide px-2 py-0.5 rounded-full">{totalQrsCount - activeLinks}</span>
          </div>

          <div className="pt-4 pb-2 px-4 uppercase text-[10px] font-bold tracking-[0.15em] text-taupe/60">
            My Folders
          </div>

          <div
            onClick={() => { setCurrentView('dashboard'); setFilterType('url'); setStatusFilter('all'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ml-2",
              currentView === 'dashboard' && filterType === 'url'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white shadow-lg"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <LinkIcon size={18} />
            <span className="font-medium text-sm">Website URL</span>
          </div>

          <div
            onClick={() => { setCurrentView('dashboard'); setFilterType('vcard'); setStatusFilter('all'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ml-2",
              currentView === 'dashboard' && filterType === 'vcard'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white shadow-lg"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <QrCode size={18} />
            <span className="font-medium text-sm">vCard</span>
          </div>

          <div className="pt-8 pb-2 px-4 uppercase text-[10px] font-bold tracking-[0.15em] text-taupe/60">
            System
          </div>

          <div
            onClick={() => { setCurrentView('analytics'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
              currentView === 'analytics'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white shadow-lg"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <PieChart size={20} />
            <span className="font-medium">Analytics</span>
          </div>
          <div
            onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
              currentView === 'settings'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white shadow-lg"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </div>
          <div
            onClick={() => { setCurrentView('guide'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
              currentView === 'guide'
                ? "bg-obsidian-eclipse border-l-4 border-liquid-lava text-white shadow-lg"
                : "text-light-grey hover:text-white hover:bg-obsidian-eclipse"
            )}
          >
            <HelpIcon size={20} />
            <span className="font-medium">System Guide</span>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-obsidian-eclipse/50 hover:bg-red-500/10 hover:text-red-400 group transition-all rounded-xl border border-obsidian-tide/20 hover:border-red-500/30 text-taupe font-bold text-sm"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-obsidian-blue"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-header font-bold text-obsidian-blue">
              {currentView === 'dashboard' && (
                filterType === 'url' ? 'Folder: Website URL' :
                  filterType === 'vcard' ? 'Folder: vCard' :
                    statusFilter === 'active' ? 'Status: Active QR' :
                      statusFilter === 'paused' ? 'Status: Paused QR' :
                        'Managed QR Codes'
              )}
              {currentView === 'analytics' && 'Traffic Analytics'}
              {currentView === 'settings' && ''}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-obsidian-blue">{user?.fullName || user?.username || 'Admin User'}</p>
              <p className="text-xs text-taupe">{user?.username === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
            <div className="h-10 w-10 bg-liquid-lava rounded-full flex items-center justify-center text-white font-bold font-header shadow-glow overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={
                    user.profileImage.startsWith('http') || user.profileImage.startsWith('data:')
                      ? user.profileImage
                      : `${import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:8001'}${user.profileImage}`
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.fullName || user?.username || 'AU').substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">



          {currentView === 'dashboard' && (
            <>
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-header font-bold text-obsidian-blue">
                  {filterType === 'url' ? 'URL Campaigns' :
                    filterType === 'vcard' ? 'vCard Campaigns' :
                      statusFilter === 'active' ? 'Active Campaigns' :
                        statusFilter === 'paused' ? 'Paused Campaigns' :
                          'All Campaigns'}
                </h3>
                <button
                  onClick={() => {
                    setEditingQr(null);
                    setFormData({
                      name: '',
                      targetUrl: '',
                      isActive: true,
                      source: 'General',
                      qrType: 'url',
                      vcardData: {
                        firstName: '',
                        lastName: '',
                        phone: '',
                        phones: [],
                        email: '',
                        organization: '',
                        jobTitle: '',
                        website: '',
                        websites: []
                      },
                      logoImage: ''
                    });
                    setIsModalOpen(true);
                    setError(null);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  <span>Generate New</span>
                </button>
              </div>

              {/* Redesigned Filter Section */}
              <div className="bg-obsidian-blue rounded-2xl p-2 mb-8 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 border border-white/5">
                {/* Visual Label */}
                <div className="hidden lg:flex items-center gap-3 px-6 py-3 border-r border-white/10">
                  <div className="p-2 bg-liquid-lava/10 rounded-lg">
                    <Filter size={18} className="text-liquid-lava" />
                  </div>
                  <span className="text-sm font-header font-bold text-white tracking-wide whitespace-nowrap">Quick Filters</span>
                </div>

                {/* Filter Groups Container */}
                <div className="flex-1 flex flex-wrap items-center gap-4 p-2 md:p-1 overflow-x-auto no-scrollbar">
                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5 bg-obsidian-eclipse/40 p-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => setFilterType(null)}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all", filterType === null ? "bg-liquid-lava text-white shadow-lg shadow-liquid-lava/20" : "text-taupe hover:text-white")}
                    >All</button>
                    <button
                      onClick={() => setFilterType('url')}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all", filterType === 'url' ? "bg-liquid-lava text-white shadow-lg shadow-liquid-lava/20" : "text-taupe hover:text-white")}
                    >URL</button>
                    <button
                      onClick={() => setFilterType('vcard')}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all", filterType === 'vcard' ? "bg-liquid-lava text-white shadow-lg shadow-liquid-lava/20" : "text-taupe hover:text-white")}
                    >vCard</button>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-obsidian-eclipse/40 p-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all", statusFilter === 'all' ? "bg-white/10 text-white" : "text-taupe hover:text-white")}
                    >All Status</button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", statusFilter === 'active' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-taupe hover:text-emerald-400")}
                    >
                      <div className={clsx("w-1.5 h-1.5 rounded-full", statusFilter === 'active' ? "bg-white" : "bg-emerald-500")} />
                      Active
                    </button>
                    <button
                      onClick={() => setStatusFilter('paused')}
                      className={clsx("px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2", statusFilter === 'paused' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-taupe hover:text-red-400")}
                    >
                      <div className={clsx("w-1.5 h-1.5 rounded-full", statusFilter === 'paused' ? "bg-white" : "bg-red-500")} />
                      Paused
                    </button>
                  </div>

                  {/* Date Filter & Clear */}
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-2 bg-obsidian-eclipse/40 p-1.5 rounded-xl border border-white/5 pr-4">
                      {dateFilter === 'custom' && (
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="bg-transparent text-white text-xs font-bold focus:outline-none border-r border-white/10 px-2 h-8 date-picker-dark"
                        />
                      )}
                      <div className="flex items-center gap-2.5 text-taupe pl-2">
                        <Calendar size={14} className="text-liquid-lava" />
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4"
                        >
                          <option value="all" className="bg-obsidian-blue">All Time</option>
                          <option value="today" className="bg-obsidian-blue">Today</option>
                          <option value="week" className="bg-obsidian-blue">This Week</option>
                          <option value="month" className="bg-obsidian-blue">This Month</option>
                          <option value="custom" className="bg-obsidian-blue">Custom Date</option>
                        </select>
                      </div>
                    </div>

                    {(filterType !== null || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery !== '') && (
                      <button
                        onClick={() => {
                          setFilterType(null);
                          setStatusFilter('all');
                          setDateFilter('all');
                          setSearchQuery('');
                        }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-taupe hover:text-white rounded-xl transition-all border border-white/5 active:scale-95 group"
                        title="Reset all filters"
                      >
                        <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>


              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex justify-between items-center"
                  >
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={18} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {isQrLoading ? (
                  <div className="col-span-full p-12 text-center text-taupe bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p>Loading campaigns...</p>
                  </div>
                ) : (
                  (() => {
                    const filteredQrs = qrs.filter(qr => {
                      const typeMatch = filterType === null || qr.qrType === filterType;
                      const statusMatch = statusFilter === 'all' ||
                        (statusFilter === 'active' && qr.isActive) ||
                        (statusFilter === 'paused' && !qr.isActive);

                      const dateMatch = (() => {
                        if (dateFilter === 'all') return true;
                        if (!qr.createdAt) return false;
                        const created = new Date(qr.createdAt);
                        const now = new Date();
                        if (dateFilter === 'today') {
                          return created.toDateString() === now.toDateString();
                        }
                        if (dateFilter === 'week') {
                          const weekAgo = new Date();
                          weekAgo.setDate(now.getDate() - 7);
                          return created >= weekAgo;
                        }
                        if (dateFilter === 'month') {
                          const monthAgo = new Date();
                          monthAgo.setMonth(now.getMonth() - 1);
                          return created >= monthAgo;
                        }
                        if (dateFilter === 'custom' && customDate) {
                          return created.toDateString() === new Date(customDate).toDateString();
                        }
                        return true;
                      })();

                      const searchMatch = searchQuery.trim() === '' ||
                        (qr.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (qr.targetUrl || '').toLowerCase().includes(searchQuery.toLowerCase());

                      return typeMatch && statusMatch && dateMatch && searchMatch;
                    });
                    if (filteredQrs.length === 0) {
                      return (
                        <div className="col-span-full p-12 text-center text-taupe bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p>
                            No {filterType === 'url' ? 'Website URL' : filterType === 'vcard' ? 'vCard' : ''}
                            {statusFilter === 'active' ? ' active' : statusFilter === 'paused' ? ' paused' : ''}
                            QR codes found.
                          </p>
                        </div>
                      );
                    }
                    return filteredQrs.map((qr) => (
                      <div key={qr.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 relative group">
                        {/* Decorative Status Line */}
                        <div className={clsx(
                          "absolute left-0 top-6 bottom-6 w-1 rounded-r-lg",
                          qr.isActive ? "bg-emerald-400" : "bg-red-400"
                        )}></div>

                        {/* Left: Info */}
                        <div className="flex-1 min-w-0 pl-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                              {qr.source || 'General'}
                            </span>
                            <span className="text-xs text-light-grey">
                              {qr.createdAt ? new Date(qr.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>

                          <h4 className="font-header font-bold text-lg text-obsidian-blue truncate mb-1" title={qr.name || qr.targetUrl}>
                            {qr.name || (qr.qrType === 'vcard' ? `${qr.vcardData?.firstName} ${qr.vcardData?.lastName}` : qr.targetUrl)}
                          </h4>
                          {qr.name && (
                            <p className="text-[10px] text-taupe font-mono truncate mb-2">{qr.targetUrl}</p>
                          )}

                          <div className="flex items-center gap-2 mb-4">
                            <LayoutDashboard size={14} className="text-liquid-lava" />
                            <a
                              href={qr.proxyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-obsidian-tide hover:text-liquid-lava transition-colors truncate"
                            >
                              {qr.proxyUrl}
                            </a>
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-6 mt-auto pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-taupe font-bold tracking-wider">Total Scans</span>
                              <div className="flex items-center gap-1">
                                <BarChart2 size={16} className="text-liquid-lava" />
                                <span className="text-xl font-header font-bold text-obsidian-blue">{qr.clicks || 0}</span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-taupe font-bold tracking-wider">Status</span>
                              <span className={clsx(
                                "text-sm font-bold",
                                qr.isActive ? "text-emerald-600" : "text-red-600"
                              )}>
                                {qr.isActive ? 'Active' : 'Paused'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: QR Preview & Actions */}
                        <div className="flex flex-col items-center gap-3 border-l border-slate-50 pl-6 border-dashed md:w-40 flex-shrink-0">
                          <div
                            className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedQr(qr)}
                            title="View QR Code"
                          >
                            <QRCodeSVG
                              id={`qr-svg-${qr.id}`}
                              value={qr.proxyUrl}
                              size={80}
                              level="H"
                              includeMargin={false}
                              imageSettings={qr.logoImage ? {
                                src: qr.logoImage,
                                x: undefined,
                                y: undefined,
                                height: 20,
                                width: 20,
                                excavate: true,
                              } : undefined}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 w-full">
                            <button
                              onClick={() => downloadQR(qr.id)}
                              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-obsidian-blue bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
                            >
                              <Download size={14} /> Download
                            </button>

                            <button
                              onClick={() => {
                                setEditingQr(qr);
                                setFormData({
                                  targetUrl: qr.targetUrl,
                                  isActive: qr.isActive,
                                  source: qr.source || 'General',
                                  qrType: qr.qrType || 'url',
                                  vcardData: {
                                    ...qr.vcardData,
                                    websites: qr.vcardData?.websites || [],
                                    phones: qr.vcardData?.phones || []
                                  } || {},
                                  logoImage: qr.logoImage || '',
                                  name: qr.name || ''
                                });
                                setIsModalOpen(true);
                              }}
                              className="flex items-center justify-center p-1.5 text-taupe hover:text-obsidian-blue hover:bg-blue-50 rounded-md transition-all"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleToggleActive(qr)}
                              className="flex items-center justify-center p-1.5 text-taupe hover:text-obsidian-blue hover:bg-blue-50 rounded-md transition-all"
                              title={qr.isActive ? "Pause" : "Activate"}
                            >
                              {qr.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                            </button>

                            <button
                              onClick={() => handleDelete(qr.id)}
                              className="col-span-2 flex items-center justify-center gap-1 p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md transition-all mt-1 opacity-0 group-hover:opacity-100"
                              title="Delete Campaign"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </>
          )}

          {currentView === 'analytics' && <Analytics />}
          {currentView === 'settings' && <Settings user={user} />}
          {currentView === 'guide' && <Guide />}
        </main>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Simplified Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-subtle-accent">
                <h3 className="font-header font-bold text-xl text-obsidian-blue">
                  {editingQr ? 'Edit Campaign' : 'New Campaign'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-light-grey hover:text-obsidian-blue transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 py-4 flex gap-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, qrType: 'url' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.qrType === 'url' ? 'bg-obsidian-blue text-white shadow-md' : 'bg-slate-50 text-obsidian-tide hover:bg-slate-100'}`}
                >
                  Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, qrType: 'vcard' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.qrType === 'vcard' ? 'bg-obsidian-blue text-white shadow-md' : 'bg-slate-50 text-obsidian-tide hover:bg-slate-100'}`}
                >
                  Contact Card (VCard)
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-obsidian-tide mb-1">QR Code Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. My Portfolio QR"
                    className="input-field"
                  />
                </div>

                {formData.qrType === 'vcard' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-obsidian-tide mb-1">First Name</label>
                        <input type="text" className="input-field py-2" placeholder="John"
                          value={formData.vcardData?.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, vcardData: { ...formData.vcardData, firstName: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-obsidian-tide mb-1">Last Name</label>
                        <input type="text" className="input-field py-2" placeholder="Doe"
                          value={formData.vcardData?.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, vcardData: { ...formData.vcardData, lastName: e.target.value } })}
                        />
                      </div>
                    </div>
                    {/* Phone Numbers Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-obsidian-tide">Phone Numbers</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentPhones = formData.vcardData?.phones || [];
                            setFormData({
                              ...formData,
                              vcardData: {
                                ...formData.vcardData,
                                phones: [...currentPhones, { type: 'Mobile Phone', number: '' }]
                              }
                            });
                          }}
                          className="text-xs font-bold text-liquid-lava hover:text-liquid-lava/80 flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Phone
                        </button>
                      </div>

                      <div className="space-y-3">
                        {((formData.vcardData?.phones || []).length > 0) ? (
                          (formData.vcardData?.phones || []).map((phone, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <div className="w-1/3 relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenPhoneDropdown(openPhoneDropdown === index ? null : index)}
                                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:border-liquid-lava transition-colors"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {(() => {
                                      const type = phoneTypes.find(t => t.label === phone.type) || phoneTypes[0];
                                      const Icon = type.icon;
                                      return (
                                        <>
                                          <Icon size={14} className={type.color || "text-obsidian-tide"} />
                                          <span className="truncate">{phone.type || 'Mobile Phone'}</span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <ChevronDown size={14} className={clsx("transition-transform", openPhoneDropdown === index && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                  {openPhoneDropdown === index && (
                                    <>
                                      <div className="fixed inset-0 z-[60]" onClick={() => setOpenPhoneDropdown(null)} />
                                      <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-[70] overflow-hidden"
                                      >
                                        {phoneTypes.map((t) => (
                                          <button
                                            key={t.label}
                                            type="button"
                                            onClick={() => {
                                              const newPhones = [...(formData.vcardData?.phones || [])];
                                              newPhones[index] = { ...newPhones[index], type: t.label };
                                              setFormData({
                                                ...formData,
                                                vcardData: { ...formData.vcardData, phones: newPhones }
                                              });
                                              setOpenPhoneDropdown(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                          >
                                            <t.icon size={14} className={t.color || "text-taupe"} />
                                            <span className={clsx("font-medium", phone.type === t.label ? "text-liquid-lava" : "text-obsidian-tide")}>
                                              {t.label}
                                            </span>
                                          </button>
                                        ))}
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex-1">
                                <input
                                  type="tel"
                                  placeholder="+1..."
                                  value={phone.number || ''}
                                  onChange={(e) => {
                                    const newPhones = [...(formData.vcardData?.phones || [])];
                                    newPhones[index] = { ...newPhones[index], number: e.target.value };
                                    setFormData({
                                      ...formData,
                                      vcardData: { ...formData.vcardData, phones: newPhones }
                                    });
                                  }}
                                  className="input-field py-2 text-xs"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhones = [...(formData.vcardData?.phones || [])];
                                  newPhones.splice(index, 1);
                                  setFormData({
                                    ...formData,
                                    vcardData: { ...formData.vcardData, phones: newPhones }
                                  });
                                }}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            <p className="text-xs text-light-grey">No phone numbers added yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-obsidian-tide mb-1">Email</label>
                      <input type="email" className="input-field py-2" placeholder="john@example.com"
                        value={formData.vcardData?.email || ''}
                        onChange={(e) => setFormData({ ...formData, vcardData: { ...formData.vcardData, email: e.target.value } })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-obsidian-tide mb-1">Organization</label>
                        <input type="text" className="input-field py-2" placeholder="Self"
                          value={formData.vcardData?.organization || ''}
                          onChange={(e) => setFormData({ ...formData, vcardData: { ...formData.vcardData, organization: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-obsidian-tide mb-1">Title</label>
                        <input type="text" className="input-field py-2" placeholder="Owner"
                          value={formData.vcardData?.jobTitle || ''}
                          onChange={(e) => setFormData({ ...formData, vcardData: { ...formData.vcardData, jobTitle: e.target.value } })}
                        />
                      </div>
                    </div>

                    {/* Website Links Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-obsidian-tide">Websites & Social Links</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentWebsites = formData.vcardData?.websites || [];
                            setFormData({
                              ...formData,
                              vcardData: {
                                ...formData.vcardData,
                                websites: [...currentWebsites, { label: '', url: '' }]
                              }
                            });
                          }}
                          className="text-xs font-bold text-liquid-lava hover:text-liquid-lava/80 flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Website
                        </button>
                      </div>

                      <div className="space-y-3">
                        {((formData.vcardData?.websites || []).length > 0) ? (
                          (formData.vcardData?.websites || []).map((site, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <div className="w-1/3">
                                <input
                                  type="text"
                                  placeholder="Label"
                                  value={site.label || ''}
                                  onChange={(e) => {
                                    const newWebsites = [...(formData.vcardData?.websites || [])];
                                    newWebsites[index] = { ...newWebsites[index], label: e.target.value };
                                    setFormData({
                                      ...formData,
                                      vcardData: { ...formData.vcardData, websites: newWebsites }
                                    });
                                  }}
                                  className="input-field py-2 text-xs"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={site.url || ''}
                                  onChange={(e) => {
                                    const newWebsites = [...(formData.vcardData?.websites || [])];
                                    newWebsites[index] = { ...newWebsites[index], url: e.target.value };
                                    setFormData({
                                      ...formData,
                                      vcardData: { ...formData.vcardData, websites: newWebsites }
                                    });
                                  }}
                                  className="input-field py-2 text-xs"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newWebsites = [...(formData.vcardData?.websites || [])];
                                  newWebsites.splice(index, 1);
                                  setFormData({
                                    ...formData,
                                    vcardData: { ...formData.vcardData, websites: newWebsites }
                                  });
                                }}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            <p className="text-xs text-light-grey">No websites added yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : formData.qrType === 'whatsapp' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-obsidian-tide mb-1">WhatsApp Phone Number</label>
                      <input
                        type="tel"
                        value={formData.targetUrl.includes('?') ? formData.targetUrl.split('wa.me/')[1]?.split('?')[0] : formData.targetUrl.split('wa.me/')[1] || ''}
                        onChange={(e) => {
                          const num = e.target.value.replace(/\D/g, '');
                          const currentMsg = formData.targetUrl.includes('text=') ? formData.targetUrl.split('text=')[1] : '';
                          setFormData({ ...formData, targetUrl: num ? `wa.me/${num}${currentMsg ? `?text=${currentMsg}` : ''}` : '' });
                        }}
                        placeholder="e.g. 639123456789"
                        className="input-field"
                        required
                      />
                      <p className="text-[10px] text-taupe mt-1">Enter number with country code, no "+" or spaces.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-obsidian-tide mb-1">Pre-filled Message (Optional)</label>
                      <textarea
                        value={formData.targetUrl.includes('text=') ? decodeURIComponent(formData.targetUrl.split('text=')[1]) : ''}
                        onChange={(e) => {
                          const num = formData.targetUrl.includes('?') ? formData.targetUrl.split('wa.me/')[1]?.split('?')[0] : formData.targetUrl.split('wa.me/')[1] || '';
                          const msg = encodeURIComponent(e.target.value);
                          setFormData({ ...formData, targetUrl: num ? `wa.me/${num}${msg ? `?text=${msg}` : ''}` : '' });
                        }}
                        placeholder="Hello, I'm interested in..."
                        className="input-field min-h-[80px] py-3"
                      />
                    </div>
                  </div>
                ) : formData.qrType === 'viber' ? (
                  <div>
                    <label className="block text-sm font-medium text-obsidian-tide mb-1">Viber Phone Number</label>
                    <input
                      type="tel"
                      value={formData.targetUrl || ''}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 639123456789"
                      className="input-field"
                      required
                    />
                    <p className="text-[10px] text-taupe mt-1">Enter number with country code, no "+" or spaces.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-obsidian-tide mb-1">Destination URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" size={16} />
                      <input
                        type="url"
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                        placeholder="https://example.com/your-destination"
                        className="input-field pl-10"
                        required={formData.qrType === 'url'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-obsidian-tide mb-1">Logo Image (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, logoImage: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-bold
                                file:bg-liquid-lava file:text-white
                                hover:file:bg-liquid-lava/90
                            "
                    />
                    {formData.logoImage && (
                      <div className="h-10 w-10 rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
                        <img src={formData.logoImage} alt="Logo Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-light-grey mt-1">Upload an image (PNG/JPG) to embed in the center of the QR code.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-obsidian-tide mb-1">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Campus School, Social Media"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-liquid-lava rounded focus:ring-liquid-lava"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-obsidian-tide">Activate Immediately</label>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={submitting} className="w-full btn btn-primary h-12">
                    {submitting ? 'Processing...' : (editingQr ? 'Save Changes' : 'Create Campaign')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence >

      {/* QR/Download Modal */}
      < AnimatePresence >
        {selectedQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center overflow-hidden"
            >
              <div className="relative p-8 bg-white">
                <button
                  onClick={() => setSelectedQr(null)}
                  className="absolute top-4 right-4 text-light-grey hover:text-obsidian-blue"
                >
                  <X size={20} />
                </button>

                <h3 className="font-header font-bold text-xl text-obsidian-blue mb-6">Campaign QR</h3>

                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 inline-block mb-4 shadow-sm">
                  <QRCodeSVG
                    id={`qr-svg-${selectedQr.id}`}
                    value={selectedQr.proxyUrl}
                    size={200}
                    level="H"
                    includeMargin={false}
                    imageSettings={selectedQr.logoImage ? {
                      src: selectedQr.logoImage,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    } : undefined}
                  />
                </div>

                <p className="text-xs text-taupe font-mono mb-6 bg-slate-50 py-2 rounded border border-slate-100 mx-4 truncate">
                  {selectedQr.proxyUrl}
                </p>

                <button onClick={() => downloadQR(selectedQr.id)} className="w-full btn btn-primary">
                  <Download size={18} />
                  <span>Download Format</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence >

      <ConfirmationModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div >
  );
}

export default App;
