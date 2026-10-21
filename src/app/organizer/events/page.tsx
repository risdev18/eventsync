'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { formatDate } from '@/lib/utils/dateFormat';
import {
  Calendar,
  Users,
  CreditCard,
  QrCode,
  Award,
  Sparkles,
  Palette,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function OrganizerBranchEventsPage() {
  const { events, registrations, payments, attendance, currentUser } = useStore();

  // Find events strictly under this organizer's branch purview
  const myEvents = events.filter((e) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.branchId) {
      return e.branchId === currentUser.branchId;
    }
    return e.organizerId === currentUser.id;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {currentUser.branchId ? `${currentUser.branchId.replace('branch-', '').toUpperCase()} Branch Events` : 'All Branch Events'}
          </span>
          <h1 className="text-2xl font-black text-stone-900 mt-2">
            Managed Events Directory
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            You have isolated organizer purview over {myEvents.length} event{myEvents.length === 1 ? '' : 's'}. Cross-branch events are strictly separated.
          </p>
        </div>

        <Link
          href="/organizer/events/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {myEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No Events Assigned Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You do not have any active events assigned to your branch. Create a new event or contact the college administrator.
          </p>
          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Event</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {myEvents.map((evt) => {
            const eventRegs = registrations.filter((r) => r.eventId === evt.id);
            const eventPayments = payments.filter((p) => p.eventId === evt.id);
            const pendingEvtPayments = eventPayments.filter((p) => p.status === 'submitted');
            const eventAtt = attendance.filter((a) => a.eventId === evt.id);

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all space-y-6"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-stone-900 overflow-hidden shrink-0 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.theme.posterUrl || evt.theme.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-stone-900">{evt.title}</h2>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                          style={{
                            backgroundColor: `${evt.theme.primaryColor}22`,
                            color: evt.theme.primaryColor,
                          }}
                        >
                          Theme: {evt.theme.themeName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {evt.category.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 font-light max-w-xl">
                        {evt.tagline || evt.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                        <span suppressHydrationWarning>
                          Dates: <strong>{formatDate(evt.startDate)} - {formatDate(evt.endDate)}</strong>
                        </span>
                        <span>•</span>
                        <span>Venue: <strong>{evt.venue}</strong></span>
                        <span>•</span>
                        <span>Fee: <strong>{evt.paymentSettings.isPaid ? `₹${evt.paymentSettings.feeAmount}` : 'Free'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/events/${evt.slug}`}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
                  >
                    <span>View Public Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Event Scoped Mini-Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Registered Teams</span>
                    <p className="text-xl font-black text-stone-900 mt-0.5">{eventRegs.length}</p>
                    <span className="text-[10px] text-stone-400">Cap: {evt.capacity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Pending Payments</span>
                    <p className={`text-xl font-black mt-0.5 ${pendingEvtPayments.length > 0 ? 'text-amber-600' : 'text-stone-900'}`}>
                      {pendingEvtPayments.length}
                    </p>
                    <span className="text-[10px] text-stone-400">Submissions</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Checked-In Attendees</span>
                    <p className="text-xl font-black text-stone-900 mt-0.5">{eventAtt.length}</p>
                    <span className="text-[10px] text-emerald-600">Physical verified</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Revenue Verified</span>
                    <p className="text-xl font-black text-emerald-700 mt-0.5">
                      ₹{eventPayments.filter((p) => p.status === 'verified').reduce((acc, p) => acc + p.amount, 0)}
                    </p>
                    <span className="text-[10px] text-stone-400">Total collected</span>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Link
                    href={`/organizer/events/${evt.id}/payments`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                    <span>Verify Payments ({pendingEvtPayments.length})</span>
                  </Link>

                  <Link
                    href={`/organizer/events/${evt.id}/attendance`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-stone-500" />
                    <span>Attendance Scanner</span>
                  </Link>

                  <Link
                    href={`/organizer/events/${evt.id}/results`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-stone-500" />
                    <span>Winners &amp; Results</span>
                  </Link>

                  <Link
                    href={`/organizer/events/${evt.id}/certificates`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Certificates Hub</span>
                  </Link>

                  <Link
                    href={`/organizer/events/${evt.id}/theme`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 text-stone-500" />
                    <span>Theme Studio</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
