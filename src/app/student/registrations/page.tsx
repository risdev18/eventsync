'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Calendar, Users, CreditCard, ShieldCheck, AlertCircle, Clock, Eye, QrCode } from 'lucide-react';

export default function StudentRegistrationsPage() {
  const { currentUser, registrations, events, payments } = useStore();
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const studentRegs = registrations.filter(
    (r) =>
      r.userId === currentUser.id ||
      r.members.some((m) => m.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">My Registrations & Payments</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review your registered teams, payment verification status, and submitted UPI references.
        </p>
      </div>

      {studentRegs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No registrations found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse active college hackathons and events to submit your registration.
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
          {studentRegs.map((reg) => {
            const event = events.find((e) => e.id === reg.eventId);
            const payment = payments.find((p) => p.registrationId === reg.id);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      Registration ID: {reg.id}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900">{event?.title || 'College Event'}</h3>
                    {event && (
                      <p className="text-xs font-semibold text-emerald-700">
                        Theme: {event.theme.themeName}
                      </p>
                    )}
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
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {reg.status === 'confirmed'
                        ? 'Confirmed'
                        : reg.status === 'submitted'
                        ? 'Under Verification'
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

                {/* Payment Breakdown */}
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

                  <div className="flex items-center gap-2">
                    {payment?.proofImageUrl && (
                      <button
                        onClick={() => setSelectedProofUrl(payment.proofImageUrl)}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Proof
                      </button>
                    )}

                    {reg.status === 'confirmed' && (
                      <Link
                        href="/student/tickets"
                        className="px-4 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Tickets
                      </Link>
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
    </div>
  );
}
