'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { OrganizerSidebar } from '@/components/layout/OrganizerSidebar';
import { ShieldAlert, GraduationCap, Lock } from 'lucide-react';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <DemoRoleSwitcher />
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-stone-400 text-xs">
          Loading portal...
        </div>
      </div>
    );
  }

  // Strict role guard: Students do NOT have faculty organizer access
  if (currentUser.role !== 'organizer' && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <DemoRoleSwitcher />
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 shadow-xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-md shadow-red-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                Teacher &amp; Faculty Portal Only
              </span>
              <h2 className="text-xl font-black text-stone-900">Access Restricted</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                You are currently signed in as <strong>{currentUser.name}</strong> (<span className="text-emerald-700 font-semibold">Student Account</span>). Students are not permitted to access faculty console or view participant confidential records.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/student/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Return to Student Dashboard</span>
              </Link>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-stone-700 hover:text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Sign In as Faculty Counselor</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
      <DemoRoleSwitcher />
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto" suppressHydrationWarning>
        <OrganizerSidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
