'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { 
  Users, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Power,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Settings,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmed: 0,
    pending: 0,
    failed: 0,
    manualReview: 0,
    activeQuizSessions: 0,
    totalRevenue: 0,
  });

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [togglingField, setTogglingField] = useState<string | null>(null);
  const [toggleSuccessMsg, setToggleSuccessMsg] = useState('');

  

  useEffect(() => {
    async function init() {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch(`/api/admin/stats?_t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/admin/settings?_t=${Date.now()}`, { cache: 'no-store' })
        ]);
        if (sRes.ok) setStats(await sRes.json());
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.settings) setSettings(cData.settings);
        }
      } catch {}
      setLoadingSettings(false);
    }
    init();
  }, []);

  const handleQuickToggle = async (field: keyof SiteSettings, currentValue: boolean, label: string) => {
    if (!settings) return;
    setTogglingField(field);
    setToggleSuccessMsg('');

    const newValue = !currentValue;
    const previous = { ...settings };
    
    // Optimistic UI update
    setSettings({ ...settings, [field]: newValue });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { [field]: newValue }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update system toggle');
      }

      if (data.settings) setSettings(data.settings);
      setToggleSuccessMsg(`${label} has been switched ${newValue ? 'ON' : 'OFF'} successfully.`);
      setTimeout(() => setToggleSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating control toggle');
      setSettings(previous);
    } finally {
      setTogglingField(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        
        {/* Header with Super Admin Access confirmation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0ede8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#141412] text-white text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SUPER ADMIN • FULL ACCESS PRIVILEGES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.03em]">Admin Control Center</h1>
            <p className="text-xs sm:text-sm text-[#706e6a]">Live registration control, participant portal switchboard & platform analytics</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium px-5 py-2.5 rounded-full text-xs shadow-xs transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Master System Settings</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            SUPER ADMIN MASTER CONTROL SWITCHBOARD (REQUESTED FEATURE)
        ======================================================== */}
        <div className="bg-white rounded-[28px] border border-[#f0ede8] shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ede8] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Power className="w-5 h-5 text-[#ff6b35]" />
                <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                  Master System Control Switches
                </h2>
              </div>
              <p className="text-xs text-[#706e6a]">
                Instant global switches for user registration and participant portal access. Changes apply immediately in real time.
              </p>
            </div>

            {toggleSuccessMsg && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{toggleSuccessMsg}</span>
              </div>
            )}
          </div>

          {loadingSettings ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#706e6a]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#ff6b35]" />
              <span>Loading system master switches...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* SWITCH 1: REGISTRATION ON / OFF */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                settings?.registration_open 
                  ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d]' 
                  : 'bg-[#fff1f2] border-[#fecdd3] text-[#881337]'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Registration Switch
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      settings?.registration_open ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {settings?.registration_open ? 'OPEN / ACTIVE' : 'PAUSED / OFF'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#141412]">
                    Public Registration
                  </h3>
                  <p className="text-xs leading-relaxed opacity-90">
                    {settings?.registration_open 
                      ? 'New participants can submit details and register for the contest pass.'
                      : 'Registration form is locked. Participants are notified registrations are paused.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={togglingField === 'registration_open'}
                  onClick={() => handleQuickToggle('registration_open', Boolean(settings?.registration_open), 'Registration')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    settings?.registration_open 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {togglingField === 'registration_open' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  <span>{settings?.registration_open ? 'Turn OFF Registration' : 'Turn ON Registration'}</span>
                </button>
              </div>

              {/* SWITCH 2: PARTICIPANT PORTAL ON / OFF */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                settings?.portal_active 
                  ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]' 
                  : 'bg-[#fff7ed] border-[#fed7aa] text-[#7c2d12]'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Participant Portal
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      settings?.portal_active ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {settings?.portal_active ? 'ONLINE' : 'MAINTENANCE / OFF'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#141412]">
                    Dashboard & ID Cards
                  </h3>
                  <p className="text-xs leading-relaxed opacity-90">
                    {settings?.portal_active 
                      ? 'Registered participants can log in, view passes, and join the contest WhatsApp group.'
                      : 'Portal locked for maintenance. Non-admin participants see an offline screen.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={togglingField === 'portal_active'}
                  onClick={() => handleQuickToggle('portal_active', Boolean(settings?.portal_active), 'Participant Portal')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    settings?.portal_active 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {togglingField === 'portal_active' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  <span>{settings?.portal_active ? 'Turn OFF Portal' : 'Turn ON Portal'}</span>
                </button>
              </div>

              {/* SWITCH 3: SUBMISSION PORTAL WINDOW */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                settings?.submission_window_open 
                  ? 'bg-[#faf5ff] border-[#e9d5ff] text-[#581c87]' 
                  : 'bg-[#f8fafc] border-[#e2e8f0] text-[#334155]'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Submission Portal
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      settings?.submission_window_open ? 'bg-purple-600 text-white' : 'bg-slate-600 text-white'
                    }`}>
                      {settings?.submission_window_open ? 'ACTIVE' : 'LOCKED'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#141412]">
                    Poster Entry Uploads
                  </h3>
                  <p className="text-xs leading-relaxed opacity-90">
                    {settings?.submission_window_open 
                      ? 'Submission gateway allows participants to upload entries and PSD source files.'
                      : 'Submission uploads are locked pending start date or deadline.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={togglingField === 'submission_window_open'}
                  onClick={() => handleQuickToggle('submission_window_open', Boolean(settings?.submission_window_open), 'Submission Portal')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    settings?.submission_window_open 
                      ? 'bg-slate-700 hover:bg-slate-800 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {togglingField === 'submission_window_open' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : settings?.submission_window_open ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  <span>{settings?.submission_window_open ? 'Lock Submissions' : 'Open Submissions'}</span>
                </button>
              </div>

              {/* SWITCH 4: RESULTS PUBLICATION */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3.5 flex flex-col justify-between ${
                settings?.results_published 
                  ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]' 
                  : 'bg-[#fefce8] border-[#fef08a] text-[#854d0e]'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Results Status
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      settings?.results_published ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {settings?.results_published ? 'PUBLISHED' : 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#141412]">
                    Winner & Rank Release
                  </h3>
                  <p className="text-xs leading-relaxed opacity-90">
                    {settings?.results_published 
                      ? 'Final leaderboard & winner rank lists are visible publicly.'
                      : 'Results are hidden from participants while jury evaluation is in progress.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={togglingField === 'results_published'}
                  onClick={() => handleQuickToggle('results_published', Boolean(settings?.results_published), 'Results Release')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    settings?.results_published 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {togglingField === 'results_published' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{settings?.results_published ? 'Hide Results' : 'Publish Results'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            subtitle="All initiated submissions"
            icon={Users}
            color="brand"
          />
          <StatCard
            title="Confirmed Paid"
            value={stats.confirmed}
            subtitle={`Revenue: ₹${stats.totalRevenue.toLocaleString()}`}
            icon={CreditCard}
            color="emerald"
          />
          <StatCard
            title="Payment Pending"
            value={stats.pending}
            subtitle="Awaiting server confirmation"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Manual Review"
            value={stats.manualReview}
            subtitle="Requires administrator attention"
            icon={AlertTriangle}
            color="rose"
          />
        </div>

        {/* Sub-grid: Contest Tools & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#141412] text-white p-7 rounded-[28px] border border-[#262522] shadow-soft space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-medium text-base flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-[#ff6b35]" />
                <span>Super Admin Access & Audit</span>
              </h3>
              <p className="text-xs text-[#9c9a97] leading-relaxed">
                Active Live Sessions: <strong className="text-white font-semibold">{stats.activeQuizSessions}</strong>
              </p>
              <p className="text-xs text-[#9c9a97] leading-relaxed">
                Full super admin controls enabled. All switch toggles and participant modifications are signed and stored in immutable audit logs.
              </p>
            </div>
            <div className="pt-4 border-t border-[#262522] flex items-center justify-between text-[11px] text-[#9c9a97]">
              <span>TKFK Academic Bureau</span>
              <Link href="/admin/audit-logs" className="text-[#ff6b35] hover:underline">
                View Audit Trail →
              </Link>
            </div>
          </div>

          <div className="bg-[#141412] border border-[#262522] text-white p-7 rounded-[28px] shadow-soft space-y-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#ff6b35] bg-[#1f1e1b] px-3 py-1 rounded-full border border-[#ff6b35]/30 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-ping" />
                <span>SURVEILLANCE</span>
              </span>
              <h3 className="font-medium text-lg text-white">
                Live Camera Proctoring Wall
              </h3>
              <p className="text-xs text-[#9c9a97] leading-relaxed">
                Watch active participant webcam streams, check attendance, and monitor anti-cheat telemetry.
              </p>
            </div>
            
            <div className="pt-2">
              <a
                href="/admin/proctoring"
                className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium px-5 py-3 rounded-full text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>Open Camera Wall</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#f0ede8] text-[#141412] p-7 rounded-[28px] shadow-soft space-y-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#706e6a] bg-[#f0ede8] px-3 py-1 rounded-full border border-[#e2ded8] inline-block">
                PARTICIPANTS & PAYMENTS
              </span>
              <h3 className="font-medium text-lg text-[#141412]">
                Participant Directory
              </h3>
              <p className="text-xs text-[#706e6a] leading-relaxed">
                Manage registrations, manual activations, block/unblock, edit details, and export CSV reports.
              </p>
            </div>
            
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/admin/participants"
                className="inline-flex items-center gap-2 bg-[#141412] hover:bg-[#262522] text-white font-medium px-5 py-3 rounded-full text-xs shadow-2xs transition-all cursor-pointer"
              >
                <span>Manage Participants</span>
                <ArrowRight className="w-4 h-4 text-[#ff6b35]" />
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
