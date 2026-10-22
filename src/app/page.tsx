'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
  GraduationCap,
} from 'lucide-react';
import { CollegeEvent } from '@/lib/types';
import { SampleCertificateModal } from '@/components/certificates/SampleCertificateModal';

export default function HomePage() {
  const { events, branches, registrations, certificates, currentUser, getBookmarks, toggleBookmark } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlySaved, setOnlySaved] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedSampleEvent, setSelectedSampleEvent] = useState<CollegeEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarkedIds(getBookmarks());

    const handleBookmarksUpdate = () => {
      setBookmarkedIds(getBookmarks());
    };
    window.addEventListener('eventease_bookmarks_updated', handleBookmarksUpdate);
    return () => window.removeEventListener('eventease_bookmarks_updated', handleBookmarksUpdate);
  }, [getBookmarks]);

  const handleToggleBookmark = (e: React.MouseEvent, evtId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(evtId);
    setBookmarkedIds(getBookmarks());
  };

  // Filter events based on search, branch, category & saved filter
  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      evt.title.toLowerCase().includes(q) ||
      evt.tagline.toLowerCase().includes(q) ||
      evt.theme.themeName.toLowerCase().includes(q) ||
      evt.venue.toLowerCase().includes(q) ||
      evt.category.toLowerCase().includes(q);

    const matchesBranch =
      selectedBranch === 'ALL' ||
      evt.branchId.toLowerCase().includes(selectedBranch.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || evt.category === selectedCategory;

    const matchesSaved = !onlySaved || bookmarkedIds.includes(evt.id);

    return matchesSearch && matchesBranch && matchesCategory && matchesSaved && evt.status === 'published';
  });

  // Dynamically populated from branches in store (including newly added branches!)
  const branchChips = [
    { label: 'All Branches', value: 'ALL' },
    ...branches.map((b) => ({ label: b.code, value: b.code })),
  ];

  const categoryChips = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Hackathons', value: 'hackathon' },
    { label: 'Workshops', value: 'workshop' },
    { label: 'Competitions', value: 'competition' },
    { label: 'Cultural Fests', value: 'cultural' },
    { label: 'Seminars & Talks', value: 'seminar' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans" suppressHydrationWarning>
        <div className="bg-stone-900 min-h-[36px]" suppressHydrationWarning />
        <div className="h-16 bg-white border-b border-stone-200" suppressHydrationWarning />
        <main className="flex-1 flex items-center justify-center py-20" suppressHydrationWarning>
          <div className="animate-pulse flex flex-col items-center gap-3 text-stone-400 text-sm" suppressHydrationWarning>
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <span>Loading EventEase Campus Portal...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
      {/* Role Switcher for seamless capstone presentation */}
      <DemoRoleSwitcher />

      {/* Main Website Header */}
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200 bg-gradient-to-b from-emerald-50/50 to-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Smart College Event Management • Capstone 2026</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
                  Discover. <br />
                  <span className="text-emerald-700">Participate.</span> <br />
                  Grow.
                </h1>

                <p className="text-base sm:text-lg text-stone-600 max-w-xl font-normal leading-relaxed">
                  Your one-stop centralized platform for college hackathons, technical workshops, paper competitions, and branch symposiums with independent dynamic event themes.
                </p>

                {/* Search Bar matching reference image with mobile optimization */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    document.getElementById('upcoming-events')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white p-1.5 sm:p-2 rounded-2xl shadow-lg shadow-stone-200/60 border border-stone-200 flex items-center gap-1.5 sm:gap-2 max-w-xl"
                >
                  <div className="pl-2.5 sm:pl-3 text-stone-400 shrink-0">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, themes, branches, venues..."
                    suppressHydrationWarning
                    className="flex-1 min-w-0 bg-transparent px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm outline-none text-stone-900 placeholder:text-stone-400"
                  />
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    Search
                  </button>
                </form>

                {/* Quick Registration & Explorer CTAs */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href="/student-registration"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-2xs transition-all"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>Student Registration Portal</span>
                  </Link>

                  <Link
                    href="/branches"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 shadow-2xs transition-all"
                  >
                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                    <span>View Academic Branches</span>
                  </Link>
                </div>

                {/* Category & Branch Chips with smooth horizontal scroll on mobile */}
                <div className="space-y-2 pt-1" suppressHydrationWarning>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
                      Branch:
                    </span>
                    {branchChips.map((chip) => {
                      const isSelected = selectedBranch === chip.value;
                      return (
                        <button
                          key={chip.value}
                          onClick={() => setSelectedBranch(chip.value)}
                          suppressHydrationWarning
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                              : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
                      Type:
                    </span>
                    {categoryChips.map((cat) => {
                      const isSelected = selectedCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          suppressHydrationWarning
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                            isSelected
                              ? 'bg-stone-900 text-white shadow-xs font-semibold'
                              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setOnlySaved(!onlySaved)}
                      suppressHydrationWarning
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                        onlySaved
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <Bookmark className="w-3 h-3 text-amber-500" />
                      <span>Saved ({bookmarkedIds.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Image Graphic matching reference campus card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 aspect-[4/3] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero-campus.jpg"
                    alt="EventEase College Campus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                  {/* Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">Annual Tech Fest 2026</h4>
                      <p className="text-xs text-stone-500">5+ Branches • 1200+ Participants</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Live Portal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. UPCOMING EVENTS GRID MATCHING REFERENCE MOCKUP */}
        <section id="upcoming-events" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Featured Campus Competitions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Upcoming College Events ({filteredEvents.length})
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Explore student competitions with unique organizer-created themes, live seat quotas, and deadlines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(searchQuery || selectedBranch !== 'ALL' || selectedCategory !== 'ALL' || onlySaved) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBranch('ALL');
                    setSelectedCategory('ALL');
                    setOnlySaved(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-600 cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}

              <Link
                href="/events"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-800">No events found matching your filter</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or reset the branch/category filters to see all events.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBranch('ALL');
                  setSelectedCategory('ALL');
                  setOnlySaved(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-emerald-700 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const isBookmarked = bookmarkedIds.includes(evt.id);
                const seatsRemaining = Math.max(0, evt.capacity - evt.registeredCount);
                const pctFilled = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
                const deadlineDate = new Date(evt.registrationDeadline);
                const isPastDeadline = new Date() > deadlineDate;

                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col group"
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.theme.posterUrl || evt.theme.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* Theme Badge in Top Right */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md backdrop-blur-md"
                          style={{
                            backgroundColor: `${evt.theme.primaryColor}CC`,
                            color: evt.theme.textColor,
                          }}
                        >
                          Theme: {evt.theme.themeName}
                        </span>

                        {/* Bookmark Button */}
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

                      {/* Status & Category Badge Top Left */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow">
                          {evt.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-stone-200 border border-stone-700">
                          {evt.branchId.replace('branch-', '').toUpperCase()}
                        </span>
                      </div>

                      {/* Fee Pill Bottom Left */}
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-stone-900 shadow">
                        {evt.paymentSettings.isPaid
                          ? `₹${evt.paymentSettings.feeAmount} ${
                              evt.paymentSettings.feeType === 'per_team' ? '/ team' : '/ person'
                            }`
                          : 'Free Entry'}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {evt.tagline || evt.description}
                        </p>
                      </div>

                      {/* Metadata items */}
                      <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {new Date(evt.startDate).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className={isPastDeadline ? 'text-red-600 font-bold' : ''}>
                            Cutoff: {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isPastDeadline ? ' (Passed)' : ''}
                          </span>
                        </div>

                        {/* Seats Capacity Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 font-medium">Seats Quota:</span>
                            <span className="font-bold text-stone-800">
                              {seatsRemaining > 0 ? `${seatsRemaining} remaining` : 'Full / Waitlist'}
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

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={`/events/${evt.id}`}
                          className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-center border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedSampleEvent(evt)}
                          className="px-2.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Preview official sample certificate"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline">Certificate</span>
                        </button>
                        <Link
                          href={`/events/${evt.id}/register`}
                          className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                          Register Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. HOW IT WORKS SECTION (Matching Reference Infographic) */}
        <section className="py-16 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Seamless Workflow
              </span>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                How It Works (Simplified Flow)
              </h2>
              <p className="text-sm text-stone-500 mt-2">
                From creation and custom theme setup to verified attendance and certified results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {[
                {
                  step: '1',
                  title: 'Create Event',
                  subtitle: '(Organizer)',
                  desc: 'Setup branch, configure theme images, extract colors & set team limits.',
                  icon: Calendar,
                },
                {
                  step: '2',
                  title: 'Register & Pay',
                  subtitle: '(Student)',
                  desc: 'Complete dynamic team form and submit UPI QR payment proof.',
                  icon: CreditCard,
                },
                {
                  step: '3',
                  title: 'Verify Payment',
                  subtitle: '(Organizer)',
                  desc: 'Review submitted transaction UTR & proof screenshot with 1-click confirmation.',
                  icon: ShieldCheck,
                },
                {
                  step: '4',
                  title: 'Mark Attendance',
                  subtitle: '(Organizer)',
                  desc: 'Scan secure QR tickets at entrance with duplicate scan prevention.',
                  icon: QrCode,
                },
                {
                  step: '5',
                  title: 'Get Certificate',
                  subtitle: '(Student)',
                  desc: 'Automatic theme-based participation & winner certificates with public QR.',
                  icon: Award,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative bg-stone-50 rounded-2xl p-5 border border-stone-200/80 text-center flex flex-col items-center hover:bg-emerald-50/40 hover:border-emerald-300 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 mb-3">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Step {item.step}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-0.5">{item.title}</h4>
                    <span className="text-[11px] font-medium text-stone-500">{item.subtitle}</span>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. DYNAMIC THEME ENGINE SPOTLIGHT */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Patented Theme Isolation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Any Photo. Any Theme. <br />
                Zero Global Design Drift.
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                Whether an organizer uploads a <em>Harry Potter</em> mystical castle, a vibrant <em>Subway Suppers</em> deli artwork, a <em>Tech Innovation</em> cyber grid, or a rugged <em>Pushpa</em> red sandalwood wildfire — EventEase automatically extracts colors and renders that theme strictly within the event page and certificates without disturbing the main college portal!
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  href="/events/event-it-hackathon"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
                >
                  ⚡ View Harry Potter Theme
                </Link>
                <Link
                  href="/events/event-aml-hackathon"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                >
                  🥪 View Subway Suppers Theme
                </Link>
                <Link
                  href="/events/event-cs-hackathon"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all"
                >
                  💻 View Tech Theme
                </Link>
                <Link
                  href="/events/event-pushpa-fest"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all"
                >
                  🔥 View Pushpa Wildfire Theme
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sample Certificate Modal */}
      {selectedSampleEvent && (
        <SampleCertificateModal
          event={selectedSampleEvent}
          isOpen={Boolean(selectedSampleEvent)}
          onClose={() => setSelectedSampleEvent(null)}
        />
      )}

      {/* Main Website Footer */}
      <Footer />
    </div>
  );
}
