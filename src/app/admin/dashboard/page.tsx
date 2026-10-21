'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
  Users,
  Calendar,
  CreditCard,
  Award,
  QrCode,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const { users, events, registrations, certificates, auditLogs, branches } = useStore();

  // Prepare chart data
  const eventData = events.map((e) => ({
    name: e.title.split(' ')[0] + ' ' + (e.title.split(' ')[1] || ''),
    registered: e.registeredCount,
    capacity: e.capacity,
  }));

  const branchData = branches.map((b) => ({
    name: b.code,
    value: registrations.filter((r) => {
      const evt = events.find((e) => e.id === r.eventId);
      return evt?.branchId === b.id;
    }).length,
    color: b.accentColor,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Institution Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Dean &amp; Super Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-light max-w-xl">
            Platform-wide governance across academic departments, event approvals, financial verification audits, and institutional certificate authentication.
          </p>
        </div>

        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Manage All Events</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{users.length}</h3>
          <p className="text-[11px] text-stone-500 mt-1">Students &amp; Coordinators</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Active Events</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{events.length}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Across 5 branches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{registrations.length} Teams</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Combined entries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Issued Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-purple-600 mt-2">{certificates.length}</h3>
          <p className="text-[11px] text-stone-500 mt-1">Verifiable on platform</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registrations vs Capacity Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-stone-900">Event Registrations &amp; Capacity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="registered" fill="#059669" radius={[6, 6, 0, 0]} name="Registered" />
                <Bar dataKey="capacity" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Total Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Share Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-stone-900">Participation by Branch</h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={branchData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[10px]">
            {branchData.map((b) => (
              <span key={b.name} className="flex items-center gap-1 font-semibold text-stone-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                {b.name} ({b.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Recent Institutional Audit Logs</h3>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            View Full Audit Trail →
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-stone-900">{log.action}</p>
                <p className="text-stone-600 text-[11px]">{log.details}</p>
                <p className="text-stone-400 text-[10px]">
                  By: {log.userName} ({log.userRole})
                </p>
              </div>
              <span className="text-[11px] text-stone-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
