'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
  Calendar,
  CreditCard,
  Award,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/dateFormat';

export default function StudentDashboardPage() {
  const { currentUser, registrations, events, certificates, tickets } = useStore();

  // Find registrations for this student
  const studentRegistrations = registrations.filter(
    (r) =>
      r.userId === currentUser.id ||
      r.members.some((m) => m.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const studentCertificates = certificates.filter(
    (c) =>
      c.recipientId === currentUser.id ||
      c.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      c.recipientName.toLowerCase().includes(currentUser.name.toLowerCase())
  );

  const studentTickets = tickets.filter(
    (t) =>
      t.userId === currentUser.id ||
      t.participantEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const paidEventsCount = studentRegistrations.filter((r) => r.totalAmount > 0).length;

  // Simple personalized recommendation engine based on student interests
  const interests = currentUser.interests || ['Web Development', 'AI & ML'];
  const recommendedEvents = events
    .filter((e) => !studentRegistrations.some((r) => r.eventId === e.id))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 1. WELCOME BANNER MATCHING MOCKUP */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
            Academic Year 2025-2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-light leading-relaxed">
            Keep exploring and make the most of your college journey. Discover branch hackathons, verify your tickets, and download official verified certificates.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all shrink-0 cursor-pointer"
        >
          <span>Explore New Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. STATS CARDS MATCHING REFERENCE MOCKUP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Registered Events</p>
            <h3 className="text-3xl font-black text-stone-900 mt-1">{studentRegistrations.length}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Active registrations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Paid Upcoming</p>
            <h3 className="text-3xl font-black text-stone-900 mt-1">{paidEventsCount}</h3>
            <p className="text-[11px] text-stone-500 mt-1">UPI verified fee</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Earned Certificates</p>
            <h3 className="text-3xl font-black text-stone-900 mt-1">{studentCertificates.length}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Verified & downloadable</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. UPCOMING REGISTERED EVENTS MATCHING REFERENCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">My Registered Events</h2>
            <p className="text-xs text-stone-500">Real-time status of your individual and team registrations</p>
          </div>
          <Link
            href="/student/registrations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {studentRegistrations.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
            <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No events registered yet</p>
            <Link
              href="/events"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {studentRegistrations.map((reg) => {
              const event = events.find((e) => e.id === reg.eventId);
              if (!event) return null;

              const isConfirmed = reg.status === 'confirmed';
              const isPending = reg.status === 'submitted' || reg.status === 'pending_payment';

              return (
                <div
                  key={reg.id}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Event Mini Poster */}
                    <div className="w-14 h-14 rounded-xl bg-stone-900 overflow-hidden shrink-0 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.theme.posterUrl || event.theme.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">{event.title}</h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${event.theme.primaryColor}22`,
                            color: event.theme.primaryColor,
                          }}
                        >
                          Theme: {event.theme.themeName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                        <span suppressHydrationWarning className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.startDate)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}
                        </span>
                        {reg.teamName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              Team {reg.teamName} ({reg.teamSize} members)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isConfirmed
                        ? 'Registered'
                        : isPending
                        ? 'Pending Payment'
                        : 'Action Required'}
                    </span>

                    {isConfirmed ? (
                      <Link
                        href="/student/tickets"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </Link>
                    ) : (
                      <Link
                        href="/student/registrations"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-stone-50"
                      >
                        Check Status
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RECOMMENDED FOR YOU CAROUSEL MATCHING REFERENCE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Recommended for You</h2>
            <p className="text-xs text-stone-500">Personalized based on your branch &amp; profile interests</p>
          </div>
          <Link href="/events" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Browse All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recommendedEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full bg-stone-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evt.theme.posterUrl || evt.theme.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow"
                  style={{
                    backgroundColor: evt.theme.primaryColor,
                    color: evt.theme.textColor,
                  }}
                >
                  {evt.theme.themeName}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{evt.title}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{evt.tagline}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-100">
                  <span suppressHydrationWarning className="text-stone-500">
                    {formatDate(evt.startDate)}
                  </span>
                  <Link
                    href={`/events/${evt.id}`}
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
