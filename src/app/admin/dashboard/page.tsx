'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { Users, CreditCard, Clock, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

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
        const sRes = await fetch(`/api/admin/stats?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (sRes.ok) setStats(await sRes.json());
      } catch {}
    }
    loadStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 space-y-8 overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-[#f0ede8] pb-6">
          <div>
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">
              ADMIN DESK
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.03em]">Admin Analytics Dashboard</h1>
            <p className="text-xs sm:text-sm text-[#706e6a]">Registration, payment verification & contest metrics overview</p>
          </div>
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

        {/* Sub-grid: Contest Engine Control & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#141412] text-white p-7 rounded-[28px] border border-[#262522] shadow-soft space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-medium text-base flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-[#ff6b35]" />
                <span>Quiz & Event Engine</span>
              </h3>
              <p className="text-xs text-[#9c9a97] leading-relaxed">
                Active Live Sessions: <strong className="text-white font-semibold">{stats.activeQuizSessions}</strong>
              </p>
              <p className="text-xs text-[#9c9a97] leading-relaxed">
                Event security and integrity rules enforced server-side. Evaluation rubrics preserved securely.
              </p>
            </div>
            <div className="pt-4 border-t border-[#262522] text-[11px] text-[#9c9a97]">
              TKFK Academic Control Center
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
                TESTING SANDBOX
              </span>
              <h3 className="font-medium text-lg text-[#141412]">
                Live Quiz Simulator
              </h3>
              <p className="text-xs text-[#706e6a] leading-relaxed">
                Test the complete 50-question proctored exam experience, webcam dock, timer, and score evaluation.
              </p>
            </div>
            
            <div className="pt-2">
              <a
                href="/admin/quiz-test"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium px-5 py-3 rounded-full text-xs shadow-2xs transition-all cursor-pointer"
              >
                <span>Launch Quiz Simulator</span>
                <ArrowRight className="w-4 h-4 text-[#ff6b35]" />
              </a>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
