'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AuditLog } from '@/types';
import { FileText, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : (data.logs || []));
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Audit Logs</h1>
            <p className="text-xs text-slate-500">Immutable audit trail of administrative & system actions</p>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Total Logs: {logs.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No audit log events recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Admin User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 truncate max-w-[150px]">{log.admin_user_id || 'System'}</td>
                      <td className="p-3 font-bold text-emerald-700">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.entity_type}</td>
                      <td className="p-3 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">{log.entity_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
