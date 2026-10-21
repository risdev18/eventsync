'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import {
  Shield,
  LayoutDashboard,
  Layers,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Sparkles,
  LogOut,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const links = [
    { label: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Branches Council', href: '/admin/branches', icon: Layers },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Platform Events', href: '/admin/events', icon: Calendar },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Admin Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-600/30 shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-stone-500 truncate">Dean of Student Affairs</p>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-600 text-white">
              Super Admin
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
                    ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
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
