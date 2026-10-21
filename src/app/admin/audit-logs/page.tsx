'use client';

import React from 'react';
import { useStore } from '@/lib/store/useStore';
import { FileText, Shield, Clock } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useStore();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <span>System Audit Logs</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Immutable audit trail recording administrative decisions, payment approvals, result confirmations, and certificate releases.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-stone-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                    {log.action}
                  </span>
                  <span className="text-xs font-bold text-stone-900">{log.userName}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    ({log.userRole})
                  </span>
                </div>
                <p className="text-xs text-stone-600">{log.details}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
