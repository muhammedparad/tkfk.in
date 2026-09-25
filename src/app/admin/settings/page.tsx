'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Settings, Save, CheckCircle2, ShieldCheck, FileText, Link2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    dataMode: 'mock',
    adminSecretConfigured: false,
    studyMaterial: {
      url: '/study',
      type: 'resource_link',
      title: 'Official Gandhi Knowledge Challenge 2026 Preparation Modules'
    }
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (res.ok) {
          setSettings(data);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyMaterial: settings.studyMaterial })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Admin System Settings</h1>
          <p className="text-xs text-slate-500">Configure participant resources, database mode & security settings</p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Study Material Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Link2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Study Material Resource Configuration</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Resource URL / Link (PDF or Google Drive)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /study or https://drive.google.com/..."
                  value={settings.studyMaterial.url}
                  onChange={(e) => setSettings({
                    ...settings,
                    studyMaterial: { ...settings.studyMaterial, url: e.target.value }
                  })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Configurable resource link for Card 1 on the registration success and participant dashboard pages.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={settings.studyMaterial.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    studyMaterial: { ...settings.studyMaterial, title: e.target.value }
                  })}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Environment Status */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Server Security Environment Status</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Database Execution Mode:</span>
                <span className="font-mono font-bold text-emerald-400 uppercase">{settings.dataMode}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Admin Secret Key Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  settings.adminSecretConfigured ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                }`}>
                  {settings.adminSecretConfigured ? 'CONFIGURED ON SERVER' : 'DEFAULT / MISSING'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Session Cookie Security:</span>
                <span className="font-bold text-emerald-400">HTTP-ONLY (SameSite=Lax)</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
