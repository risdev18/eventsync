'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

export default function OrganizerPaymentsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { events, payments, verifyPayment, rejectPayment, currentUser } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  const eventPayments = payments.filter((p) => p.eventId === eventId);

  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

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
          This event belongs to another branch ({event.branchId.replace('branch-', '').toUpperCase()}). You are only authorized to manage payments for your branch.
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

  const pendingList = eventPayments.filter((p) => p.status === 'submitted');
  const verifiedList = eventPayments.filter((p) => p.status === 'verified');
  const rejectedList = eventPayments.filter((p) => p.status === 'rejected');

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
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>UPI Payment Verification Hub</span>
          </h1>
          <p className="text-xs text-stone-500">
            Event: <strong className="text-stone-800">{event.title}</strong> • Fee: ₹{event.paymentSettings.feeAmount} ({event.paymentSettings.feeType})
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          {pendingList.length} Pending Verifications
        </span>
      </div>

      {/* Pending Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          Awaiting Verification ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-xs text-stone-400">
            No pending payments awaiting review.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingList.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{p.userName}</span>
                    <span className="text-xs text-stone-500">({p.userEmail})</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Amount: <strong className="text-emerald-700">₹{p.amount}</strong> • UPI Reference / UTR:{' '}
                    <span className="font-mono font-bold text-stone-800">{p.transactionRef}</span>
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Submitted on: {new Date(p.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedProofUrl(p.proofImageUrl)}
                    className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Screenshot
                  </button>

                  <button
                    onClick={() => verifyPayment(p.id, currentUser.id, currentUser.name)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify &amp; Confirm
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason for student:', 'UTR number not found in bank statement');
                      if (reason) rejectPayment(p.id, reason, currentUser.id, currentUser.name);
                    }}
                    className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Submissions History */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h3 className="text-sm font-bold text-stone-900">
            Completed Payment History ({verifiedList.length + rejectedList.length})
          </h3>
        </div>

        <div className="divide-y divide-stone-100">
          {[...verifiedList, ...rejectedList].map((p) => {
            const isVerified = p.status === 'verified';
            return (
              <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900">{p.userName}</p>
                  <p className="text-stone-500 text-[11px]">
                    UTR: {p.transactionRef} • ₹{p.amount} • Reviewed by {p.reviewerName || 'Organizer'}
                  </p>
                  {p.rejectionReason && (
                    <p className="text-red-600 text-[11px] font-medium mt-0.5">
                      Reason: {p.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isVerified ? 'Verified' : 'Rejected'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-stone-900">Submitted Payment Screenshot</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofUrl}
              alt="Payment proof"
              className="w-full h-72 object-contain bg-stone-100 rounded-xl"
            />
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
