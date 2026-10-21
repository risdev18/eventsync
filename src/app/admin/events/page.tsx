'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, Eye, Palette } from 'lucide-react';

export default function AdminEventsPage() {
  const { events, updateEventStatus } = useStore();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          <span>Platform Events Oversight</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Review, approve, suspend, or feature events submitted across all college branch councils.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-stone-100">
          {events.map((evt) => (
            <div key={evt.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-900 overflow-hidden shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.theme.posterUrl || evt.theme.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{evt.title}</h3>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${evt.theme.primaryColor}22`,
                        color: evt.theme.primaryColor,
                      }}
                    >
                      Theme: {evt.theme.themeName}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Organizer: {evt.organizerName} • Branch: {evt.branchId.replace('branch-', '').toUpperCase()}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Registered: {evt.registeredCount}/{evt.capacity} • Status:{' '}
                    <span className="font-semibold uppercase text-stone-700">{evt.status}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/events/${evt.id}`}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>

                {evt.status === 'published' ? (
                  <button
                    onClick={() => updateEventStatus(evt.id, 'registration_closed')}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold cursor-pointer"
                  >
                    Close Registrations
                  </button>
                ) : (
                  <button
                    onClick={() => updateEventStatus(evt.id, 'published')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
