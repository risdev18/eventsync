'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils/dateFormat';

export default function DirectCertificateVerificationPage() {
  const params = useParams();
  const certId = (params.certificateId as string) || '';
  const { certificates } = useStore();

  const cert = certificates.find(
    (c) =>
      c.certificateNumber.toUpperCase() === certId.toUpperCase() ||
      c.qrVerificationCode.toUpperCase() === certId.toUpperCase() ||
      c.id.toUpperCase() === certId.toUpperCase()
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-6">
        <Link
          href="/verify-certificate"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Certificate Search</span>
        </Link>

        {cert ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-stone-900 text-lg">Verified Authentic Certificate</h2>
                  <p className="text-xs text-stone-500">Official record in EventEase college repository</p>
                </div>
              </div>

              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                Status: Valid
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Certificate ID:</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{cert.certificateNumber}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Recipient Name:</span>
                <span className="font-bold text-stone-900 text-sm">{cert.recipientName}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Award Category:</span>
                <span className="font-semibold text-emerald-700">{cert.awardCategory}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Event Title:</span>
                <span className="font-bold text-stone-900">{cert.eventTitle}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Event Theme:</span>
                <span className="font-semibold">{cert.theme.themeName}</span>
              </div>

              <div className="flex justify-between border-b border-stone-100 pb-2.5">
                <span className="text-stone-500 font-medium">Issuing Authority:</span>
                <span>Department of {cert.branchName} • EventEase College</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Date of Issue:</span>
                <span suppressHydrationWarning>{formatDate(cert.issueDate)}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs text-emerald-900 text-center">
              ✓ This credential is authentic, validated against institutional attendance and result records.
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-3xl border border-red-200 p-8 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-900">Certificate Not Found</h3>
            <p className="text-xs text-red-700 max-w-sm mx-auto">
              No active certificate record was found for ID &ldquo;{certId}&rdquo;.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
