'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { UserCheck, Shield, GraduationCap, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export function DemoRoleSwitcher() {
  const { currentUser, switchUser, users, resetToDemoData } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (confirm('Reset all demo events, registrations, and tickets back to default clean sample data?')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800 min-h-[36px]" suppressHydrationWarning />
    );
  }

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3" suppressHydrationWarning>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Demo Mode Active
          </span>
          <span className="hidden sm:inline text-stone-400">|</span>
          <span className="text-stone-300" suppressHydrationWarning>
            Current Persona: <strong className="text-white" suppressHydrationWarning>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}{currentUser.id === 'user-organizer-ds' ? ' — Data Science & Datathon Lead' : currentUser.branchId ? ` — ${currentUser.branchId.replace('branch-', '').toUpperCase()}` : ''})
          </span>
        </div>

        <div className="flex items-center gap-2" suppressHydrationWarning>
          <span className="text-stone-400 hidden md:inline">Switch Persona:</span>
          {users.map((u) => {
            const isSelected = u.id === currentUser.id;
            const Icon =
              u.role === 'admin' ? Shield : u.role === 'organizer' ? UserCheck : GraduationCap;

            const getPersonaBadge = () => {
              if (u.id === 'user-organizer-ds') return 'Prof. Iyer (Datathon Org)';
              if (u.id === 'user-organizer-it') return 'Prof. Ananya (IT Org)';
              if (u.id === 'user-organizer-aml') return 'Prof. Vikram (AML Org)';
              if (u.id === 'user-admin') return 'Dr. Rajesh (Dean/Admin)';
              if (u.id === 'user-riya') return 'Riya (Student)';
              if (u.id === 'user-arjun') return 'Arjun (Student)';
              return `${u.name.split(' ')[0]} (${u.role[0].toUpperCase() + u.role.slice(1)})`;
            };

            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                suppressHydrationWarning
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
                title={`Switch to ${u.name} (${u.role})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{getPersonaBadge()}</span>
              </button>
            );
          })}

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
            title="Reset to fresh demo state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
