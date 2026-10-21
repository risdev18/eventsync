'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { UserCheck, Shield, GraduationCap, RotateCcw, Lock, Eye, EyeOff, X, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile } from '@/lib/types';

export function DemoRoleSwitcher() {
  const router = useRouter();
  const { currentUser, switchUser, users, resetToDemoData, verifySecurityPassword } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Authentication Switch Modal State
  const [targetUserToSwitch, setTargetUserToSwitch] = useState<UserProfile | null>(null);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCollapse = localStorage.getItem('eventease_hide_demo_bar');
    if (savedCollapse === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem('eventease_hide_demo_bar', String(nextState));
    } catch (e) {}
  };

  const handleReset = () => {
    if (confirm('Reset all demo events, registrations, and tickets back to default clean sample data?')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  const handlePersonaClick = (u: UserProfile) => {
    if (u.id === currentUser.id) return;
    setTargetUserToSwitch(u);
    setEnteredPasscode('');
    setPasscodeError('');
    setShowPasswordText(false);
  };

  const handleConfirmSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserToSwitch) return;

    if (!enteredPasscode.trim()) {
      setPasscodeError('Please enter the password for this account.');
      return;
    }

    const isValid = verifySecurityPassword(targetUserToSwitch.id, enteredPasscode.trim());
    if (!isValid) {
      setPasscodeError('Access Denied: Incorrect password. Unauthorized account switch blocked.');
      return;
    }

    // Successfully verified! Switch user and route to appropriate portal
    switchUser(targetUserToSwitch.id);
    const target = targetUserToSwitch;
    setTargetUserToSwitch(null);
    setEnteredPasscode('');
    setPasscodeError('');

    if (target.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (target.role === 'organizer') {
      router.push('/organizer/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  if (!mounted) {
    return (
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800 min-h-[36px]" suppressHydrationWarning />
    );
  }

  if (isCollapsed) {
    return (
      <div className="bg-stone-950 text-stone-400 text-[11px] py-1 px-4 border-b border-stone-800 flex items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Session: <strong className="text-stone-200">{currentUser.name}</strong> ({currentUser.role.toUpperCase()}{currentUser.branchId ? ` — ${currentUser.branchId.replace('branch-', '').toUpperCase()}` : ''})</span>
        </div>
        <button
          onClick={toggleCollapse}
          className="text-stone-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <span>Switch User Account</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3" suppressHydrationWarning>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Authenticated Session
            </span>
            <span className="hidden sm:inline text-stone-600">|</span>
            <span className="text-stone-300" suppressHydrationWarning>
              Current Persona: <strong className="text-white" suppressHydrationWarning>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}{currentUser.id === 'user-organizer-ds' ? ' — Data Science Lead' : currentUser.branchId ? ` — ${currentUser.branchId.replace('branch-', '').toUpperCase()} Department` : ''})
            </span>
          </div>

          <div className="flex items-center gap-2" suppressHydrationWarning>
            <span className="text-stone-400 hidden lg:inline flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Switch Account (Password Protected):</span>
            </span>

            {users.map((u) => {
              const isSelected = u.id === currentUser.id;
              const Icon =
                u.role === 'admin' ? Shield : u.role === 'organizer' ? UserCheck : GraduationCap;

              const getPersonaBadge = () => {
                if (u.id === 'user-organizer-ds') return 'Prof. Iyer (DS)';
                if (u.id === 'user-organizer-it') return 'Prof. Ananya (IT)';
                if (u.id === 'user-organizer-aml') return 'Prof. Vikram (AML)';
                if (u.id === 'user-admin') return 'Dean Rajesh (Admin)';
                if (u.id === 'user-riya') return 'Riya (Student)';
                if (u.id === 'user-arjun') return 'Arjun (Student)';
                return `${u.name.split(' ')[0]} (${u.role[0].toUpperCase() + u.role.slice(1)})`;
              };

              return (
                <button
                  key={u.id}
                  onClick={() => handlePersonaClick(u)}
                  suppressHydrationWarning
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 cursor-default'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                  title={isSelected ? `Currently active as ${u.name}` : `Switch to ${u.name} (Requires password)`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{getPersonaBadge()}</span>
                  {!isSelected && <Lock className="w-2.5 h-2.5 text-stone-500 ml-0.5" />}
                </button>
              );
            })}

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
              title="Reset to fresh demo sample state"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden xl:inline">Reset</span>
            </button>

            <button
              onClick={toggleCollapse}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Hide switcher bar for a clean workspace"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PASSWORD AUTHENTICATION MODAL FOR ACCOUNT SWITCHING */}
      {targetUserToSwitch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Account Password Required</span>
              </div>
              <button
                type="button"
                onClick={() => setTargetUserToSwitch(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={targetUserToSwitch.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={targetUserToSwitch.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900">{targetUserToSwitch.name}</p>
                <p className="text-[10px] text-stone-500">{targetUserToSwitch.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-200 text-stone-800">
                  {targetUserToSwitch.role === 'organizer'
                    ? `${targetUserToSwitch.branchId ? targetUserToSwitch.branchId.replace('branch-', '').toUpperCase() : ''} Faculty Counselor`
                    : targetUserToSwitch.role === 'admin'
                    ? 'Super Admin (Dean)'
                    : 'Student Participant'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmSwitch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Enter Account Password</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    autoFocus
                    value={enteredPasscode}
                    onChange={(e) => {
                      setEnteredPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    placeholder="Enter security password..."
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400">
                  {targetUserToSwitch.branchId === 'branch-it'
                    ? 'Default: it2026 or your custom council password'
                    : targetUserToSwitch.branchId === 'branch-ds'
                    ? 'Default: ds2026'
                    : targetUserToSwitch.branchId === 'branch-aml'
                    ? 'Default: aml2026'
                    : targetUserToSwitch.role === 'admin'
                    ? 'Default: admin2026'
                    : 'Default: student2026'}
                </p>
              </div>

              {passcodeError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {passcodeError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserToSwitch(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Authenticate &amp; Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
