'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { CheckCircle2, XCircle, Clock, Award, QrCode } from 'lucide-react';

export default function StudentAttendancePage() {
  const { currentUser, tickets, events, certificates } = useStore();

  const studentTickets = tickets.filter(
    (t) =>
      t.userId === currentUser.id ||
      t.participantEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Attendance & Certificate Eligibility</h1>
        <p className="text-xs text-stone-500 mt-1">
          Certificates are issued only to students who attend the event and verify check-in at the entrance.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-base font-bold text-stone-900">Event Attendance Records</h2>
        </div>

        {studentTickets.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            No registered events found to track attendance.
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {studentTickets.map((t) => {
              const event = events.find((e) => e.id === t.eventId);
              const cert = certificates.find(
                (c) =>
                  c.eventId === t.eventId &&
                  (c.recipientEmail.toLowerCase() === t.participantEmail.toLowerCase() ||
                    c.recipientId === currentUser.id)
              );

              return (
                <div key={t.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-stone-900">{t.eventTitle}</h4>
                      {event && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${event.theme.primaryColor}22`,
                            color: event.theme.primaryColor,
                          }}
                        >
                          {event.theme.themeName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      Venue: {t.eventVenue} • Date: {t.eventDate}
                    </p>
                    {t.isCheckedIn ? (
                      <p className="text-xs text-emerald-700 font-medium">
                        ✓ Checked in on {new Date(t.checkedInAt || '').toLocaleString()} by {t.checkedInBy || 'Staff'}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting entrance scan. Present your QR ticket at venue entrance.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {t.isCheckedIn ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Attendance Verified
                        </span>

                        {cert ? (
                          <Link
                            href="/student/certificates"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            View Certificate
                          </Link>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Certificate pending issue</span>
                        )}
                      </div>
                    ) : (
                      <Link
                        href="/student/tickets"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Show QR Ticket
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
