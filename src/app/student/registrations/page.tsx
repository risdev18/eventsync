'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { formatDate } from '@/lib/utils/dateFormat';
import {
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  QrCode,
  XCircle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

type TabFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function StudentRegistrationsPage() {
  const { currentUser, registrations, events, payments, cancelRegistration, resetStudentRegistrations } = useStore();
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [cancellingRegId, setCancellingRegId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const studentRegs = registrations.filter(
    (r) =>
      r.userId === currentUser.id ||
      r.members.some((m) => m.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const now = new Date();

  // Tab filtering logic
  const filteredRegs = studentRegs.filter((reg) => {
    const event = events.find((e) => e.id === reg.eventId);
    if (activeTab === 'cancelled') return reg.status === 'cancelled';
    if (activeTab === 'upcoming') {
      if (reg.status === 'cancelled') return false;
      return event ? new Date(event.startDate) >= now : true;
    }
    if (activeTab === 'completed') {
      if (reg.status === 'cancelled') return false;
      return event ? new Date(event.endDate) < now || event.status === 'completed' : false;
    }
    return true; // 'all'
  });

  const tabCounts = {
    all: studentRegs.length,
    upcoming: studentRegs.filter((r) => {
      const e = events.find((ev) => ev.id === r.eventId);
      return r.status !== 'cancelled' && (e ? new Date(e.startDate) >= now : true);
    }).length,
    completed: studentRegs.filter((r) => {
      const e = events.find((ev) => ev.id === r.eventId);
      return r.status !== 'cancelled' && e && (new Date(e.endDate) < now || e.status === 'completed');
    }).length,
    cancelled: studentRegs.filter((r) => r.status === 'cancelled').length,
  };

  const handleConfirmCancel = () => {
    if (!cancellingRegId) return;
    try {
      const res = cancelRegistration(cancellingRegId, cancelReason.trim() || undefined);
      setFeedbackMsg({ type: 'success', text: res.message });
      setCancellingRegId(null);
      setCancelReason('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel registration';
      setFeedbackMsg({ type: 'error', text: message });
    }
  };

  const targetCancelReg = cancellingRegId
    ? studentRegs.find((r) => r.id === cancellingRegId)
    : null;
  const targetCancelEvent = targetCancelReg
    ? events.find((e) => e.id === targetCancelReg.eventId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">My Registrations & Events</h1>
          <p className="text-xs text-stone-500 mt-1">
            Track confirmed entries, manage team members, view payment verification, or cancel registrations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {studentRegs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all your demo registrations to start 100% fresh for the live demo?')) {
                  const res = resetStudentRegistrations();
                  setFeedbackMsg({ type: 'success', text: res.message });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
              title="Clears all registrations so you can register fresh in front of the evaluator"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset for Live Demo (0 Events)</span>
            </button>
          )}
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Discover More Events
          </Link>
        </div>
      </div>

      {/* Global Toast / Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All Registrations' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredRegs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">
            {activeTab === 'cancelled'
              ? 'No cancelled registrations'
              : activeTab === 'upcoming'
              ? 'No upcoming events registered'
              : activeTab === 'completed'
              ? 'No completed events yet'
              : 'No registrations found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'Browse active college hackathons, seminars, and workshops to submit your registration.'
              : 'Switch tabs or browse events to enroll.'}
          </p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegs.map((reg) => {
            const event = events.find((e) => e.id === reg.eventId);
            const payment = payments.find((p) => p.registrationId === reg.id);
            const isCancelled = reg.status === 'cancelled';

            return (
              <div
                key={reg.id}
                className={`bg-white rounded-3xl border p-6 shadow-sm space-y-5 transition-all ${
                  isCancelled
                    ? 'border-stone-200 bg-stone-50/70 opacity-80'
                    : 'border-stone-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Registration ID: {reg.id}
                      </span>
                      {isCancelled && (
                        <span className="text-[10px] font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                          Seats Released
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                      {event?.title || 'College Event'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                      {event && (
                        <span className="font-semibold text-emerald-700">
                          Theme: {event.theme.themeName}
                        </span>
                      )}
                      {event && (
                        <span suppressHydrationWarning>
                          📅 {formatDate(event.startDate)} • {event.venue}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        reg.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.status === 'submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : reg.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : reg.status === 'cancelled'
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {reg.status === 'confirmed'
                        ? 'Confirmed'
                        : reg.status === 'submitted'
                        ? 'Under Verification'
                        : reg.status === 'cancelled'
                        ? 'Cancelled'
                        : reg.status}
                    </span>
                  </div>
                </div>

                {/* Team & Members */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Team Composition: {reg.teamName || 'Individual'} ({reg.teamSize} Participants)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {reg.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-stone-900">{m.name}</p>
                          {m.isLeader && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-stone-500 truncate text-[11px]">{m.email}</p>
                        <p className="text-stone-400 text-[10px]">
                          USN: {m.usn} • {m.branch}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Breakdown & Actions */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-stone-800">Payment Status:</span>
                      <span className="capitalize font-semibold text-stone-700">
                        {reg.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    {payment && (
                      <p className="text-stone-500 text-[11px]">
                        Transaction Ref / UTR:{' '}
                        <strong className="text-stone-800 font-mono">{payment.transactionRef}</strong>{' '}
                        • Amount: <strong>₹{payment.amount}</strong>
                      </p>
                    )}

                    {payment?.rejectionReason && (
                      <p className="text-red-600 font-medium text-[11px]">
                        Rejection Note: {payment.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {payment?.proofImageUrl && (
                      <button
                        onClick={() => setSelectedProofUrl(payment.proofImageUrl)}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Proof
                      </button>
                    )}

                    {!isCancelled && reg.status === 'confirmed' && (
                      <Link
                        href="/student/tickets"
                        className="px-4 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Tickets
                      </Link>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => setCancellingRegId(reg.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Registration
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-stone-900">Submitted Payment Screenshot</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofUrl}
              alt="Payment proof"
              className="w-full h-64 object-contain bg-stone-100 rounded-xl"
            />
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="w-full py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingRegId && targetCancelReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-stone-200 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Cancel Registration?</h3>
                <p className="text-xs text-stone-500 font-mono">
                  {targetCancelReg.id} • {targetCancelEvent?.title || 'College Event'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              Are you sure you want to cancel your registration? Your reserved seat quota will be
              released back to other students, and any active QR entry tickets will be revoked.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict with exams, personal reason..."
                rows={2}
                className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancellingRegId(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Keep Registration
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
