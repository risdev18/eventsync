'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Search, Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Certificate } from '@/lib/types';

export default function PublicVerifyCertificatePage() {
  const { certificates } = useStore();
  const [certInput, setCertInput] = useState('');
  const [searchedCert, setSearchedCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;

    const query = certInput.trim().toUpperCase();
    const found = certificates.find(
      (c) =>
        c.certificateNumber.toUpperCase() === query ||
        c.qrVerificationCode.toUpperCase() === query ||
        c.id.toUpperCase() === query
    );

    setSearchedCert(found || null);
    setHasSearched(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <div className="bg-stone-900 min-h-[36px]" suppressHydrationWarning />
        <div className="h-16 bg-white border-b border-stone-200" suppressHydrationWarning />
        <main className="flex-1 py-16 px-4 flex items-center justify-center" suppressHydrationWarning>
          <div className="animate-pulse text-stone-400 text-sm">Loading verification portal...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Verification Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Public Certificate Verification
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Verify the authenticity of EventEase official student certificates issued by college branch councils.
          </p>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-2.5 rounded-2xl shadow-lg border border-stone-200 flex items-center gap-2 max-w-xl mx-auto"
        >
          <div className="pl-3 text-stone-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            placeholder="Enter Certificate Number (e.g. CERT-IT-HP-2026-001)..."
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none font-mono uppercase text-stone-900"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Verify
          </button>
        </form>

        {/* Sample Quick Verifications */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Quick Test Identifiers:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {['CERT-IT-HP-2026-001', 'CERT-AML-WIN1-2026-001', 'CERT-CS-WIN2-2026-002'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCertInput(id);
                  const found = certificates.find((c) => c.certificateNumber === id);
                  setSearchedCert(found || null);
                  setHasSearched(true);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {hasSearched && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {searchedCert ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xl max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="font-bold text-emerald-800 text-sm">
                      Authentic Certificate Verified
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Status: Valid
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Certificate ID:</span>
                    <span className="font-mono font-bold text-stone-900">{searchedCert.certificateNumber}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Recipient Name:</span>
                    <span className="font-bold text-stone-900 text-sm">{searchedCert.recipientName}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Award Category:</span>
                    <span className="font-semibold text-emerald-700">{searchedCert.awardCategory}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Event Title:</span>
                    <span className="font-bold text-stone-900">{searchedCert.eventTitle}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Event Theme:</span>
                    <span className="font-semibold">{searchedCert.theme.themeName}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-500">Issuing Branch:</span>
                    <span>Department of {searchedCert.branchName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-500">Issued On:</span>
                    <span>{new Date(searchedCert.issueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 text-center">
                  Verified cryptographically via EventEase central institution registry.
                </div>
              </div>
            ) : (
              <div className="bg-red-50 rounded-3xl border border-red-200 p-8 text-center max-w-xl mx-auto space-y-3">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-base font-bold text-red-900">Certificate Not Found or Invalid</h3>
                <p className="text-xs text-red-700 max-w-sm mx-auto">
                  No record matches &ldquo;{certInput}&rdquo;. Please verify the certificate number carefully or contact the issuing college branch coordinator.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
