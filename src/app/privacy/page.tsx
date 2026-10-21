'use client';

import React from 'react';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Institutional Policy
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900">Privacy Policy</h1>
          <p className="text-xs text-stone-500">Last updated: Academic Year 2026</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Information We Collect</h3>
          <p>
            EventEase collects student information including Full Name, Institutional College Email, University Serial Number (USN), and Academic Branch. This information is utilized solely for event registrations, entrance ticket generation, and certificate authentication.
          </p>

          <h3 className="text-base font-bold text-stone-900 pt-2">2. Payment Data &amp; Security</h3>
          <p>
            EventEase does not store UPI PINs, banking passwords, or payment gateway card credentials. Uploaded payment proofs are strictly stored in protected institutional buckets accessible only by authorized faculty coordinators for transaction verification.
          </p>

          <h3 className="text-base font-bold text-stone-900 pt-2">3. Public Certificate Verification</h3>
          <p>
            Certificates issued on the platform contain a unique public verification QR code. Only non-sensitive credential data (Recipient Name, Placement, Event Name, Issue Date) is exposed on the public verification portal to protect student privacy.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
