'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { Users, CreditCard, Clock, AlertTriangle, ShieldCheck, DollarSign, Share2 } from 'lucide-react';

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
  useEffect(() => {
    async function loadStats() {
      try {
        const sRes = await fetch('/api/admin/stats');
        if (sRes.ok) setStats(await sRes.json());
      } catch {}
    }
    loadStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Admin Analytics Dashboard</h1>
            <p className="text-xs text-slate-500">Registration, payment & quiz metrics overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            subtitle="All initiated submissions"
            icon={Users}
            color="indigo"
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
            title="Manual Review / Flagged"
            value={stats.manualReview}
            subtitle="Requires admin investigation"
            icon={AlertTriangle}
            color="rose"
          />
        </div>

        {/* Sub-grid: Quiz Engine Control */}
        <div className="grid grid-cols-1 gap-8">
          
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Quiz Engine Control</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active Live Sessions: <strong className="text-emerald-400 font-bold">{stats.activeQuizSessions}</strong>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Server timing is strictly enforced. Question correct options are kept confidential in server memory.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              TKFK Academic Control Center v1.0
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
