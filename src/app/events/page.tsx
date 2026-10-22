'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, Calendar, MapPin, Users, Filter, ArrowRight, Sparkles, Clock, Bookmark, BookmarkCheck, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils/dateFormat';
import { CollegeEvent } from '@/lib/types';
import { SampleCertificateModal } from '@/components/certificates/SampleCertificateModal';

export default function ExploreEventsPage() {
  const { events, branches, getBookmarks, toggleBookmark } = useStore();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState('ALL');
  const [onlyPaid, setOnlyPaid] = useState('ALL');
  const [onlySaved, setOnlySaved] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedSampleEvent, setSelectedSampleEvent] = useState<CollegeEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarkedIds(getBookmarks());

    const handleUpdate = () => setBookmarkedIds(getBookmarks());
    window.addEventListener('eventease_bookmarks_updated', handleUpdate);
    return () => window.removeEventListener('eventease_bookmarks_updated', handleUpdate);
  }, [getBookmarks]);

  const handleToggleBookmark = (e: React.MouseEvent, evtId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(evtId);
    setBookmarkedIds(getBookmarks());
  };

  const filtered = events.filter((e) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.tagline.toLowerCase().includes(q) ||
      e.theme.themeName.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q);

    const matchBranch = selectedBranch === 'ALL' || e.branchId === selectedBranch;
    const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchMode = selectedMode === 'ALL' || e.mode === selectedMode;
    const matchPaid =
      onlyPaid === 'ALL'
        ? true
        : onlyPaid === 'PAID'
        ? e.paymentSettings.isPaid
        : !e.paymentSettings.isPaid;

    const matchSaved = !onlySaved || bookmarkedIds.includes(e.id);

    // Date filtering
    let matchDate = true;
    if (selectedDateRange !== 'ALL') {
      const evtDate = new Date(e.startDate).getTime();
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      if (selectedDateRange === 'THIS_WEEK') {
        matchDate = evtDate >= now && evtDate <= now + oneWeek;
      } else if (selectedDateRange === 'THIS_MONTH') {
        matchDate = evtDate >= now && evtDate <= now + oneMonth;
      } else if (selectedDateRange === 'UPCOMING') {
        matchDate = evtDate >= now;
      }
    }

    return matchSearch && matchBranch && matchCat && matchMode && matchPaid && matchSaved && matchDate && e.status === 'published';
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
              Explore College Events ({filtered.length})
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event title, theme, keywords..."
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
              <option value="cultural">Cultural Fest</option>
              <option value="seminar">Seminar / Symposium</option>
            </select>

            {/* Date Filter dropdown */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
            >
              <option value="ALL">All Dates</option>
              <option value="UPCOMING">Upcoming Future Events</option>
              <option value="THIS_WEEK">Happening Next 7 Days</option>
              <option value="THIS_MONTH">Happening Next 30 Days</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-400 font-semibold uppercase text-[11px]">Filters:</span>

              <select
                value={onlyPaid}
                onChange={(e) => setOnlyPaid(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
              >
                <option value="ALL">All Entry Fees</option>
                <option value="FREE">Free Events Only</option>
                <option value="PAID">Paid Events (UPI)</option>
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
              >
                <option value="ALL">All Modes</option>
                <option value="offline">In-Person (Offline)</option>
                <option value="online">Virtual (Online)</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <button
                onClick={() => setOnlySaved(!onlySaved)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  onlySaved
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Bookmarks ({bookmarkedIds.length})</span>
              </button>
            </div>

            {(search || selectedBranch !== 'ALL' || selectedCategory !== 'ALL' || selectedDateRange !== 'ALL' || selectedMode !== 'ALL' || onlyPaid !== 'ALL' || onlySaved) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedBranch('ALL');
                  setSelectedCategory('ALL');
                  setSelectedDateRange('ALL');
                  setSelectedMode('ALL');
                  setOnlyPaid('ALL');
                  setOnlySaved(false);
                }}
                className="text-stone-500 hover:text-stone-900 font-semibold underline cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => {
            const isBookmarked = bookmarkedIds.includes(evt.id);
            const seatsRemaining = Math.max(0, evt.capacity - evt.registeredCount);
            const pctFilled = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
            const deadlineDate = new Date(evt.registrationDeadline);
            const isPastDeadline = new Date() > deadlineDate;

            return (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Top Right: Theme & Bookmark */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow backdrop-blur-md"
                      style={{
                        backgroundColor: `${evt.theme.primaryColor}CC`,
                        color: evt.theme.textColor,
                      }}
                    >
                      Theme: {evt.theme.themeName}
                    </span>

                    <button
                      onClick={(e) => handleToggleBookmark(e, evt.id)}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow ${
                        isBookmarked
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-black/50 hover:bg-black/80 text-white'
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Top Left: Category & Branch */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow">
                      {evt.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-stone-200 border border-stone-700">
                      {evt.branchId.replace('branch-', '').toUpperCase()}
                    </span>
                  </div>

                  {/* Fee Pill */}
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-stone-900 shadow">
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
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{evt.tagline || evt.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span suppressHydrationWarning>{formatDate(evt.startDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span
                        suppressHydrationWarning
                        className={isPastDeadline ? 'text-red-600 font-bold' : ''}
                      >
                        Deadline: {formatDate(deadlineDate.toISOString())}
                        {isPastDeadline ? ' (Passed)' : ''}
                      </span>
                    </div>

                    {/* Seats Quota Progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">Quota:</span>
                        <span className="font-bold text-stone-800">
                          {seatsRemaining > 0 ? `${seatsRemaining} seats left` : 'Full / Waitlist'}
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pctFilled >= 90
                              ? 'bg-red-500'
                              : pctFilled >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${pctFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/events/${evt.id}`}
                      className="flex-1 py-2 rounded-xl text-center text-xs font-semibold border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-stone-700 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedSampleEvent(evt)}
                      className="px-2.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Preview sample certificate"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Certificate</span>
                    </button>
                    <Link
                      href={`/events/${evt.id}/register`}
                      className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    >
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sample Certificate Modal */}
      {selectedSampleEvent && (
        <SampleCertificateModal
          event={selectedSampleEvent}
          isOpen={Boolean(selectedSampleEvent)}
          onClose={() => setSelectedSampleEvent(null)}
        />
      )}

      <Footer />
    </div>
  );
}
