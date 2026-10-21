'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Layers, Plus, Mail, CheckCircle, Shield } from 'lucide-react';

export default function AdminBranchesPage() {
  const { branches, events } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newEmail, setNewEmail] = useState('');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            <span>Branch Council Governance</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Authorize departments and assign faculty coordinators to manage events and sign certificates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Branch</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-stone-100">
          {branches.map((b) => {
            const branchEvents = events.filter((e) => e.branchId === b.id);
            return (
              <div
                key={b.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: b.accentColor }}
                  >
                    {b.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{b.name}</h3>
                    <p className="text-xs text-stone-500">
                      Coordinator: <strong>{b.coordinatorName}</strong> ({b.coordinatorEmail})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-stone-600">
                    {branchEvents.length} Events Listed
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active Branch
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-stone-900">Add Academic Branch</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical & Electronics Engineering"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Branch Code</label>
                <input
                  type="text"
                  placeholder="e.g. EEE"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Faculty Coordinator</label>
                <input
                  type="text"
                  placeholder="Prof. Name"
                  value={newCoordinator}
                  onChange={(e) => setNewCoordinator(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Coordinator Email</label>
                <input
                  type="email"
                  placeholder="coord@college.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Branch council added to platform registry.');
                  setShowAddModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Save Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
