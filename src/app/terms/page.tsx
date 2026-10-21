'use client';

import React from 'react';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Institutional Terms
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900">Terms of Service</h1>
          <p className="text-xs text-stone-500">Effective Date: Academic Year 2026</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Student Participation Code</h3>
          <p>
            By registering for an event, participants agree to uphold high standards of academic and technical integrity. Pre-built code templates or plagiarized work during competitive hackathons will result in immediate disqualification without fee refund.
          </p>

          <h3 className="text-base font-bold text-stone-900 pt-2">2. Team Formation &amp; Limits</h3>
          <p>
            Teams must strictly comply with the minimum and maximum member limits configured by event organizers. Team leaders are responsible for ensuring all listed team members are legitimate registered college students.
          </p>

          <h3 className="text-base font-bold text-stone-900 pt-2">3. Certificate Issuance &amp; Revocation</h3>
          <p>
            Participation certificates require confirmed physical attendance verified at the venue check-in desk. Institutional administrators reserve the right to revoke incorrectly issued certificates with an audited record in the platform logs.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
