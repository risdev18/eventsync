'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';

export default function StudentNotificationsPage() {
  const { notifications, markNotificationRead, clearNotifications } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Notifications Center</h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time in-app alerts for payment verifications, attendance check-ins, and certificate readiness.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">No notifications to display.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {notifications.map((n) => {
              const Icon =
                n.type === 'success'
                  ? CheckCircle2
                  : n.type === 'warning'
                  ? AlertTriangle
                  : Info;

              const iconColor =
                n.type === 'success'
                  ? 'text-emerald-600 bg-emerald-50'
                  : n.type === 'warning'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-blue-600 bg-blue-50';

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                    n.read ? 'bg-white opacity-80' : 'bg-emerald-50/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900">{n.title}</h4>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-block text-xs font-bold text-emerald-700 hover:underline pt-1"
                      >
                        Open related portal →
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
