'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Link2, 
  AlertCircle,
  Power,
  Lock,
  Unlock,
  MessageCircle,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  RefreshCw,
  Sliders,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'switches' | 'contest' | 'social' | 'study' | 'security'>('switches');

  const [settings, setSettings] = useState<SiteSettings>({
    registration_open: true,
    registration_closed_message: "Registrations for the Digital Poster Creation Contest 2026 are temporarily closed by the administrator.",
    
    portal_active: true,
    portal_maintenance_message: "The participant portal is currently offline for scheduled maintenance. Please check back shortly.",
    
    submission_window_open: true,
    submission_window_message: "The submission portal is operating according to the official timeline.",

    results_published: false,
    results_note: "Official results verification in progress by the jury.",

    event_name: "TKFK Digital Poster Creation Contest 2026",
    event_date_display: "30 November 2026",
    registration_deadline: "30 November 2026, 11:59 PM IST",
    results_date_display: "5 December 2026, 10:00 AM IST",
    first_prize_display: "₹7,001",
    registration_fee: 99,

    community_whatsapp_url: "https://chat.whatsapp.com/JiyAOAZApX3Ft4wKwBK14k",
    contest_whatsapp_url: "https://chat.whatsapp.com/KMtL6c6cIwH6tG0L0lGypW",
    support_phone: "+91 97782 19793",
    support_email: "theknowledgeforumkerala@gmail.com",

    bypass_event_windows: false,
    maintenance_mode: false,
    reconduct_mode: false,

    study_material_url: "/PDF/TKFK%20Gandhi%20Jayanti%20Quiz%202026%20-%20Study%20Module.pdf",
    study_material_title: "Official TKFK Digital Poster Guidelines & Resources"
  });

  const [serverMeta, setServerMeta] = useState({
    dataMode: 'supabase',
    adminSecretConfigured: true,
    adminRole: 'super_admin',
    adminEmail: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/admin/settings?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const data = await res.json();
        if (res.ok && data.settings) {
          setSettings(data.settings);
          setServerMeta({
            dataMode: data.dataMode || 'supabase',
            adminSecretConfigured: Boolean(data.adminSecretConfigured),
            adminRole: data.adminUser?.role || 'super_admin',
            adminEmail: data.adminUser?.email || ''
          });
        }
      } catch (err: any) {
        setErrorMsg('Failed to load system settings from server');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      if (data.settings) setSettings(data.settings);
      setSuccessMsg('Master settings updated and applied across platform!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0ede8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#141412] text-white text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SUPER ADMIN MASTER CONTROLS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.03em]">System Configuration & Access Center</h1>
            <p className="text-xs sm:text-sm text-[#706e6a]">Live on/off switches, contest timeline, WhatsApp hubs, and global overrides</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium px-6 py-2.5 rounded-full text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#f0ede8] pb-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('switches')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'switches'
                ? 'bg-[#141412] text-white shadow-xs'
                : 'text-[#706e6a] hover:bg-white hover:text-[#141412]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Master Switches (Registration & Portal)</span>
          </button>

          <button
            onClick={() => setActiveTab('contest')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'contest'
                ? 'bg-[#141412] text-white shadow-xs'
                : 'text-[#706e6a] hover:bg-white hover:text-[#141412]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dates & Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-[#141412] text-white shadow-xs'
                : 'text-[#706e6a] hover:bg-white hover:text-[#141412]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Desks</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'study'
                ? 'bg-[#141412] text-white shadow-xs'
                : 'text-[#706e6a] hover:bg-white hover:text-[#141412]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Guidelines & Study Material</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#141412] text-white shadow-xs'
                : 'text-[#706e6a] hover:bg-white hover:text-[#141412]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Environment Status</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: MASTER SWITCHES (REGISTRATION, PORTAL, SUBMISSION)
        ======================================================== */}
        {activeTab === 'switches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CARD 1: REGISTRATION MASTER SWITCH */}
              <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#f0ede8] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        settings.registration_open ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <Power className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#141412]">Public Registration Switch</h3>
                        <p className="text-[11px] text-[#706e6a]">Enables or shuts down new user sign-ups on /register</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, registration_open: !settings.registration_open })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.registration_open ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.registration_open ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-xs">
                    <span className="font-semibold text-[#141412] block mb-1">Current Public Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      settings.registration_open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {settings.registration_open ? 'REGISTRATIONS OPEN' : 'REGISTRATIONS PAUSED (CLOSED)'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                      Custom Message Shown When Paused
                    </label>
                    <textarea
                      rows={3}
                      value={settings.registration_closed_message || ''}
                      onChange={(e) => setSettings({ ...settings, registration_closed_message: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-[#dedad3] text-xs focus:ring-2 focus:ring-[#ff6b35] outline-none"
                      placeholder="e.g. Registrations for the Digital Poster Creation Contest 2026 are temporarily closed by the administrator."
                    />
                    <p className="text-[11px] text-[#706e6a] mt-1">
                      Shown to users in the warning banner on /register when registrations are disabled.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2: PARTICIPANT PORTAL MASTER SWITCH */}
              <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#f0ede8] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        settings.portal_active ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#141412]">Participant Portal Switch</h3>
                        <p className="text-[11px] text-[#706e6a]">Enables or locks dashboard / login for participants</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, portal_active: !settings.portal_active })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.portal_active ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.portal_active ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-xs">
                    <span className="font-semibold text-[#141412] block mb-1">Current Portal Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      settings.portal_active ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {settings.portal_active ? 'PORTAL ACTIVE / ONLINE' : 'PORTAL UNDER MAINTENANCE (OFFLINE)'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                      Custom Maintenance Message Shown to Participants
                    </label>
                    <textarea
                      rows={3}
                      value={settings.portal_maintenance_message || ''}
                      onChange={(e) => setSettings({ ...settings, portal_maintenance_message: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-[#dedad3] text-xs focus:ring-2 focus:ring-[#ff6b35] outline-none"
                      placeholder="e.g. The participant portal is currently offline for scheduled maintenance. Please check back shortly."
                    />
                    <p className="text-[11px] text-[#706e6a] mt-1">
                      Rendered on /dashboard and /login for regular participants when offline. Admins can still bypass and log in.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 3: SUBMISSION PORTAL WINDOW */}
              <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0ede8] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      settings.submission_window_open ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {settings.submission_window_open ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#141412]">Poster Entry Submission Switch</h3>
                      <p className="text-[11px] text-[#706e6a]">Opens or locks poster artwork upload gate</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, submission_window_open: !settings.submission_window_open })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.submission_window_open ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.submission_window_open ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                    Submission Gateway Note
                  </label>
                  <input
                    type="text"
                    value={settings.submission_window_message || ''}
                    onChange={(e) => setSettings({ ...settings, submission_window_message: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-[#dedad3] text-xs focus:ring-2 focus:ring-[#ff6b35] outline-none"
                    placeholder="e.g. Official Submission Portal Open"
                  />
                </div>
              </div>

              {/* CARD 4: ADVANCED DATE GATING BYPASS & MAINTENANCE */}
              <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-4">
                <div className="border-b border-[#f0ede8] pb-3">
                  <h3 className="font-bold text-sm text-[#141412]">Emergency & Date Gating Overrides</h3>
                  <p className="text-[11px] text-[#706e6a]">Special privileges for testing or emergency maintenance</p>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#141412] block">Bypass Calendar Event Windows</span>
                      <span className="text-[11px] text-[#706e6a]">Permit registration regardless of official calendar open/close dates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.bypass_event_windows)}
                      onChange={(e) => setSettings({ ...settings, bypass_event_windows: e.target.checked })}
                      className="w-4 h-4 rounded text-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] cursor-pointer">
                    <div>
                      <span className="font-bold text-[#141412] block">Global Emergency Maintenance Mode</span>
                      <span className="text-[11px] text-[#706e6a]">Display platform-wide maintenance message</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.maintenance_mode)}
                      onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                      className="w-4 h-4 rounded text-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CONTEST DATES, TIMELINES & FEES
        ======================================================== */}
        {activeTab === 'contest' && (
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-6">
            <div className="border-b border-[#f0ede8] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#141412]">Contest Schedules, Deadlines & Pricing</h2>
              <p className="text-xs text-[#706e6a]">Modify dates and prize amounts dynamically across cards, ID passes, and footers without code changes</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Event / Contest Name
                </label>
                <input
                  type="text"
                  value={settings.event_name || ''}
                  onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Event Date Display (e.g. Card & ID Pass Date)
                </label>
                <input
                  type="text"
                  value={settings.event_date_display || ''}
                  onChange={(e) => setSettings({ ...settings, event_date_display: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="30 November 2026"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Registration Deadline Display
                </label>
                <input
                  type="text"
                  value={settings.registration_deadline || ''}
                  onChange={(e) => setSettings({ ...settings, registration_deadline: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="30 November 2026, 11:59 PM IST"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Results Release Date Display
                </label>
                <input
                  type="text"
                  value={settings.results_date_display || ''}
                  onChange={(e) => setSettings({ ...settings, results_date_display: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="5 December 2026, 10:00 AM IST"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  First Prize Display
                </label>
                <input
                  type="text"
                  value={settings.first_prize_display || ''}
                  onChange={(e) => setSettings({ ...settings, first_prize_display: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="₹7,001"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Registration Entry Fee (INR)
                </label>
                <input
                  type="number"
                  value={settings.registration_fee || 99}
                  onChange={(e) => setSettings({ ...settings, registration_fee: Number(e.target.value) })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="99"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: WHATSAPP DESKS & CONTACTS
        ======================================================== */}
        {activeTab === 'social' && (
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-6">
            <div className="border-b border-[#f0ede8] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#141412]">WhatsApp Groups & Support Desks</h2>
              <p className="text-xs text-[#706e6a]">Update official WhatsApp invite links in real time without code deployment</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#141412] uppercase tracking-wider">
                  Contest WhatsApp Group URL (Mandatory for Registered Participants)
                </label>
                <input
                  type="text"
                  value={settings.contest_whatsapp_url || ''}
                  onChange={(e) => setSettings({ ...settings, contest_whatsapp_url: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none font-mono text-[11px]"
                  placeholder="https://chat.whatsapp.com/KMtL6c6cIwH6tG0L0lGypW"
                />
                <p className="text-[11px] text-[#706e6a]">
                  Delivered inside Participant Dashboard and Registration Success pass card.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#141412] uppercase tracking-wider">
                  Community WhatsApp Group URL (Public Landing & Footer)
                </label>
                <input
                  type="text"
                  value={settings.community_whatsapp_url || ''}
                  onChange={(e) => setSettings({ ...settings, community_whatsapp_url: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none font-mono text-[11px]"
                  placeholder="https://chat.whatsapp.com/JiyAOAZApX3Ft4wKwBK14k"
                />
                <p className="text-[11px] text-[#706e6a]">
                  Rendered on website footer, team page, and social media desk for general visitors.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#141412] uppercase tracking-wider">
                  Support Helpline Phone
                </label>
                <input
                  type="text"
                  value={settings.support_phone || ''}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="+91 97782 19793"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#141412] uppercase tracking-wider">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="theknowledgeforumkerala@gmail.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: STUDY MATERIAL & RESOURCES
        ======================================================== */}
        {activeTab === 'study' && (
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#f0ede8] shadow-soft space-y-6">
            <div className="border-b border-[#f0ede8] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#141412]">Study Material & Creative Resources</h2>
              <p className="text-xs text-[#706e6a]">Configure links and assets for participant preparation</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Resource / PDF URL
                </label>
                <input
                  type="text"
                  value={settings.study_material_url || ''}
                  onChange={(e) => setSettings({ ...settings, study_material_url: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none font-mono text-[11px]"
                  placeholder="/study or https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-[#141412] uppercase tracking-wider mb-1.5">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={settings.study_material_title || ''}
                  onChange={(e) => setSettings({ ...settings, study_material_title: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[#dedad3] focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  placeholder="Official Contest Guidelines & Resources"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: SECURITY & ENVIRONMENT DIAGNOSTICS
        ======================================================== */}
        {activeTab === 'security' && (
          <div className="bg-[#141412] text-white p-6 sm:p-8 rounded-[28px] border border-[#262522] shadow-soft space-y-6">
            <div className="border-b border-[#262522] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Server & Security Environment</h2>
                <p className="text-xs text-[#9c9a97]">Super Admin runtime verification and live platform telemetry</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1f1e1b] text-emerald-400 border border-emerald-900">
                ROLE: {serverMeta.adminRole.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#1f1e1b] border border-[#262522] space-y-1">
                <span className="text-[#9c9a97] block">Database Execution Mode:</span>
                <span className="font-mono font-bold text-emerald-400 uppercase text-sm">{serverMeta.dataMode}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1f1e1b] border border-[#262522] space-y-1">
                <span className="text-[#9c9a97] block">Admin Session Security:</span>
                <span className="font-bold text-emerald-400">HMAC-SHA256 Signed HTTP-Only Cookie</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1f1e1b] border border-[#262522] space-y-1">
                <span className="text-[#9c9a97] block">Admin Secret Key Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] inline-block ${
                  serverMeta.adminSecretConfigured ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                }`}>
                  {serverMeta.adminSecretConfigured ? 'CONFIGURED ON SERVER' : 'DEFAULT'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#1f1e1b] border border-[#262522] space-y-1">
                <span className="text-[#9c9a97] block">Last Settings Sync:</span>
                <span className="font-mono text-white text-[11px]">
                  {settings.last_updated_at ? new Date(settings.last_updated_at).toLocaleString() : 'System Default'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#f0ede8] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#706e6a]">
            Clicking &ldquo;Save All Settings&rdquo; writes to the database and invalidates server caches immediately.
          </div>
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium px-8 py-3 rounded-full text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>

      </main>
    </div>
  );
}
