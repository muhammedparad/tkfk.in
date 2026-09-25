'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ResultsReleaseConfig } from '@/types';
import { Trophy, Lock, Unlock, CheckCircle2, ShieldCheck, AlertCircle, Award, Timer } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  participant_id: string;
  score: number;
  time_taken_seconds: number;
}

export default function AdminResultsPage() {
  const [config, setConfig] = useState<ResultsReleaseConfig>({ published: false });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function load() {
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
    }
    load();
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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Results, Rankings & Winner Determination</h1>
          <p className="text-xs text-slate-500">Evaluates participant scores, completion speed, and awards the ₹9,999 First Prize</p>
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
                placeholder="e.g. Official results verification in progress by TKFK academic committee."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              {config.published ? (
                <button
                  onClick={() => handleToggleRelease(false)}
                  disabled={toggling}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unpublish Results</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleRelease(true)}
                  disabled={toggling}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all"
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
              {leaderboard.length > 0 ? (
                <div className="mt-3 p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-white text-base">{leaderboard[0].name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{leaderboard[0].participant_id}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-300 pt-1 border-t border-slate-700">
                    <span>Score: <strong className="text-amber-400">{leaderboard[0].score} / 50</strong></span>
                    <span>Time Taken: <strong className="text-emerald-400">{leaderboard[0].time_taken_seconds} seconds</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">No submitted quiz sessions recorded yet.</p>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Tie-Break Evaluation: 1) Total Score (DESC) → 2) Duration in Seconds (ASC) → 3) Earliest Submission.
            </div>
          </div>

        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Evaluated Rankings Leaderboard ({leaderboard.length} Participants)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Participant Name</th>
                  <th className="px-6 py-3.5">Participant ID</th>
                  <th className="px-6 py-3.5">Score (/ 50)</th>
                  <th className="px-6 py-3.5">Completion Time</th>
                  <th className="px-6 py-3.5">Award Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {leaderboard.map((item) => (
                  <tr key={item.rank} className={item.rank === 1 ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50/80'}>
                    <td className="px-6 py-4">
                      {item.rank === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">#1</span>
                      ) : (
                        <span>#{item.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700">{item.participant_id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.score} / 50</td>
                    <td className="px-6 py-4">{item.time_taken_seconds} seconds</td>
                    <td className="px-6 py-4">
                      {item.rank === 1 ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 text-[10px]">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>₹9,999 FIRST PRIZE WINNER</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Merit Certificate</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No quiz submissions found in database.
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
