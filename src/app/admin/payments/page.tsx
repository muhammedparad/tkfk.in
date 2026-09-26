'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PaymentStatus } from '@/types';
import { 
  CreditCard, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Edit3, 
  AlertTriangle 
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Manual Status Override Modal State
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<PaymentStatus>('SUCCESS');
  const [reason, setReason] = useState('');
  const [overridePaymentRef, setOverridePaymentRef] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        _t: Date.now().toString(),
        ...(search ? { search } : {})
      });

      const res = await fetch(`/api/admin/payments?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch {}
    setLoading(false);
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenOverrideModal = (reg: any) => {
    setSelectedReg(reg);
    setTargetStatus(reg.payment_status === 'SUCCESS' ? 'REFUNDED' : 'SUCCESS');
    setReason('');
    setOverridePaymentRef('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleExecuteStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    setUpdateError('');
    setUpdateSuccess('');

    if (!reason || reason.trim().length < 5) {
      setUpdateError('State Machine Guard: A detailed reason (minimum 5 characters) is required.');
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: selectedReg.id,
          status: targetStatus,
          reason: reason.trim(),
          paymentReference: overridePaymentRef.trim() || undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUpdateSuccess(`Payment status updated to '${targetStatus}' successfully.`);
        setTimeout(() => {
          setSelectedReg(null);
          loadData();
        }, 1200);
      } else {
        setUpdateError(data.error || 'Failed to update payment status.');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'Error connecting to admin payment engine.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Payment Transaction Audit Ledger</h1>
            <p className="text-xs text-slate-500">Server-side paginated payment transactions, verification states & manual overrides</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Phone, Email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="SUCCESS">SUCCESS (Paid)</option>
              <option value="PENDING">PENDING (Awaiting)</option>
              <option value="MANUAL_REVIEW">MANUAL_REVIEW (Flagged)</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Participant ID</th>
                  <th className="p-3">Name & Contact</th>
                  <th className="p-3">Payment Reference</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Registration Status</th>
                  <th className="p-3 text-right">State Machine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 font-semibold">
                      No payment records found matching the specified filters.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => {
                    const participant = Array.isArray(reg.participants) ? reg.participants[0] : reg.participants;
                    const pId = participant?.participant_id || 'PENDING';
                    const name = participant?.name || 'N/A';
                    const email = participant?.email || '';

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{pId}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{name}</div>
                          <div className="text-[10px] text-slate-500">{email}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {reg.payment_reference || <span className="text-slate-300">None</span>}
                        </td>
                        <td className="p-3 font-bold text-slate-900">₹{reg.amount || 99}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                            reg.payment_status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            reg.payment_status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            reg.payment_status === 'FAILED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            reg.payment_status === 'MANUAL_REVIEW' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {reg.payment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                            reg.registration_status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                            reg.registration_status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {reg.registration_status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenOverrideModal(reg)}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>Override</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div>
              Showing Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total records)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* State Machine Guard Override Modal */}
        {selectedReg && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Manual Payment State Override</span>
                </h3>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {updateError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                  {updateSuccess}
                </div>
              )}

              <form onSubmit={handleExecuteStatusChange} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                  <div>Registration ID: <strong>{selectedReg.id}</strong></div>
                  <div>Current Status: <strong className="text-emerald-700">{selectedReg.payment_status}</strong></div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Payment Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-900 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SUCCESS">SUCCESS (Confirm & Activate)</option>
                    <option value="MANUAL_REVIEW">MANUAL_REVIEW (Flag for Investigation)</option>
                    <option value="FAILED">FAILED (Cancel Registration)</option>
                    <option value="REFUNDED">REFUNDED (Revoke Registration)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mandatory Override Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter audit log justification for manual state transition (min 5 characters)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. pay_9812471 or manual bank ref"
                    value={overridePaymentRef}
                    onChange={(e) => setOverridePaymentRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReg(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Execute Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
