'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { ThemedContainer } from '@/components/theme/ThemedContainer';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  CreditCard,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function ThemedEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { events } = useStore();
  const [activeTab, setActiveTab] = useState<'about' | 'rules' | 'prizes' | 'schedule' | 'faq'>('about');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const event = events.find((e) => e.id === eventId || e.slug === eventId);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col" suppressHydrationWarning>
        <div className="bg-stone-900 min-h-[36px]" suppressHydrationWarning />
        <div className="h-16 bg-stone-800 border-b border-stone-700" suppressHydrationWarning />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" suppressHydrationWarning>
          <div className="animate-pulse flex flex-col items-center gap-3 text-stone-400 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span>Loading Event Experience...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col" suppressHydrationWarning>
        <DemoRoleSwitcher />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-stone-800">Event Not Found</h2>
          <p className="text-stone-500 text-sm mt-2">
            The event you are looking for does not exist or may have been unlisted.
          </p>
          <Link
            href="/events"
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            Back to All Events
          </Link>
        </div>
      </div>
    );
  }

  const theme = event.theme;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans" suppressHydrationWarning>
      {/* Retain platform header & role switcher */}
      <DemoRoleSwitcher />
      <Navbar />

      {/* ISOLATED DYNAMIC THEME CONTAINER */}
      <ThemedContainer theme={theme} className="flex-1 pb-20">
        {/* Themed Sub-Navigation Bar */}
        <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ color: theme.textColor }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Events</span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow"
                style={{
                  backgroundColor: `${theme.primaryColor}33`,
                  color: theme.primaryColor,
                  border: `1px solid ${theme.primaryColor}66`,
                }}
              >
                Theme: {theme.themeName}
              </span>
            </div>
          </div>
        </div>

        {/* Themed Hero Header with Poster/Banner Asset */}
        <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15">
              {/* Background theme image */}
              <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full bg-stone-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.bannerUrl || theme.posterUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Heavy moody gradient so text is always 100% readable */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"
                  style={{
                    background: `linear-gradient(to top, ${theme.backgroundColor} 0%, ${theme.backgroundColor}CC 40%, transparent 100%)`,
                  }}
                />
              </div>

              {/* Hero Floating Information */}
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                <div className="max-w-3xl space-y-3">
                  <span
                    className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.backgroundColor,
                    }}
                  >
                    Department of {event.branchId.replace('branch-', '').toUpperCase()}
                  </span>

                  <h1
                    className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight"
                    style={{ color: theme.textColor }}
                  >
                    {event.title}
                  </h1>

                  <p
                    className="text-sm sm:text-lg font-medium opacity-90 italic"
                    style={{ color: theme.accentColor }}
                  >
                    &ldquo;{event.tagline}&rdquo;
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm font-medium">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <Calendar className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} -{' '}
                        {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90">
                      <MapPin className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span>{event.venue}</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90">
                      <Users className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span>{event.capacity - event.registeredCount} spots remaining</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Highlights Bar */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 mb-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: `${theme.surfaceColor}EE`,
              borderColor: `${theme.primaryColor}33`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                style={{ backgroundColor: `${theme.primaryColor}22`, color: theme.primaryColor }}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs opacity-70">Team Formation</p>
                <p className="text-sm font-bold">
                  {event.registrationSettings.minTeamSize} - {event.registrationSettings.maxTeamSize} Members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                style={{ backgroundColor: `${theme.primaryColor}22`, color: theme.primaryColor }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs opacity-70">Registration Fee</p>
                <p className="text-sm font-bold">
                  {event.paymentSettings.isPaid
                    ? `₹${event.paymentSettings.feeAmount} (${event.paymentSettings.feeType === 'per_team' ? 'per team' : 'per person'})`
                    : 'Free Registration'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                style={{ backgroundColor: `${theme.primaryColor}22`, color: theme.primaryColor }}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs opacity-70">Registration Deadline</p>
                <p className="text-sm font-bold">
                  {new Date(event.registrationDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs & Register CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Main Tab Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Themed Tabs Bar */}
            <div
              className="flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-md"
              style={{
                backgroundColor: `${theme.surfaceColor}CC`,
                borderColor: `${theme.primaryColor}33`,
              }}
            >
              {[
                { id: 'about', label: 'About' },
                { id: 'rules', label: 'Rules & Guidelines' },
                { id: 'prizes', label: 'Prizes & Awards' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'faq', label: 'FAQ' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? theme.primaryColor : 'transparent',
                      color: isActive ? theme.backgroundColor : theme.textColor,
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div
              className="p-6 sm:p-8 rounded-2xl border shadow-xl backdrop-blur-md min-h-[300px]"
              style={{
                backgroundColor: `${theme.surfaceColor}EE`,
                borderColor: `${theme.primaryColor}33`,
              }}
            >
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" style={{ color: theme.primaryColor }} />
                      About the Event
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed opacity-90">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">
                      Event Highlights
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm opacity-90">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Dynamic {theme.themeName} Experience</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Attendance-Verified Participation Certificates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>UPI QR Payment Verification System</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Custom Themed Winner Certificates for Top 3</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    Rules & Code of Conduct
                  </h3>
                  <div className="space-y-2">
                    {event.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: theme.primaryColor,
                            color: theme.backgroundColor,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm opacity-90">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'prizes' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    Prizes & Award Distribution
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/40 text-center">
                      <span className="text-2xl font-black text-amber-400">1st Place</span>
                      <p className="text-xs sm:text-sm font-semibold mt-1">
                        {event.prizes?.first || 'Gold Trophy + ₹25,000 + Winner Certificates'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-400/20 to-slate-600/20 border border-slate-400/40 text-center">
                      <span className="text-2xl font-black text-slate-300">2nd Place</span>
                      <p className="text-xs sm:text-sm font-semibold mt-1">
                        {event.prizes?.second || 'Silver Trophy + ₹15,000 + Winner Certificates'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-800/20 to-amber-900/20 border border-amber-700/40 text-center">
                      <span className="text-2xl font-black text-amber-600">3rd Place</span>
                      <p className="text-xs sm:text-sm font-semibold mt-1">
                        {event.prizes?.third || 'Bronze Memento + ₹10,000 + Winner Certificates'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    Event Timeline
                  </h3>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/20">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-stone-900"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: theme.primaryColor }}
                          >
                            {item.time}
                          </span>
                          <p className="text-xs sm:text-sm font-medium mt-0.5 opacity-90">
                            {item.activity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold mb-3">Frequently Asked Questions</h3>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs sm:text-sm font-semibold">
                      Q: Will certificates be provided?
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      A: Yes! Verified attendees who check in with their QR ticket will receive official theme-based participation certificates.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs sm:text-sm font-semibold">
                      Q: How is payment verified?
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      A: After submitting the UPI UTR and proof screenshot, the branch organizer reviews it and your ticket activates automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Registration CTA Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="p-6 rounded-2xl border shadow-xl backdrop-blur-md sticky top-24 space-y-5"
              style={{
                backgroundColor: `${theme.surfaceColor}F2`,
                borderColor: `${theme.primaryColor}44`,
              }}
            >
              <h3 className="text-lg font-bold">Register for this Event</h3>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-70">Category:</span>
                  <span className="font-semibold uppercase">{event.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Format:</span>
                  <span className="font-semibold capitalize">{event.mode} Mode</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Team Allowed:</span>
                  <span className="font-semibold">
                    {event.registrationSettings.minTeamSize} to{' '}
                    {event.registrationSettings.maxTeamSize} Members
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                  <span>Entry Fee:</span>
                  <span style={{ color: theme.primaryColor }}>
                    {event.paymentSettings.isPaid
                      ? `₹${event.paymentSettings.feeAmount} / team`
                      : 'Free'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/events/${event.id}/register`}
                className="w-full py-3.5 px-4 rounded-xl text-center font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 block cursor-pointer"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.backgroundColor,
                }}
              >
                Register Now →
              </Link>

              <div className="pt-2 text-center text-xs opacity-60">
                Organizer: {event.organizerName} <br />
                {event.organizerContact}
              </div>
            </div>
          </div>
        </section>
      </ThemedContainer>
    </div>
  );
}
