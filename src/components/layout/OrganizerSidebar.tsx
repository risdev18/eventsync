'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  CreditCard,
  QrCode,
  Award,
  BarChart2,
  Sparkles,
  LogOut,
  Palette,
} from 'lucide-react';

export function OrganizerSidebar() {
  const pathname = usePathname();
  const { currentUser, events, payments } = useStore();

  // Find events strictly belonging to this organizer's branch
  const myEvents = events.filter((e) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.branchId) {
      return e.branchId === currentUser.branchId;
    }
    return e.organizerId === currentUser.id;
  });

  const activeEvent = myEvents[0] || events[0];
  const myEventIds = myEvents.map((e) => e.id);

  // Scoped pending payments strictly for this organizer's events
  const pendingPayments = payments.filter(
    (p) => myEventIds.includes(p.eventId) && p.status === 'submitted'
  ).length;

  const links = [
    { label: 'Organizer Dashboard', href: '/organizer/dashboard', icon: LayoutDashboard },
    { label: 'Branch Events', href: '/organizer/events', icon: Calendar },
    { label: 'Create New Event', href: '/organizer/events/new', icon: PlusCircle },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Organizer Council Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30 shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-stone-500 truncate">
              {currentUser.branchId ? `${currentUser.branchId.replace('branch-', '').toUpperCase()} Council` : 'Faculty Council'}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-600 text-white">
              Organizer
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/30'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Branch Event Shortcuts */}
        {activeEvent && (
          <div className="pt-2 border-t border-stone-100 space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 truncate" title={activeEvent.title}>
              Manage {activeEvent.title.split('—')[0].trim()}
            </p>
            <Link
              href={`/organizer/events/${activeEvent.id}/payments`}
              className="flex items-center justify-between px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 rounded-xl"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                Verify Payments
              </span>
              {pendingPayments > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                  {pendingPayments}
                </span>
              )}
            </Link>
            <Link
              href={`/organizer/events/${activeEvent.id}/attendance`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 rounded-xl"
            >
              <QrCode className="w-3.5 h-3.5 text-stone-400" />
              Attendance Scanner
            </Link>
            <Link
              href={`/organizer/events/${activeEvent.id}/results`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 rounded-xl"
            >
              <Award className="w-3.5 h-3.5 text-stone-400" />
              Results &amp; Winners
            </Link>
            <Link
              href={`/organizer/events/${activeEvent.id}/certificates`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              Certificates Hub
            </Link>
            <Link
              href={`/organizer/events/${activeEvent.id}/theme`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 rounded-xl"
            >
              <Palette className="w-3.5 h-3.5 text-stone-400" />
              Theme Studio
            </Link>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-stone-200 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Main Website</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account</span>
        </Link>
      </div>
    </aside>
  );
}
