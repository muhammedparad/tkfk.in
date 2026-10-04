'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ProctoringStreamItem, SessionStatus } from '@/types';
import { 
  Camera, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  Maximize2, 
  UserX, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  PlayCircle,
  LayoutGrid,
  Grid,
  Filter,
  Eye,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AdminLiveProctoringPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streams, setStreams] = useState<ProctoringStreamItem[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    activeLiveCount: 0,
    flaggedCount: 0,
    submittedCount: 0,
    terminatedCount: 0
  });

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'live' | 'flagged' | 'in_progress' | 'submitted' | 'terminated'>('all');
  const [gridColumns, setGridColumns] = useState<3 | 4 | 6>(4);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(3);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);

  // Inspector Modal State
  const [selectedStream, setSelectedStream] = useState<ProctoringStreamItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [customWarningText, setCustomWarningText] = useState('');
  const [actionStatusMsg, setActionStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch proctoring feeds from API
  const fetchProctoringFeeds = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/proctoring', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const incomingStreams: ProctoringStreamItem[] = data.streams || [];
        setStreams(incomingStreams);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        // Update selectedStream if modal is currently open
        if (selectedStream) {
          const updated = incomingStreams.find(s => s.participant_id === selectedStream.participant_id);
          if (updated) {
            setSelectedStream(updated);
          }
        }
      }
    } catch (err) {
      console.error('[Fetch Proctoring Feeds Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStream]);

  // Initial load
  useEffect(() => {
    fetchProctoringFeeds(false);
  }, []);

  // Polling Auto-Refresh
  useEffect(() => {
    if (!isAutoRefreshActive || autoRefreshSecs <= 0) return;

    const interval = setInterval(() => {
      fetchProctoringFeeds(true);
    }, autoRefreshSecs * 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshActive, autoRefreshSecs, fetchProctoringFeeds]);

  // Execute Proctor Actions (Warning or Force Terminate)
  const handleExecuteAction = async (action: 'warning' | 'terminate' | 'clear_warning', message?: string) => {
    if (!selectedStream) return;
    setActionLoading(true);
    setActionStatusMsg(null);

    try {
      const res = await fetch('/api/admin/proctoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          participantId: selectedStream.participant_id,
          sessionId: selectedStream.session_id,
          message: message || customWarningText,
          reason: message || customWarningText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionStatusMsg({ type: 'success', text: data.message });
        setCustomWarningText('');
        fetchProctoringFeeds(true);
      } else {
        setActionStatusMsg({ type: 'error', text: data.error || 'Action failed.' });
      }
    } catch (err) {
      setActionStatusMsg({ type: 'error', text: 'Network error executing action.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter streams based on search query and active tab
  const filteredStreams = streams.filter(s => {
    // Search Query Match
    const matchesSearch = 
      s.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.participant_public_id && s.participant_public_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.college && s.college.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter Tab Match
    if (filterTab === 'live') return s.is_live;
    if (filterTab === 'flagged') return s.warnings_count > 0 || !s.is_fullscreen || s.last_warning_message;
    if (filterTab === 'in_progress') return s.session_status === 'IN_PROGRESS' && !s.is_terminated;
    if (filterTab === 'submitted') return s.session_status === 'SUBMITTED';
    if (filterTab === 'terminated') return s.is_terminated || s.session_status === 'EXPIRED';

    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-7 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Surveillance CCTV Wall</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {streams.length} Total Monitored Streams
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Attending Participants Camera Watch</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Real-time multi-camera proctoring, live question progression, anti-cheat detection, and instant disciplinary actions.
            </p>
          </div>

          {/* Top Action & Refresh Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            
            {/* Auto Refresh Toggle Pill */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-2xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsAutoRefreshActive(!isAutoRefreshActive)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isAutoRefreshActive 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefreshActive ? 'animate-spin' : ''}`} />
                <span>{isAutoRefreshActive ? `Auto (${autoRefreshSecs}s)` : 'Paused'}</span>
              </button>

              {isAutoRefreshActive && (
                <div className="flex items-center gap-1 px-1.5">
                  {([2, 5, 10] as const).map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAutoRefreshSecs(sec)}
                      className={`px-2 py-1 rounded-lg text-[10px] transition-all ${
                        autoRefreshSecs === sec ? 'bg-slate-700 text-white font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={() => fetchProctoringFeeds(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>

            {/* Test Sandbox Trigger */}
            <Link
              href="/admin/quiz-test"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-purple-600/90 hover:bg-purple-600 active:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Camera Test</span>
            </Link>
          </div>

        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-3xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Live Camera Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-white">{metrics.activeLiveCount}</p>
            <p className="text-[10px] text-slate-400">Webcams streaming live</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Total Monitored</span>
            <p className="text-2xl font-black text-white">{metrics.total}</p>
            <p className="text-[10px] text-slate-400">All registered attendees</p>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-3xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Flagged / Warnings</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300">{metrics.flaggedCount}</p>
            <p className="text-[10px] text-slate-400">Violations detected</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">Completed Submissions</span>
            <p className="text-2xl font-black text-teal-300">{metrics.submittedCount}</p>
            <p className="text-[10px] text-slate-400">Finished attempts</p>
          </div>

          <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-3xl space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Terminated / DQ</span>
            <p className="text-2xl font-black text-rose-400">{metrics.terminatedCount}</p>
            <p className="text-[10px] text-slate-400">Disqualified participants</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by participant name, TKFK26 ID, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: `All (${streams.length})` },
              { key: 'live', label: `🟢 Live Active (${metrics.activeLiveCount})` },
              { key: 'flagged', label: `⚠️ Flagged (${metrics.flaggedCount})` },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'submitted', label: `✅ Submitted (${metrics.submittedCount})` },
              { key: 'terminated', label: `🛑 Terminated (${metrics.terminatedCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Layout Density Switcher */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded-xl transition-all ${
                gridColumns === 3 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Large 3-column view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridColumns(4)}
              className={`p-1.5 rounded-xl transition-all ${
                gridColumns === 4 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Standard 4-column view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Live CCTV Video Wall Grid */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">Initializing Live CCTV Stream Feeds...</p>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="p-16 text-center space-y-4 bg-slate-900/50 rounded-3xl border border-slate-800 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Live Streams Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchQuery || filterTab !== 'all'
                  ? 'No participants match the selected filter criteria.'
                  : 'Participants who enter the quiz portal with their camera active will automatically appear on this CCTV video wall.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin/quiz-test"
                target="_blank"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Launch Camera Sandbox Attempt</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            gridColumns === 3 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredStreams.map((stream) => {
              const mins = Math.floor(stream.master_time_left_seconds / 60);
              const secs = stream.master_time_left_seconds % 60;
              const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              const hasWarnings = stream.warnings_count > 0 || stream.last_warning_message;
              const isTerminated = stream.is_terminated || stream.session_status === 'EXPIRED';
              const isSubmitted = stream.session_status === 'SUBMITTED';

              return (
                <div 
                  key={stream.participant_id}
                  className={`group relative bg-slate-900 rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between ${
                    isTerminated 
                      ? 'border-rose-700/80 ring-1 ring-rose-600/50' 
                      : hasWarnings 
                      ? 'border-amber-600/80 ring-1 ring-amber-500/50' 
                      : stream.is_live 
                      ? 'border-emerald-600/60 ring-1 ring-emerald-500/30' 
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Camera Stream Viewport */}
                  <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                    
                    {stream.image_data ? (
                      <img
                        src={stream.image_data}
                        alt={`Live feed of ${stream.participant_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 space-y-1.5 text-slate-500">
                        <Camera className="w-7 h-7 mx-auto text-slate-600" />
                        <span className="text-[11px] block font-medium">Camera Snapshot Syncing...</span>
                      </div>
                    )}

                    {/* Top Left Live Pulse Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {stream.is_live ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-extrabold shadow-md backdrop-blur-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>LIVE</span>
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-950/90 border border-teal-500/60 text-teal-300 text-[10px] font-extrabold shadow-md backdrop-blur-xs">
                          <span>SUBMITTED</span>
                        </span>
                      ) : isTerminated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[10px] font-extrabold shadow-md backdrop-blur-xs">
                          <span>TERMINATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 text-[10px] font-bold shadow-md backdrop-blur-xs">
                          <span>STANDBY</span>
                        </span>
                      )}

                      {!stream.is_fullscreen && !isTerminated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 text-[9px] font-extrabold shadow-md animate-pulse">
                          <span>OUT OF FULLSCREEN</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right Zoom / Inspect Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedStream(stream)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700/80 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Inspect live participant camera feed"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom Semi-transparent Gradient Overlay with Public ID */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-2.5 pt-6 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-white truncate max-w-[150px]">
                        {stream.participant_name}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-[10px] bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
                        {stream.participant_public_id || 'TKFK26'}
                      </span>
                    </div>

                  </div>

                  {/* Card Body & Telemetry Details */}
                  <div className="p-3.5 space-y-3">
                    
                    {/* College & Location */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[160px] font-medium" title={stream.college || ''}>
                        {stream.college || 'General Category'}
                      </span>
                      <span className="font-semibold text-slate-500">
                        {stream.state || 'Kerala'}
                      </span>
                    </div>

                    {/* Progress Metrics Bar */}
                    <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-300">
                          Q{stream.current_question_index + 1} of {stream.total_questions}
                        </span>
                        <span className="text-emerald-400 font-mono">
                          {stream.total_answered}/{stream.total_questions} Ans
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(stream.total_answered / (stream.total_questions || 50)) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{timeFormatted} left</span>
                        </span>
                        <span>{Math.round((stream.total_answered / (stream.total_questions || 50)) * 100)}% done</span>
                      </div>
                    </div>

                    {/* Violations Warning Bar */}
                    {hasWarnings && !isTerminated && (
                      <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-300 text-[10px] flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">
                          {stream.last_warning_message || `${stream.warnings_count} warning(s) logged`}
                        </span>
                      </div>
                    )}

                    {isTerminated && (
                      <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 text-[10px] flex items-center gap-1.5 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">
                          {stream.termination_reason || 'Attempt terminated'}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Action Buttons Footer */}
                  <div className="p-3 pt-0 border-t border-slate-800/80 mt-1 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStream(stream)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Feed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStream(stream);
                        setCustomWarningText('Please ensure your face is well-lit and only you are visible on camera.');
                      }}
                      className="p-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700 transition-all cursor-pointer"
                      title="Issue direct proctor warning"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Enlarged HD Inspector & Action Modal */}
      {selectedStream && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 max-w-4xl w-full rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedStream.participant_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-extrabold font-mono">
                      {selectedStream.participant_public_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedStream.college || 'General'} • {selectedStream.state || 'Kerala'} • Session: {selectedStream.session_id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStream(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns (Left: Video feed, Right: Controls & Telemetry) */}
            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Enlarged Video Snapshot (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                  {selectedStream.image_data ? (
                    <img
                      src={selectedStream.image_data}
                      alt={selectedStream.participant_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-500 space-y-2">
                      <Camera className="w-10 h-10 mx-auto text-slate-600" />
                      <span className="text-xs block">Camera Feed Offline / Reconnecting</span>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {selectedStream.is_live && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-extrabold backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE CAMERA BROADCAST</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Status Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Current Question</span>
                    <strong className="text-white">Q{selectedStream.current_question_index + 1} / {selectedStream.total_questions}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Answered</span>
                    <strong className="text-emerald-400">{selectedStream.total_answered} / {selectedStream.total_questions}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Time Remaining</span>
                    <strong className="text-amber-400">
                      {Math.floor(selectedStream.master_time_left_seconds / 60)}:{(selectedStream.master_time_left_seconds % 60).toString().padStart(2, '0')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Proctor Controls & Disciplinary Actions (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {actionStatusMsg && (
                  <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    actionStatusMsg.type === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                      : 'bg-rose-950/80 border border-rose-600 text-rose-200'
                  }`}>
                    {actionStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{actionStatusMsg.text}</span>
                  </div>
                )}

                {/* Direct Warning Console */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Send Proctor Warning to Screen</span>
                  </span>
                  
                  <div className="space-y-1.5">
                    {[
                      'Ensure only registered participant is visible on camera frame.',
                      'Warning: Return to mandatory fullscreen mode immediately.',
                      'Keep your face clearly visible and well-lit at all times.',
                      'No talking or looking away from exam window.'
                    ].map((templateText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExecuteAction('warning', templateText)}
                        disabled={actionLoading}
                        className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-all cursor-pointer font-medium"
                      >
                        ⚡ {templateText}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type custom warning message..."
                      value={customWarningText}
                      onChange={(e) => setCustomWarningText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleExecuteAction('warning', customWarningText)}
                      disabled={actionLoading || !customWarningText.trim()}
                      className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>

                {/* Force Terminate Option */}
                <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-900/80 space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    <span>Strict Disqualification Action</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Immediately terminate this participant&apos;s attempt, lock answering, and finalize with zero further score progression.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to FORCE TERMINATE and disqualify ${selectedStream.participant_name}'s attempt?`)) {
                        handleExecuteAction('terminate', 'Attempt terminated by proctor administrator due to verified rule violations.');
                      }
                    }}
                    disabled={actionLoading}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Force Terminate & Disqualify Attempt</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>Last Heartbeat: {new Date(selectedStream.last_heartbeat).toLocaleTimeString()}</span>
              <button
                type="button"
                onClick={() => setSelectedStream(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
