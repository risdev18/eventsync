'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { UserCheck, ArrowRight } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
      <DemoRoleSwitcher />
      <Navbar />

      {/* Organizer Advisory Banner when visiting student portal */}
      {currentUser.role === 'organizer' && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : 'Faculty'} Coordinator). You are viewing the Student Participant section.
              </span>
            </div>
            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-900 underline shrink-0"
            >
              <span>Go to Faculty Organizer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto" suppressHydrationWarning>
        <StudentSidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
