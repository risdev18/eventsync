'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Download,
  ArrowLeft,
  Camera,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export default function AttendanceScannerPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { events, tickets, attendance, checkInTicket, currentUser } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  const eventTickets = tickets.filter((t) => t.eventId === eventId);
  const eventAttendance = attendance.filter((a) => a.eventId === eventId);

  const [inputCode, setInputCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    participantName?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);

  if (!event) {
    return <div className="p-8 text-center text-xs text-stone-500">Event not found.</div>;
  }

  // Enforce branch organizer purview isolation
  const isAuthorized =
    currentUser.role === 'admin' ||
    event.organizerId === currentUser.id ||
    (currentUser.branchId && event.branchId === currentUser.branchId);

  if (!isAuthorized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">Branch Access Restricted</h2>
        <p className="text-xs text-stone-600">
          This event belongs to another branch ({event.branchId.replace('branch-', '').toUpperCase()}). You are only authorized to manage events for your branch.
        </p>
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
        >
          Return to My Dashboard
        </Link>
      </div>
    );
  }

  const handleManualCheckIn = (codeToVerify?: string) => {
    const code = codeToVerify || inputCode;
    if (!code.trim()) return;

    // Check if the ticket belongs to this event
    const ticket = tickets.find((t) => t.ticketCode.trim().toUpperCase() === code.trim().toUpperCase());
    if (ticket && ticket.eventId !== event.id) {
      setScanResult({
        success: false,
        message: `Cross-Event Scan Rejected! This ticket belongs to "${ticket.eventTitle}", not "${event.title}".`,
      });
      return;
    }

    const res = checkInTicket(code, currentUser.name);
    setScanResult({
      success: res.success,
      message: res.message,
      participantName: res.ticket?.participantName,
    });

    if (res.success) {
      setInputCode('');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Attendance ID', 'Participant Name', 'Email', 'Team Name', 'Timestamp', 'Verified By'];
    const rows = eventAttendance.map((a) => [
      a.id,
      `"${a.participantName}"`,
      a.participantEmail,
      `"${a.teamName || 'Solo'}"`,
      a.timestamp,
      `"${a.verifiedBy}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.slug}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkedInCount = eventTickets.filter((t) => t.isCheckedIn).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span>Attendance &amp; Check-In Scanner</span>
          </h1>
          <p className="text-xs text-stone-500">
            Event: <strong className="text-stone-800">{event.title}</strong> • Scan QR tickets at venue entrance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={eventAttendance.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-50 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Attendance CSV</span>
        </button>
      </div>

      {/* Real-time stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Total Tickets Issued</p>
          <h3 className="text-2xl font-black text-stone-900 mt-1">{eventTickets.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Checked-In Attendees</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{checkedInCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Turnout Rate</p>
          <h3 className="text-2xl font-black text-stone-900 mt-1">
            {eventTickets.length > 0 ? Math.round((checkedInCount / eventTickets.length) * 100) : 0}%
          </h3>
        </div>
      </div>

      {/* SCANNER CONSOLE */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Camera / Scanner Simulation */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Venue Camera Scanner
            </h3>

            <div className="relative aspect-video rounded-2xl bg-stone-950 border-2 border-dashed border-stone-700 flex flex-col items-center justify-center p-6 text-center text-stone-300 overflow-hidden">
              {cameraActive ? (
                <div className="space-y-3 animate-pulse">
                  <div className="w-40 h-40 border-2 border-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                      Align QR in box
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">Camera active &amp; scanning...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <QrCode className="w-12 h-12 text-stone-600 mx-auto" />
                  <p className="text-xs text-stone-400 max-w-xs">
                    Optical QR scanner standby. You can simulate camera scan with a demo ticket or enter code below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCameraActive(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Start Camera Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Quick Demo Scan Buttons for Testing */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Simulate Scan with Issued Tickets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {eventTickets.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleManualCheckIn(t.ticketCode)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-800 border border-stone-200 cursor-pointer"
                  >
                    Scan {t.ticketCode} ({t.participantName.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Manual Code Lookup & Result Banner */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Manual Ticket Lookup Fallback</h3>
            <p className="text-xs text-stone-500">
              In case of cracked phone screens or low brightness, enter the participant&apos;s ticket ID manually.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter ticket code (e.g. TKT-IT-84920-R1)..."
                className="flex-1 p-2.5 rounded-xl border border-stone-200 text-xs font-mono outline-none focus:border-emerald-600 uppercase"
              />
              <button
                onClick={() => handleManualCheckIn()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Check In
              </button>
            </div>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
                  scanResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scanResult.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Check-In Approved!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span>Check-In Rejected</span>
                    </>
                  )}
                </div>
                <p>{scanResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            Verified Attendance Records ({eventAttendance.length})
          </h3>
          <span className="text-xs text-stone-500">Auto-qualifies for participation certificates</span>
        </div>

        {eventAttendance.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            No participants checked in yet for this event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Checked-In Timestamp</th>
                  <th className="p-3">Verified By</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {eventAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{a.participantName}</td>
                    <td className="p-3 text-stone-500">{a.participantEmail}</td>
                    <td className="p-3 text-stone-700">{a.teamName || 'Solo'}</td>
                    <td className="p-3 text-stone-500">{new Date(a.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-stone-600">{a.verifiedBy}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified Attendance
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
