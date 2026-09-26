'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async (targetPage = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/participants?page=${targetPage}&limit=20&search=${encodeURIComponent(searchQuery)}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        if (data.pagination) {
          setPage(data.pagination.page);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      }
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchParticipants(1, search);
  }, [fetchParticipants, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants(1, search);
  };

  const handleExportCSV = () => {
    window.open(`/api/admin/participants?export=csv&search=${encodeURIComponent(search)}`, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Participant Management</h1>
            <p className="text-xs text-slate-500">Live search, filter and export participant records</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchParticipants(page, search)}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>Refresh Live Data</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV ({totalCount})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          
          <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by Name, Email, Phone, or Participant ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs">
              Search
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Participant ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email / Phone</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => {
                  const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-700">{p.participant_id || 'PENDING'}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">
                        <div>{p.email}</div>
                        <div className="text-[11px] text-slate-400">{p.phone}</div>
                      </td>
                      <td className="p-3 text-slate-700">{p.state}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                          reg?.payment_status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reg?.payment_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      {loading ? 'Loading participants...' : 'No matching participant records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>Showing page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchParticipants(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => fetchParticipants(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
