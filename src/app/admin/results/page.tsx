'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ResultsReleaseConfig } from '@/types';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Award, 
  Timer, 
  RotateCcw, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet,
  Users,
  Check,
  Clock
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  participant_id: string;
  phone?: string;
  email?: string;
  state?: string;
  raw_score?: number;
  score: number;
  percentage?: number;
  valid_correct?: number | null;
  valid_total?: number;
  version?: string;
  original_total_time?: number;
  q5_time?: number;
  q17_time?: number;
  q20_time?: number;
  adjusted_time_seconds?: number;
  time_taken_seconds: number;
  status: string;
  started_at?: string;
  submitted_at?: string;
}

export default function AdminResultsPage() {
  const [config, setConfig] = useState<ResultsReleaseConfig>({ published: false });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [note, setNote] = useState('');
  const [resettingId, setResettingId] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'TOP10' | 'NOT_ATTEMPTED'>('ALL');

  const loadResults = async () => {
    try {
      const res = await fetch('/api/admin/results');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          setNote(data.config.note || '');
        }
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleToggleRelease = async (targetPublished: boolean) => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: targetPublished, note })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Failed');
      setConfig({ published: targetPublished, note });
    } catch (err) {
      alert("Failed to update results release configuration");
    } finally {
      setToggling(false);
    }
  };

  const handleResetAttempt = async (item: LeaderboardEntry) => {
    if (!confirm(`Reset quiz attempt for ${item.name} (${item.participant_id})? This will delete their score (${item.score}/50) and allow them to take a fresh attempt.`)) {
      return;
    }

    setResettingId(item.participant_id);
    try {
      const res = await fetch('/api/admin/reset-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: item.participant_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        await loadResults();
      } else {
        alert(data.error || 'Failed to reset attempt');
      }
    } catch {
      alert('Error connecting to server');
    } finally {
      setResettingId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds >= 999999) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s (${seconds}s)`;
  };

  const formatIST = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    } catch {
      return isoStr;
    }
  };

  // Filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(item => {
      // Status filter
      if (statusFilter === 'SUBMITTED' && item.status !== 'SUBMITTED' && item.status !== 'EXPIRED') return false;
      if (statusFilter === 'TOP10' && (item.rank > 10 || (item.status !== 'SUBMITTED' && item.status !== 'EXPIRED'))) return false;
      if (statusFilter === 'NOT_ATTEMPTED' && (item.status === 'SUBMITTED' || item.status === 'EXPIRED')) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchId = item.participant_id?.toLowerCase().includes(q);
        const matchPhone = item.phone?.toLowerCase().includes(q);
        const matchState = item.state?.toLowerCase().includes(q);
        return matchName || matchId || matchPhone || matchState;
      }

      return true;
    });
  }, [leaderboard, statusFilter, searchQuery]);

  // Download full CSV
  const handleDownloadCSV = () => {
    if (!leaderboard || leaderboard.length === 0) {
      alert('No leaderboard data available to export.');
      return;
    }

    const headers = [
      'Rank',
      'Participant ID',
      'Full Name',
      'Phone',
      'Email',
      'State',
      'Normalized Score (/50)',
      'Percentage (%)',
      'Valid Raw Correct',
      'Valid Question Count',
      'Original Raw Score (/50)',
      'Scoring Version',
      'Original Total Time (Seconds)',
      'Original Total Time (MM:SS)',
      'Q5 Time (Seconds)',
      'Q17 Time (Seconds)',
      'Q20 Time (Seconds)',
      'Adjusted Time (Seconds)',
      'Adjusted Time (MM:SS)',
      'Status',
      'Started At (IST)',
      'Submitted At (IST)',
      'Award / Standing'
    ];

    const rows = leaderboard.map(r => {
      const isSub = r.status === 'SUBMITTED' || r.status === 'EXPIRED';
      const origTime = r.original_total_time !== undefined ? r.original_total_time : r.time_taken_seconds;
      const origTimeSec = (isSub && origTime < 999999) ? origTime : 'N/A';
      const origTimeFormatted = (isSub && origTime < 999999) ? `${Math.floor(origTime / 60)}m ${origTime % 60}s` : 'N/A';
      const adjTime = r.adjusted_time_seconds !== undefined ? r.adjusted_time_seconds : r.time_taken_seconds;
      const adjTimeSec = (isSub && adjTime < 999999) ? adjTime : 'N/A';
      const adjTimeFormatted = (isSub && adjTime < 999999) ? `${Math.floor(adjTime / 60)}m ${adjTime % 60}s` : 'N/A';
      const scoreVal = r.score >= 0 ? r.score.toFixed(2) : '0';
      const pct = r.percentage !== undefined ? `${r.percentage.toFixed(2)}%` : (r.score >= 0 ? `${((r.score / 50) * 100).toFixed(2)}%` : '0%');
      const validCorrectVal = r.valid_correct !== null && r.valid_correct !== undefined ? r.valid_correct : 'N/A';
      const validTotalVal = r.valid_total || 50;
      const rawVal = r.raw_score !== undefined && r.raw_score >= 0 ? r.raw_score : 'N/A';
      const versionVal = r.version || 'Standard 50 Qs';

      let award = 'Participant';
      if (r.rank === 1 && isSub) {
        award = 'FIRST PRIZE WINNER (₹9,999)';
      } else if (r.rank <= 3 && isSub) {
        award = 'Top 3 Distinction';
      } else if (r.rank <= 10 && isSub) {
        award = 'Top 10 Merit';
      } else if (isSub) {
        award = 'Certificate of Merit';
      } else if (r.status === 'IN_PROGRESS') {
        award = 'In Progress';
      } else {
        award = 'Not Attempted';
      }

      return [
        `"${r.rank}"`,
        `"${r.participant_id}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.phone || 'N/A'}"`,
        `"${r.email || 'N/A'}"`,
        `"${r.state || 'Kerala'}"`,
        `"${scoreVal}"`,
        `"${pct}"`,
        `"${validCorrectVal}"`,
        `"${validTotalVal}"`,
        `"${rawVal}"`,
        `"${versionVal}"`,
        `"${origTimeSec}"`,
        `"${origTimeFormatted}"`,
        `"${r.q5_time || 0}"`,
        `"${r.q17_time || 0}"`,
        `"${r.q20_time || 0}"`,
        `"${adjTimeSec}"`,
        `"${adjTimeFormatted}"`,
        `"${r.status}"`,
        `"${formatIST(r.started_at)}"`,
        `"${formatIST(r.submitted_at)}"`,
        `"${award}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TKFK_Gandhi_Quiz_2026_Full_Rankings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submittedCount = leaderboard.filter(item => item.status === 'SUBMITTED' || item.status === 'EXPIRED').length;
  const firstWinner = leaderboard.find(item => item.rank === 1 && (item.status === 'SUBMITTED' || item.status === 'EXPIRED'));

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-7xl">
        
        {/* Header with Title and Download Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Results, Full Rankings & Merit Leaderboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked sequentially: 1) Score (Highest to Lowest) → 2) Completion Time (Fastest duration) → 3) Earliest Submission
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              disabled={loading || leaderboard.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Rankings (CSV)</span>
            </button>
          </div>
        </div>

        {/* Top Section: Controlled Release & Winner Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controlled Release Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                config.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {config.published ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Public Visibility Status</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {config.published ? 'RESULTS PUBLISHED' : 'RESULTS LOCKED'}
                </h3>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Public Announcement Note
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Official results verification completed by TKFK academic committee."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              {config.published ? (
                <button
                  onClick={() => handleToggleRelease(false)}
                  disabled={toggling}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unpublish Results</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleRelease(true)}
                  disabled={toggling}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Publish Official Verified Results</span>
                </button>
              )}
            </div>
          </div>

          {/* Winner Card */}
          <div className="lg:col-span-6 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
                  Headline Award Winner
                </span>
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>

              <h3 className="text-xl font-extrabold text-amber-400">₹9,999 First Prize Winner</h3>
              {firstWinner ? (
                <div className="mt-3 p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-white text-base">{firstWinner.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{firstWinner.participant_id}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1 border-t border-slate-700">
                    <span>Score: <strong className="text-amber-400">{firstWinner.score} / 50 (100%)</strong></span>
                    <span>Time Taken: <strong className="text-emerald-400">{formatDuration(firstWinner.time_taken_seconds)}</strong></span>
                    <span>Submitted: <strong>{formatIST(firstWinner.submitted_at)}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">No submitted quiz sessions recorded yet.</p>
              )}
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Total Submitted: <strong className="text-white">{submittedCount}</strong> / {leaderboard.length} Candidates</span>
              <span className="text-amber-400/90 font-medium">Automatic Tie-Breaker Active</span>
            </div>
          </div>

        </div>

        {/* Leaderboard Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Controls Bar: Search & Filter Tabs */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/60">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Participants ({leaderboard.length})
              </button>

              <button
                onClick={() => setStatusFilter('SUBMITTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'SUBMITTED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Submitted / Completed ({submittedCount})
              </button>

              <button
                onClick={() => setStatusFilter('TOP10')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'TOP10'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Top 10 Merit
              </button>

              <button
                onClick={() => setStatusFilter('NOT_ATTEMPTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'NOT_ATTEMPTED'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Unsubmitted ({leaderboard.length - submittedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, phone, state..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Rank</th>
                  <th className="px-5 py-3.5">Participant Details</th>
                  <th className="px-5 py-3.5">Participant ID</th>
                  <th className="px-5 py-3.5">Score (/50)</th>
                  <th className="px-5 py-3.5">Time Taken</th>
                  <th className="px-5 py-3.5">Status & Submission Time</th>
                  <th className="px-5 py-3.5">Standing / Award</th>
                  <th className="px-5 py-3.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLeaderboard.map((item) => {
                  const isResetting = resettingId === item.participant_id;
                  const isSub = item.status === 'SUBMITTED' || item.status === 'EXPIRED';

                  return (
                    <tr 
                      key={item.participant_id} 
                      className={
                        item.rank === 1 && isSub
                          ? 'bg-amber-50/80 font-semibold' 
                          : item.rank <= 3 && isSub
                          ? 'bg-amber-50/30'
                          : 'hover:bg-slate-50/80'
                      }
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5">
                        {item.rank === 1 && isSub ? (
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                            #1
                          </span>
                        ) : item.rank <= 3 && isSub ? (
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-extrabold text-[11px]">
                            #{item.rank}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold">#{item.rank}</span>
                        )}
                      </td>

                      {/* Participant Details */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400 space-x-1">
                          <span>{item.phone || 'No phone'}</span>
                          {item.state && <span>• {item.state}</span>}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.participant_id}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-5 py-3.5">
                        {item.score >= 0 ? (
                          <div className="space-y-0.5">
                            <div>
                              <span className="font-extrabold text-slate-900 text-sm">{item.score.toFixed(2)}</span>
                              <span className="text-slate-400 text-xs"> / 50</span>
                              <span className="ml-1.5 inline-block text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                                {item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : `${((item.score / 50) * 100).toFixed(0)}%`}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {item.valid_correct !== null && item.valid_correct !== undefined ? (
                                <span>Valid: <strong>{item.valid_correct}</strong>/{item.valid_total || 50} Qs</span>
                              ) : null}
                              {item.version && item.version.includes('Malayalam') && (
                                <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                                  Malayalam (47 Qs)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not taken</span>
                        )}
                      </td>

                      {/* Time Taken */}
                      <td className="px-5 py-3.5">
                        {isSub && item.time_taken_seconds < 999999 ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800">
                              <span>{formatDuration(item.time_taken_seconds)}</span>
                            </div>
                            {item.version && item.version.includes('Malayalam') && item.original_total_time !== undefined && (
                              <div className="text-[10px] text-slate-500">
                                <span>Orig: {item.original_total_time}s</span>
                                {(item.q5_time || 0) + (item.q17_time || 0) + (item.q20_time || 0) > 0 && (
                                  <span className="ml-1 text-emerald-700 font-semibold">
                                    (-{((item.q5_time || 0) + (item.q17_time || 0) + (item.q20_time || 0))}s)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status & Submission Time */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'SUBMITTED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : item.status === 'EXPIRED'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            {item.status}
                          </span>
                          {item.submitted_at && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              {formatIST(item.submitted_at)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Award Standing */}
                      <td className="px-5 py-3.5">
                        {item.rank === 1 && isSub ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 text-[10px] shadow-2xs">
                            <Trophy className="w-3.5 h-3.5 text-amber-600" />
                            <span>₹9,999 FIRST PRIZE WINNER</span>
                          </span>
                        ) : item.rank <= 3 && isSub ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Top 3 Distinction</span>
                          </span>
                        ) : item.rank <= 10 && isSub ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Top 10 Merit</span>
                          </span>
                        ) : isSub ? (
                          <span className="text-slate-500 text-[11px]">Certificate of Merit</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Admin Action */}
                      <td className="px-5 py-3.5 text-right">
                        {isSub && (
                          <button
                            type="button"
                            onClick={() => handleResetAttempt(item)}
                            disabled={isResetting}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                            title="Reset Quiz Attempt and allow user to retry from scratch"
                          >
                            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin text-rose-600' : ''}`} />
                            <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}

                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No participants match the selected filter or search query.
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
