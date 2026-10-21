'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '@/lib/store/useStore';
import { Ticket, CollegeEvent } from '@/lib/types';
import { QrCode, Calendar, MapPin, Users, CheckCircle2, AlertCircle, Download, Printer } from 'lucide-react';
import Link from 'next/link';

function TicketItem({ ticket, event }: { ticket: Ticket; event?: CollegeEvent }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code for ticket verification
    QRCode.toDataURL(ticket.ticketCode, {
      margin: 1,
      width: 250,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [ticket.ticketCode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-md flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-200">
      {/* Left Details Panel */}
      <div className="p-6 sm:p-8 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Verified Event Ticket
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              ticket.isCheckedIn
                ? 'bg-emerald-500 text-white'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {ticket.isCheckedIn ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Checked In
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Ready for Scan
              </>
            )}
          </span>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900">{ticket.eventTitle}</h3>
          {event && (
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
              Theme: {event.theme.themeName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ticket.eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ticket.eventVenue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Participant: {ticket.participantName}</span>
          </div>
          {ticket.teamName && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Team:</span>
              <span>{ticket.teamName}</span>
            </div>
          )}
        </div>

        {ticket.isCheckedIn && ticket.checkedInAt && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span>
              Attendance verified on {new Date(ticket.checkedInAt).toLocaleTimeString()}
            </span>
            <span className="font-semibold">Verified by {ticket.checkedInBy || 'Organizer'}</span>
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ticket
          </button>
        </div>
      </div>

      {/* Right QR Code Stub */}
      <div className="p-6 sm:p-8 bg-stone-50 flex flex-col items-center justify-center text-center w-full md:w-64 space-y-3 shrink-0">
        <div className="p-2 bg-white rounded-2xl shadow border border-stone-200">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Ticket QR" className="w-36 h-36 object-contain" />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-stone-300 animate-pulse" />
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Ticket ID
          </span>
          <p className="text-xs font-mono font-bold text-stone-800 tracking-wider">
            {ticket.ticketCode}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentTicketsPage() {
  const { currentUser, tickets, events } = useStore();

  const studentTickets = tickets.filter(
    (t) =>
      t.userId === currentUser.id ||
      t.participantEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">My Event Tickets</h1>
        <p className="text-xs text-stone-500 mt-1">
          Present your QR ticket at the venue check-in desk to record verified attendance.
        </p>
      </div>

      {studentTickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <QrCode className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No active tickets</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once your event registration is confirmed or payment is verified by the organizer, your ticket will appear here automatically.
          </p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {studentTickets.map((t) => {
            const event = events.find((e) => e.id === t.eventId);
            return <TicketItem key={t.id} ticket={t} event={event} />;
          })}
        </div>
      )}
    </div>
  );
}
