'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import {
  Calendar,
  Layers,
  HelpCircle,
  ShieldCheck,
  Bell,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  PlusCircle,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/dateFormat';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, notifications, markNotificationRead, switchRole } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getDashboardLink = () => {
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'organizer') return '/organizer/dashboard';
    return '/student/dashboard';
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Events', href: '/events' },
    { label: 'Branches', href: '/branches' },
    { label: 'Student Registration', href: '/student-registration', highlight: true },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Verify Certificate', href: '/verify-certificate' },
  ];

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex items-center justify-between h-16" suppressHydrationWarning>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20" suppressHydrationWarning>
                <Calendar className="w-5 h-5" />
              </div>
              <div suppressHydrationWarning>
                <span className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1">
                  Event<span className="text-emerald-600">Ease</span>
                </span>
                <span className="text-[10px] block -mt-1 font-medium text-stone-400 uppercase tracking-wider">
                  Smart College Portal
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1">
                Event<span className="text-emerald-600">Ease</span>
              </span>
              <span className="text-[10px] block -mt-1 font-medium text-stone-400 uppercase tracking-wider">
                Smart College Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : link.highlight
                      ? 'text-emerald-700 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 font-semibold border border-emerald-200/80 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {link.highlight && <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-800 text-sm">Notifications</span>
                    <span className="text-xs text-stone-400">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            n.read ? 'bg-stone-50 text-stone-600' : 'bg-emerald-50/70 text-stone-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{n.title}</span>
                            <span suppressHydrationWarning className="text-[10px] text-stone-400">
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-stone-100 text-center">
                    <Link
                      href="/student/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View all in Notifications Hub →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Host Hackathon CTA */}
            <Link
              href="/organizer/events/new"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow-xs hover:shadow transition-all cursor-pointer"
              title="Host a new Hackathon or Technical Event"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
              <span>+ Host Hackathon</span>
            </Link>

            {/* Dashboard CTA */}
            <Link
              href={getDashboardLink()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {currentUser.role === 'admin'
                  ? 'Admin Portal'
                  : currentUser.role === 'organizer'
                  ? 'Organizer Portal'
                  : 'Student Dashboard'}
              </span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-900">{currentUser.name}</p>
                    <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-100 text-stone-700">
                      {currentUser.role === 'organizer'
                        ? `${currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : ''} Faculty Organizer`
                        : currentUser.role === 'admin'
                        ? 'Super Admin (Dean)'
                        : 'Student Participant'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        window.dispatchEvent(new CustomEvent('eventease_open_role_switcher'));
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Switch Presenter Persona</span>
                    </button>

                    <Link
                      href="/student-registration"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Student Registration Portal</span>
                    </Link>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>

                    {currentUser.role === 'student' && (
                      <Link
                        href="/student/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
                      >
                        <User className="w-3.5 h-3.5" />
                        Student Profile
                      </Link>
                    )}

                    {currentUser.role === 'organizer' && (
                      <Link
                        href="/organizer/events"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Managed Events
                      </Link>
                    )}

                    <Link
                      href="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Switch Account / Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions: Persona quick trigger + Menu button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('eventease_open_role_switcher'))}
              className="p-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Switch Persona / Account"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
            </button>

            <Link
              href={getDashboardLink()}
              className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in shadow-xl">
          {/* Active Persona Profile Card & Quick Switcher */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">
                    {currentUser.role === 'admin'
                      ? 'Dean (Admin)'
                      : currentUser.role === 'organizer'
                      ? `${currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : ''} Teacher`
                      : 'Student'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('eventease_open_role_switcher'));
                }}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch Role</span>
              </button>
            </div>
          </div>

          {/* Student Registration Portal Quick Button */}
          <Link
            href="/student-registration"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 font-bold text-xs shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-stone-900">Student Registration Portal</p>
                <p className="text-[10px] text-stone-500 font-normal">One-time registration for hackathons &amp; fests</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white">
              Open
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Bottom Portal Action Buttons */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <Link
              href="/organizer/events/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 text-center"
            >
              <PlusCircle className="w-4 h-4 text-purple-700" />
              <span>+ Host a Hackathon / Event</span>
            </Link>

            <Link
              href={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-center shadow-sm"
            >
              Open Dashboard ({currentUser.role === 'organizer' ? 'Teacher Portal' : currentUser.role === 'admin' ? 'Dean Portal' : 'Student Dashboard'})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
