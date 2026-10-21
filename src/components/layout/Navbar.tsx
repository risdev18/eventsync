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
} from 'lucide-react';

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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {link.label}
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
                            <span className="text-[10px] text-stone-400">
                              {new Date(n.createdAt).toLocaleDateString()}
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

            {/* Host Event CTA (Visible only to organizers and admins; students cannot host) */}
            {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
              <Link
                href="/organizer/events/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 shadow-xs hover:shadow transition-all cursor-pointer"
                title="Organize an event for your branch"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>+ Host Event</span>
              </Link>
            )}

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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href={getDashboardLink()}
              className="p-2 rounded-xl text-emerald-600 bg-emerald-50"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
              <Link
                href="/organizer/events/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 text-center"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Host an Event</span>
              </Link>
            )}
            <Link
              href={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white text-center"
            >
              Open Dashboard ({currentUser.role})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
