'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Share2, Filter, RefreshCw, TrendingUp } from 'lucide-react';

interface ReferralStat {
  id: string;
  code: string;
  active: boolean;
  usage_count: number;
  total_clicks_registrations: number;
  confirmed_count: number;
  pending_count: number;
  conversion_rate: number;
  created_at: string;
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/admin/referrals';
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.referrals) {
          setReferrals(data.referrals);
        }
      }
    } catch {}
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReferrals();
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Referral Code Performance & Conversion Analytics</h1>
            <p className="text-xs text-slate-500">Track total signups, pending payments, confirmed conversions, and conversion rates</p>
          </div>
        </div>

        {/* Date Filter Bar */}
        <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Date Range Filter:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl">
            Apply Filter
          </button>
        </form>

        {/* Analytics Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total Registrations</th>
                  <th className="p-3 text-right">Pending Payments</th>
                  <th className="p-3 text-right">Confirmed Payments</th>
                  <th className="p-3 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{r.code}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">{r.total_clicks_registrations}</td>
                    <td className="p-3 text-right text-amber-700 font-bold">{r.pending_count}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{r.confirmed_count}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-700">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        <TrendingUp className="w-3 h-3 text-indigo-600" />
                        <span>{r.conversion_rate}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {referrals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      {loading ? 'Loading referral analytics...' : 'No referral codes found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
