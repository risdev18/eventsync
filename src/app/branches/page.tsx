'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Layers, Terminal, Cpu, Code, BarChart2, Wrench, Mail, Calendar, ArrowRight, PlusCircle, X, Building2 } from 'lucide-react';

export default function BranchesPage() {
  const { branches, events, addBranch } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [color, setColor] = useState('#059669');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !code.trim()) {
      setError('Please provide both department name and branch code.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (branches.some((b) => b.code.toUpperCase() === cleanCode)) {
      setError(`Branch with code "${cleanCode}" already exists.`);
      return;
    }

    addBranch({
      name: name.trim(),
      code: cleanCode,
      description: desc.trim() || `${name.trim()} Department`,
      accentColor: color,
      coordinatorName: coordinator.trim() || 'Department Faculty Coordinator',
      coordinatorEmail: `coordinator.${cleanCode.toLowerCase()}@college.edu`,
    });

    setShowAddModal(false);
    setName('');
    setCode('');
    setDesc('');
    setCoordinator('');
  };

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

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Academic Branches &amp; Councils
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              Each branch independently organizes competitions with unique event themes, customized registration forms, and verified certificates.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Branch</span>
          </button>
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

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Add New Academic Department</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Department / Branch Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Civil Engineering, Electronics & Comm"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CIVIL, ECE, BT"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-mono outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono text-stone-600">{color}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Short Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief summary of department domains & research..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Faculty Coordinator</label>
                <input
                  type="text"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  placeholder="e.g. Prof. Rajesh K. Nair"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Academic Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
