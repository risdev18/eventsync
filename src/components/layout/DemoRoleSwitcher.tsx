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

  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCollapse = localStorage.getItem('eventease_hide_demo_bar');
    if (savedCollapse === 'true') {
      setIsCollapsed(true);
    }

    const openHandler = () => setIsPickerModalOpen(true);
    window.addEventListener('eventease_open_role_switcher', openHandler);
    return () => window.removeEventListener('eventease_open_role_switcher', openHandler);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem('eventease_hide_demo_bar', String(nextState));
    } catch (e) {}
  };

  const handleReset = () => {
    if (confirm('Reset demo state back to a clean slate (0 events registered for Riya)?')) {
      try {
        localStorage.removeItem('eventease_v1_data');
        localStorage.removeItem('eventease_v2_fresh_demo');
      } catch (e) {}
      resetToDemoData();
      window.location.reload();
    }
  };

  const handlePersonaClick = (u: UserProfile) => {
    if (u.id === currentUser.id) {
      setIsPickerModalOpen(false);
      return;
    }
    setIsPickerModalOpen(false);
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

  // Filter users into teachers/faculty, students, and admin
  const facultyUsers = users.filter((u) => u.role === 'organizer' || u.role === 'admin');
  const studentUsers = users.filter((u) => u.role === 'student');

  return (
    <>
      {/* 1. MOBILE SLIM BAR (Clean single-line without button clutter) */}
      <div className="sm:hidden bg-stone-900 text-stone-200 text-xs px-3 py-1.5 border-b border-stone-800 flex items-center justify-between shadow-xs" suppressHydrationWarning>
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2" suppressHydrationWarning>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="text-stone-300 text-[11px] truncate">
            Active: <strong className="text-white font-semibold">{currentUser.name}</strong>{' '}
            <span className="text-stone-400">({currentUser.role === 'organizer' ? 'Teacher' : currentUser.role === 'admin' ? 'Dean' : 'Student'})</span>
          </span>
        </div>
        <button
          onClick={() => setIsPickerModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-semibold border border-emerald-500/30 transition-all cursor-pointer"
        >
          <span>Switch Account</span>
          <ChevronDown className="w-3 h-3 text-emerald-200" />
        </button>
      </div>

      {/* 2. DESKTOP / TABLET SLIM BAR */}
      {!isCollapsed ? (
        <div className="hidden sm:block bg-stone-900 text-stone-200 text-xs py-1.5 px-4 border-b border-stone-800" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3" suppressHydrationWarning>
            <div className="flex items-center gap-2 truncate" suppressHydrationWarning>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Authenticated Session
              </span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-300 text-xs truncate" suppressHydrationWarning>
                Current Persona: <strong className="text-white font-semibold">{currentUser.name}</strong> ({currentUser.role.toUpperCase()}{currentUser.id === 'user-organizer-ds' ? ' — Data Science Lead' : currentUser.branchId ? ` — ${currentUser.branchId.replace('branch-', '').toUpperCase()} Dept` : ''})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0" suppressHydrationWarning>
              <button
                onClick={() => setIsPickerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                title="Switch between Students, Faculty, and Admin personas"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch Persona</span>
                <ChevronDown className="w-3 h-3 text-emerald-200" />
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors cursor-pointer text-xs"
                title="Reset to fresh demo sample state"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden xl:inline">Reset Demo</span>
              </button>

              <button
                onClick={toggleCollapse}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Hide bar"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex bg-stone-950 text-stone-400 text-[11px] py-1 px-4 border-b border-stone-800 items-center justify-between" suppressHydrationWarning>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active: <strong className="text-stone-200">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
          </div>
          <button
            onClick={() => setIsPickerModalOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>Switch Persona</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. PERSONA SELECTOR MODAL (Opens cleanly on mobile or desktop) */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Switch Presentation Persona</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select a faculty or student persona to experience role-isolated features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Active Banner */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-950">Active: {currentUser.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {currentUser.role === 'admin'
                      ? 'Dean (Super Administrator)'
                      : currentUser.role === 'organizer'
                      ? `${currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : ''} Faculty Organizer`
                      : 'Student Participant'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-600 text-white">
                Current
              </span>
            </div>

            {/* Section 1: Teachers & Faculty Organizers */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Teachers &amp; Faculty Organizers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {facultyUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  const dept =
                    u.id === 'user-organizer-ds'
                      ? 'Data Science Lead'
                      : u.branchId
                      ? `${u.branchId.replace('branch-', '').toUpperCase()} Dept`
                      : 'Super Admin';
                  return (
                    <button
                      key={u.id}
                      onClick={() => handlePersonaClick(u)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{dept}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-700">
                          {u.role === 'admin' ? 'Full Admin Access' : 'Host Events & Verify UTR'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Students */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  <span>Student Participants</span>
                </div>
                <button
                  onClick={() => {
                    setIsPickerModalOpen(false);
                    router.push('/student-registration');
                  }}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 normal-case cursor-pointer"
                >
                  + Register New Student
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {studentUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handlePersonaClick(u)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {u.usn ? `${u.usn} • ` : ''}{u.branchId ? u.branchId.replace('branch-', '').toUpperCase() : 'Student'}
                        </p>
                        <span className="inline-block mt-0.5 text-[9px] font-semibold text-blue-600">
                          Register, Pay QR, Certificates
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsPickerModalOpen(false);
                  router.push('/student-registration');
                }}
                className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Open Student Registration Portal</span>
              </button>

              <button
                onClick={() => {
                  setIsPickerModalOpen(false);
                  handleReset();
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
