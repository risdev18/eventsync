'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Award,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function StudentSidebar() {
  const pathname = usePathname();
  const { notifications, currentUser } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Registrations', href: '/student/registrations', icon: CalendarCheck },
    { label: 'Tickets', href: '/student/tickets', icon: QrCode },
    { label: 'Attendance', href: '/student/attendance', icon: CheckCircle2 },
    { label: 'My Certificates', href: '/student/certificates', icon: Award },
    {
      label: 'Notifications',
      href: '/student/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Profile', href: '/student/profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-stone-500 truncate">{currentUser.usn || 'Computer Science'}</p>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
              Student
            </span>
          </div>
        </div>

        {/* Navigation items */}
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
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout / Switch Role */}
      <div className="pt-4 border-t border-stone-200 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Public EventEase Site</span>
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
