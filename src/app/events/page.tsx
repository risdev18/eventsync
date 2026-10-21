'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Calendar, MapPin, Users, Filter, ArrowRight, Sparkles } from 'lucide-react';

export default function ExploreEventsPage() {
  const { events, branches } = useStore();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [onlyPaid, setOnlyPaid] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tagline.toLowerCase().includes(search.toLowerCase()) ||
      e.theme.themeName.toLowerCase().includes(search.toLowerCase());

    const matchBranch = selectedBranch === 'ALL' || e.branchId === selectedBranch;
    const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchMode = selectedMode === 'ALL' || e.mode === selectedMode;
    const matchPaid =
      onlyPaid === 'ALL'
        ? true
        : onlyPaid === 'PAID'
        ? e.paymentSettings.isPaid
        : !e.paymentSettings.isPaid;

    return matchSearch && matchBranch && matchCat && matchMode && e.status === 'published';
  });

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <div className="bg-stone-900 min-h-[36px]" suppressHydrationWarning />
        <div className="h-16 bg-white border-b border-stone-200" suppressHydrationWarning />
        <main className="flex-1 flex items-center justify-center py-20" suppressHydrationWarning>
          <div className="animate-pulse flex flex-col items-center gap-3 text-stone-400 text-sm" suppressHydrationWarning>
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <span>Loading Events...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Explore College Events
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Browse hackathons, datathons, technical symposiums, and cultural fests across all college branches.
            </p>
          </div>

          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Host An Event</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event name, theme (Harry Potter, Pushpa, Subway), or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
              />
            </div>

            {/* Branch dropdown */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="competition">Competition</option>
              <option value="cultural">Cultural</option>
            </select>

            {/* Fee dropdown */}
            <select
              value={onlyPaid}
              onChange={(e) => setOnlyPaid(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Entry Fees</option>
              <option value="FREE">Free Events Only</option>
              <option value="PAID">Paid Events (UPI)</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              {/* Event Poster */}
              <div className="relative aspect-[16/9] w-full bg-stone-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evt.theme.posterUrl || evt.theme.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <span
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow backdrop-blur-md"
                  style={{
                    backgroundColor: evt.theme.primaryColor,
                    color: evt.theme.textColor,
                  }}
                >
                  Theme: {evt.theme.themeName}
                </span>

                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/95 text-stone-900 shadow">
                  {evt.paymentSettings.isPaid
                    ? `₹${evt.paymentSettings.feeAmount} ${
                        evt.paymentSettings.feeType === 'per_team' ? '/ team' : '/ person'
                      }`
                    : 'Free Entry'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{evt.tagline}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{new Date(evt.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Team Size: {evt.registrationSettings.minTeamSize} -{' '}
                      {evt.registrationSettings.maxTeamSize} members
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/events/${evt.id}`}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-semibold border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-stone-700 transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/events/${evt.id}/register`}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
