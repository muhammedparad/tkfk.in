'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { 
  Search, 
  Download, 
  RefreshCw, 
  RotateCcw, 
  Check, 
  Zap, 
  Ban, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert,
  Filter
} from 'lucide-react';

interface Participant {
  id: string;
  participant_id?: string | null;
  name: string;
  email: string;
  phone: string;
  state?: string | null;
  city?: string | null;
  college?: string | null;
  referral_code?: string | null;
  status?: string | null;
  created_at: string;
  registrations?: any;
}

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'BLOCKED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Modal State
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    state: '',
    city: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete Confirmation State
  const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const fetchParticipants = useCallback(async (targetPage = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/participants?page=${targetPage}&limit=20&search=${encodeURIComponent(searchQuery)}&status=${status}&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        if (data.pagination) {
          setPage(data.pagination.page);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
      } else {
        const err = await res.json();
        showFeedback(err.error || 'Failed to fetch participants', 'error');
      }
    } catch {
      showFeedback('Network error while fetching participants', 'error');
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchParticipants(1, search, statusFilter);
  }, [fetchParticipants, search, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants(1, search, statusFilter);
  };

  const handleExportCSV = () => {
    window.open(`/api/admin/participants?export=csv&search=${encodeURIComponent(search)}&status=${statusFilter}`, '_blank');
  };

  // 1. Reset Quiz Attempt
  const handleResetAttempt = async (p: Participant) => {
    const ident = p.participant_id || p.id;
    if (!confirm(`Are you sure you want to reset the quiz attempt for ${p.name} (${ident})?\n\nThis will clear any completed or ongoing quiz answers and allow them to take the test fresh.`)) {
      return;
    }

    setActionLoadingId(p.id);
    try {
      const res = await fetch('/api/admin/reset-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ident })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccessId(p.id);
        setTimeout(() => setResetSuccessId(null), 3500);
        showFeedback(`Quiz attempt successfully reset for ${p.name}`);
      } else {
        showFeedback(data.error || 'Failed to reset quiz attempt', 'error');
      }
    } catch {
      showFeedback('Error connecting to server to reset attempt', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Manual Super Admin Activation
  const handleManualActivate = async (p: Participant) => {
    if (!confirm(`⚡ SUPER ADMIN ACTIVATION:\n\nManually confirm registration and issue an official TKFK26 ID for ${p.name}?\n\nThis will mark their payment as SUCCESS and grant immediate portal access.`)) {
      return;
    }

    setActionLoadingId(p.id);
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: p.id,
          action: 'ACTIVATE',
          paymentReference: `MANUAL_ADMIN_${Date.now()}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(data.message || `Activated ${p.name}`);
        fetchParticipants(page, search, statusFilter);
      } else {
        showFeedback(data.error || 'Failed to activate participant', 'error');
      }
    } catch {
      showFeedback('Error during activation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Block / Unblock Participant
  const handleToggleBlock = async (p: Participant) => {
    const isCurrentlyBlocked = p.status === 'BLOCKED';
    const action = isCurrentlyBlocked ? 'UNBLOCK' : 'BLOCK';
    const confirmPrompt = isCurrentlyBlocked
      ? `Re-activate participant ${p.name}? They will be permitted to log in and take the quiz.`
      : `⚠️ Suspend / Block participant ${p.name}?\n\nThey will be immediately blocked from portal access and quiz submission.`;

    if (!confirm(confirmPrompt)) return;

    setActionLoadingId(p.id);
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: p.id,
          action
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(data.message || (isCurrentlyBlocked ? 'Participant unblocked' : 'Participant blocked'));
        fetchParticipants(page, search, statusFilter);
      } else {
        showFeedback(data.error || 'Operation failed', 'error');
      }
    } catch {
      showFeedback('Error connecting to server', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Edit Modal Open
  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setEditForm({
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      college: p.college || '',
      state: p.state || '',
      city: p.city || ''
    });
  };

  // 4b. Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: editingParticipant.id,
          updates: {
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            college: editForm.college,
            state: editForm.state,
            city: editForm.city
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(`Participant ${editForm.name} updated successfully`);
        setEditingParticipant(null);
        fetchParticipants(page, search, statusFilter);
      } else {
        showFeedback(data.error || 'Failed to update participant', 'error');
      }
    } catch {
      showFeedback('Network error while saving changes', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // 5. Delete Participant
  const openDeleteModal = (p: Participant) => {
    setDeletingParticipant(p);
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingParticipant) return;
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type "DELETE" exactly in the confirmation box to proceed.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/participants?id=${deletingParticipant.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(`Participant ${deletingParticipant.name} and all related records deleted permanently.`);
        setDeletingParticipant(null);
        fetchParticipants(page, search, statusFilter);
      } else {
        showFeedback(data.error || 'Failed to delete participant', 'error');
      }
    } catch {
      showFeedback('Network error during deletion', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Participant Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Full Control
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live search, manual activation, edit records, block/unblock, attempt reset & permanent deletion
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchParticipants(page, search, statusFilter)}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
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

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:bg-black/5 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Status Filter Tabs & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Confirmed / Paid
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                Pending Payment
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('BLOCKED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'BLOCKED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-700'
                }`}
              >
                Suspended / Blocked
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by Name, Email, Phone, TKFK26 ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchParticipants(1, '', statusFilter); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs cursor-pointer"
                  title="Clear search"
                >
                  Clear
                </button>
              )}
            </form>

          </div>

          {/* Participants Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Participant ID</th>
                  <th className="p-3.5">Participant Info</th>
                  <th className="p-3.5">Institution / State</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => {
                  const reg = Array.isArray(p.registrations) ? p.registrations[0] : p.registrations;
                  const isConfirmed = reg?.payment_status === 'SUCCESS' || !!p.participant_id;
                  const isBlocked = p.status === 'BLOCKED';
                  const isRowLoading = actionLoadingId === p.id;
                  const isResetOk = resetSuccessId === p.id;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isBlocked ? 'bg-rose-50/30' : ''}`}>
                      
                      {/* ID */}
                      <td className="p-3.5">
                        {p.participant_id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 text-[11px]">
                              {p.participant_id}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Awaiting ID
                          </span>
                        )}
                      </td>

                      {/* Info */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isBlocked && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] font-medium">{p.email}</div>
                        <div className="text-slate-400 font-mono text-[10px]">{p.phone}</div>
                      </td>

                      {/* Institution / State */}
                      <td className="p-3.5 text-slate-600">
                        <div className="font-medium text-slate-800 line-clamp-1">{p.college || '—'}</div>
                        <div className="text-[11px] text-slate-500">{[p.city, p.state].filter(Boolean).join(', ') || '—'}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isBlocked 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reg?.payment_status || (p.participant_id ? 'CONFIRMED' : 'PENDING')}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Super Admin Action Buttons */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* 1. Manual Activation (if pending or no ID) */}
                        {!p.participant_id && (
                          <button
                            type="button"
                            onClick={() => handleManualActivate(p)}
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            title="Manually confirm payment and allocate official TKFK26 ID"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Activate</span>
                          </button>
                        )}

                        {/* 2. Block / Unblock */}
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(p)}
                          disabled={isRowLoading}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            isBlocked
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-300'
                          }`}
                          title={isBlocked ? 'Reinstate participant' : 'Suspend / Block participant'}
                        >
                          {isBlocked ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>

                        {/* 3. Edit Details */}
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          disabled={isRowLoading}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                          title="Edit participant profile"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        {/* 4. Reset Attempt */}
                        <button
                          type="button"
                          onClick={() => handleResetAttempt(p)}
                          disabled={isRowLoading}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                            isResetOk
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-300'
                          }`}
                          title="Reset Quiz Attempt and permit re-taking test"
                        >
                          {isResetOk ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Reset OK</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className={`w-3 h-3 ${isRowLoading ? 'animate-spin' : ''}`} />
                              <span>Reset</span>
                            </>
                          )}
                        </button>

                        {/* 5. Delete Participant */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(p)}
                          disabled={isRowLoading}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all cursor-pointer disabled:opacity-50"
                          title="Permanently delete participant and purge all data"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                      </td>
                    </tr>
                  );
                })}

                {participants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Loading participants from database...</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-slate-600">No matching participant records found.</p>
                          <p className="text-[11px] text-slate-400">Try adjusting your search criteria or switching the filter tab.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Showing page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> ({totalCount} total participants)</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchParticipants(page - 1, search, statusFilter)}
                disabled={page <= 1 || loading}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                Previous
              </button>
              <button
                onClick={() => fetchParticipants(page + 1, search, statusFilter)}
                disabled={page >= totalPages || loading}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Modal: Edit Participant */}
        {editingParticipant && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Edit Participant Record</h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {editingParticipant.participant_id || editingParticipant.id}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingParticipant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Institution / College</label>
                  <input
                    type="text"
                    value={editForm.college}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingParticipant(null)}
                    disabled={editSaving}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {editSaving ? 'Saving Changes...' : 'Save Updates'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Modal: Super Admin Permanent Deletion */}
        {deletingParticipant && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-rose-900 text-base">Permanently Delete Participant?</h3>
                  <p className="text-[11px] text-slate-500">Super Admin Destructive Action</p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs space-y-1.5">
                <p className="font-bold">You are about to delete:</p>
                <p className="font-mono text-xs font-bold text-slate-900 bg-white p-2 rounded border border-rose-200">
                  {deletingParticipant.name} ({deletingParticipant.participant_id || deletingParticipant.email})
                </p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  ⚠️ This will cascade-delete all registrations, quiz attempts, answers, proctoring snapshots, and certificates for this participant. This cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700">
                  Type <span className="font-mono text-rose-600 font-extrabold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase tracking-wider focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingParticipant(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}