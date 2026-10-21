'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Award, ArrowLeft, Check, Sparkles, AlertCircle, Users, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EventResultsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { events, registrations, results, publishResults, currentUser } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  const eventRegs = registrations.filter((r) => r.eventId === eventId && r.status === 'confirmed');
  const existingResults = results.filter((r) => r.eventId === eventId);

  // Placements selection state
  const [firstPlaceRegId, setFirstPlaceRegId] = useState(
    existingResults.find((r) => r.placement === 1)?.registrationId || eventRegs[0]?.id || ''
  );
  const [secondPlaceRegId, setSecondPlaceRegId] = useState(
    existingResults.find((r) => r.placement === 2)?.registrationId || eventRegs[1]?.id || ''
  );
  const [thirdPlaceRegId, setThirdPlaceRegId] = useState(
    existingResults.find((r) => r.placement === 3)?.registrationId || eventRegs[2]?.id || ''
  );

  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!event) {
    return <div className="p-8 text-center text-xs text-stone-500">Event not found.</div>;
  }

  // Enforce branch organizer purview isolation
  const isAuthorized =
    currentUser.role === 'admin' ||
    event.organizerId === currentUser.id ||
    (currentUser.branchId && event.branchId === currentUser.branchId);

  if (!isAuthorized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">Branch Access Restricted</h2>
        <p className="text-xs text-stone-600">
          This event belongs to another branch ({event.branchId.replace('branch-', '').toUpperCase()}). You are only authorized to manage results for your branch.
        </p>
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
        >
          Return to My Dashboard
        </Link>
      </div>
    );
  }

  const handleConfirmAndPublish = () => {
    // Validation: make sure no duplicate teams selected
    if (firstPlaceRegId === secondPlaceRegId || firstPlaceRegId === thirdPlaceRegId || secondPlaceRegId === thirdPlaceRegId) {
      setErrorMsg('A team cannot be assigned multiple winning placements. Please select distinct teams.');
      return;
    }

    const reg1 = eventRegs.find((r) => r.id === firstPlaceRegId);
    const reg2 = eventRegs.find((r) => r.id === secondPlaceRegId);
    const reg3 = eventRegs.find((r) => r.id === thirdPlaceRegId);

    if (!reg1 || !reg2 || !reg3) {
      setErrorMsg('Please select 1st, 2nd, and 3rd place teams from confirmed participants.');
      return;
    }

    setErrorMsg('');

    const placements = [
      {
        placement: 1 as const,
        teamName: reg1.teamName || reg1.members[0].name,
        registrationId: reg1.id,
        members: reg1.members.map((m) => ({ name: m.name, email: m.email })),
      },
      {
        placement: 2 as const,
        teamName: reg2.teamName || reg2.members[0].name,
        registrationId: reg2.id,
        members: reg2.members.map((m) => ({ name: m.name, email: m.email })),
      },
      {
        placement: 3 as const,
        teamName: reg3.teamName || reg3.members[0].name,
        registrationId: reg3.id,
        members: reg3.members.map((m) => ({ name: m.name, email: m.email })),
      },
    ];

    publishResults(event.id, placements, currentUser.name);
    setPublishedSuccess(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Competition Results &amp; Winner Management</span>
          </h1>
          <p className="text-xs text-stone-500">
            Event: <strong className="text-stone-800">{event.title}</strong> • Publishing confirms rankings and auto-generates certificates for all winning members.
          </p>
        </div>

        {existingResults.length > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
            Results Published
          </span>
        )}
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold">Official Results Published!</p>
              <p className="text-[11px] text-emerald-700">
                Winner certificates have been automatically created for every eligible team member with custom {event.theme.themeName} styling.
              </p>
            </div>
          </div>
          <Link
            href={`/organizer/events/${event.id}/certificates`}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shrink-0"
          >
            Go to Certificates Hub →
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Selection Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-stone-900">Select Winning Teams</h2>
          <p className="text-xs text-stone-500">
            Choose the top 3 placements from confirmed participants. Each member of the winning team receives an individual achievement certificate.
          </p>
        </div>

        <div className="space-y-4">
          {/* 1st Place */}
          <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                🏆 1st Position (Gold Winner)
              </span>
              <span className="text-[10px] text-amber-700 font-bold">1st Place Trophy &amp; Certificates</span>
            </div>

            <select
              value={firstPlaceRegId}
              onChange={(e) => setFirstPlaceRegId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold outline-none"
            >
              <option value="">-- Select 1st Place Team --</option>
              {eventRegs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.teamName || r.members[0].name} ({r.members.length} members: {r.members.map((m) => m.name).join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* 2nd Place */}
          <div className="p-4 rounded-2xl border-2 border-slate-300 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🥈 2nd Position (Silver Winner)
              </span>
              <span className="text-[10px] text-slate-600 font-bold">2nd Place Medals &amp; Certificates</span>
            </div>

            <select
              value={secondPlaceRegId}
              onChange={(e) => setSecondPlaceRegId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
            >
              <option value="">-- Select 2nd Place Team --</option>
              {eventRegs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.teamName || r.members[0].name} ({r.members.length} members: {r.members.map((m) => m.name).join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* 3rd Place */}
          <div className="p-4 rounded-2xl border-2 border-amber-700/30 bg-amber-50/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                🥉 3rd Position (Bronze Winner)
              </span>
              <span className="text-[10px] text-amber-800 font-bold">3rd Place Mementos &amp; Certificates</span>
            </div>

            <select
              value={thirdPlaceRegId}
              onChange={(e) => setThirdPlaceRegId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-amber-700/30 bg-white text-xs font-semibold outline-none"
            >
              <option value="">-- Select 3rd Place Team --</option>
              {eventRegs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.teamName || r.members[0].name} ({r.members.length} members: {r.members.map((m) => m.name).join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Authorizing Organizer: <strong>{currentUser.name}</strong>
          </p>

          <button
            onClick={handleConfirmAndPublish}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm &amp; Publish Official Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}
