'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Layers, Terminal, Cpu, Code, BarChart2, Wrench, Mail, Calendar, ArrowRight } from 'lucide-react';

export default function BranchesPage() {
  const { branches, events } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const iconMap: { [key: string]: any } = {
    Terminal,
    Cpu,
    Code,
    BarChart2,
    Wrench,
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <div className="bg-stone-900 min-h-[36px]" suppressHydrationWarning />
        <div className="h-16 bg-white border-b border-stone-200" suppressHydrationWarning />
        <main className="flex-1 py-12 px-4 flex items-center justify-center" suppressHydrationWarning>
          <div className="animate-pulse text-stone-400 text-sm">Loading Academic Branches...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Academic Branches &amp; Councils
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Each branch independently organizes competitions with unique event themes, customized registration forms, and verified certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => {
            const Icon = iconMap[b.iconName] || Layers;
            const branchEvents = events.filter((e) => e.branchId === b.id && e.status === 'published');

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: b.accentColor }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      Code: {b.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900">{b.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{b.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600 space-y-1">
                    <p>
                      <strong className="text-stone-700">Faculty Coordinator:</strong> {b.coordinatorName}
                    </p>
                    <p className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{b.coordinatorEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    {branchEvents.length} Active {branchEvents.length === 1 ? 'Event' : 'Events'}
                  </span>

                  <Link
                    href={`/events?branch=${b.code}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>View Branch Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
