'use client';

import React from 'react';
import Link from 'next/link';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  QrCode,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Branch Council Event & Theme Setup',
      actor: 'Event Organizer',
      desc: 'Authorized faculty coordinators and branch student councils create events, upload theme posters, and extract complementary color palettes. The Dynamic Theme Engine persists this custom identity exclusively for that event.',
      features: [
        'Lightweight image canvas color extraction',
        'Scoped CSS variable isolation',
        'Configurable min/max team limits',
        'Custom UPI QR code upload',
      ],
      icon: Calendar,
      color: 'from-amber-500 to-amber-700',
    },
    {
      num: '02',
      title: 'Dynamic Student Registration & QR Payment',
      actor: 'Student Participant',
      desc: 'Students browse themed events and complete dynamic team registration forms tailored specifically to organizer parameters. For paid events, an official UPI QR code is presented for external scanning and UTR submission.',
      features: [
        'Dynamic member field generation',
        'Automatic fee calculation (per team or per member)',
        'UPI transaction reference (UTR) capture',
        'Screenshot proof attachment',
      ],
      icon: CreditCard,
      color: 'from-blue-500 to-blue-700',
    },
    {
      num: '03',
      title: 'Organizer Verification & Ticket Generation',
      actor: 'Event Organizer',
      desc: 'Organizers review pending transactions against bank records. Upon 1-click verification, the registration confirms and unique opaque QR tickets are immediately minted for each team member.',
      features: [
        'Audit trail with reviewer timestamps',
        'Rejection with custom feedback reason',
        'Automated in-app notification dispatch',
        'Cryptographic ticket token creation',
      ],
      icon: ShieldCheck,
      color: 'from-emerald-500 to-emerald-700',
    },
    {
      num: '04',
      title: 'Entrance Check-In & Duplicate Prevention',
      actor: 'Venue Registration Desk',
      desc: 'At the venue, participants present their QR tickets. Council volunteers scan tickets using camera scanning or manual lookup. Duplicate scans are actively blocked to safeguard certificate integrity.',
      features: [
        'Cross-event scan rejection',
        'Real-time attendance timestamps',
        'Verified attendance roster tracking',
        'One-click Attendance CSV export',
      ],
      icon: QrCode,
      color: 'from-cyan-500 to-cyan-700',
    },
    {
      num: '05',
      title: 'Automated Theme-Based Certificates',
      actor: 'Student & Public Verifier',
      desc: 'Attendance automatically unlocks participation certificates, while confirmed competition results generate 1st, 2nd, and 3rd place achievement certificates for every member. Download as PDF or bulk ZIP.',
      features: [
        'Certificates rendered using the event theme styling',
        'Individual PDF generation via jsPDF',
        'Bulk event export via JSZip',
        'Public verification QR code on each certificate',
      ],
      icon: Award,
      color: 'from-purple-500 to-purple-700',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            End-to-End Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900">
            How EventEase Works
          </h1>
          <p className="text-sm sm:text-base text-stone-500 max-w-xl mx-auto">
            A complete 5-step lifecycle from custom branch theme creation to verified attendance and certified results.
          </p>
        </div>

        {/* Steps Stack */}
        <div className="space-y-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start gap-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shrink-0 shadow-md font-black text-xl`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Phase {s.num} • {s.actor}
                      </span>
                      <h3 className="text-xl font-bold text-stone-900">{s.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{s.desc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs text-stone-700">
                    {s.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-black">Experience the Platform Now</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Use the top demo role bar to test EventEase as a student (Riya Sharma), organizer (Prof. Ananya Roy), or dean administrator.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/events"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
            >
              Browse Themed Events
            </Link>
            <Link
              href="/organizer/dashboard"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs"
            >
              Organizer Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
