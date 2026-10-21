'use client';

import React from 'react';
import { useStore } from '@/lib/store/useStore';
import { Users, Shield, GraduationCap, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const { users, switchUser } = useStore();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          <span>Institutional User Directory</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Review enrolled student accounts, branch faculty organizers, and platform administrators.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Institutional Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Credentials</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const Icon =
                  u.role === 'admin'
                    ? Shield
                    : u.role === 'organizer'
                    ? UserCheck
                    : GraduationCap;

                const roleBadge =
                  u.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : u.role === 'organizer'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800';

                return (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <span className="font-bold text-stone-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-stone-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${roleBadge}`}>
                        <Icon className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500">{u.usn ? `USN: ${u.usn}` : 'Faculty Council'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          switchUser(u.id);
                          alert(`Switched persona to ${u.name} (${u.role})`);
                        }}
                        className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                      >
                        Login as Persona
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
