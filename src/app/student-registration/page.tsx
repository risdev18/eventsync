'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  GraduationCap,
  User,
  Mail,
  Hash,
  Phone,
  Building2,
  Lock,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Tag,
  X,
  Layers,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '@/lib/types';

export default function StudentRegistrationPage() {
  const router = useRouter();
  const { branches, registerStudent, addBranch, users } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch-cs');
  const [year, setYear] = useState('2nd Year');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('College of Engineering & Technology');
  const [password, setPassword] = useState('student2026');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Web Development',
    'AI & Machine Learning',
  ]);

  // New Branch Modal State
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchCoordinator, setNewBranchCoordinator] = useState('');
  const [newBranchColor, setNewBranchColor] = useState('#059669');
  const [branchError, setBranchError] = useState('');

  // Submission State
  const [registeredStudent, setRegisteredStudent] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions = [
    'Web Development',
    'AI & Machine Learning',
    'Cybersecurity',
    'Cloud & DevOps',
    'Robotics & IoT',
    'UI/UX Design',
    'Competitive Coding',
    'Data Science & Analytics',
    'Paper Presentation',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleCreateNewBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError('');

    if (!newBranchName.trim() || !newBranchCode.trim()) {
      setBranchError('Please enter both branch name and branch code.');
      return;
    }

    const code = newBranchCode.trim().toUpperCase();
    if (branches.some((b) => b.code.toUpperCase() === code)) {
      setBranchError(`Branch with code "${code}" already exists in the system.`);
      return;
    }

    const created = addBranch({
      name: newBranchName.trim(),
      code: code,
      description: `Innovative research & technical symposiums in ${newBranchName.trim()}.`,
      accentColor: newBranchColor,
      coordinatorName: newBranchCoordinator.trim() || 'Faculty Branch Coordinator',
      coordinatorEmail: `coordinator.${code.toLowerCase()}@college.edu`,
    });

    setBranchId(created.id);
    setShowAddBranchModal(false);
    setNewBranchName('');
    setNewBranchCode('');
    setNewBranchCoordinator('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !usn.trim()) {
      setErrorMessage('Please fill in your Name, Email, and USN / Roll number.');
      return;
    }

    // Check if USN or Email is already registered
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ||
        (u.usn && u.usn.toUpperCase() === usn.trim().toUpperCase())
    );

    if (existing) {
      setErrorMessage(
        `An account with this ${
          existing.email.toLowerCase() === email.trim().toLowerCase() ? 'Email' : 'USN'
        } already exists (${existing.name}). You can switch to this account directly!`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const student = registerStudent({
        name,
        email,
        usn,
        branchId,
        year,
        phone: phone || '+91 98765 00000',
        college,
        interests: selectedInterests,
        securityPassword: password || 'student2026',
      });

      setRegisteredStudent(student);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch (err) {}
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBranchData = branches.find((b) => b.id === branchId) || branches[0];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Centralized Student Registration Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            One-Time Student Registration
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Register your institutional profile once. Your verified USN, department, and credentials will auto-fill across all college hackathons, technical symposiums, and automated certificates!
          </p>
        </div>

        {/* Feature Badges for Teachers presentation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">1-Click Event Auto-Fill</h4>
              <p className="text-[11px] text-stone-500">No retyping USN, phone, or branch every time.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Verified Certificates</h4>
              <p className="text-[11px] text-stone-500">Auto-issued with tamper-proof QR verification.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Multi-Branch Ecosystem</h4>
              <p className="text-[11px] text-stone-500">Add or participate in any academic branch.</p>
            </div>
          </div>
        </div>

        {/* Success Card or Registration Form */}
        {registeredStudent ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xl space-y-6 animate-in fade-in zoom-in-95 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-stone-900">Student Profile Successfully Registered!</h2>
              <p className="text-xs text-stone-500">
                You are now signed in as <strong className="text-stone-800">{registeredStudent.name}</strong>. Your profile is permanently stored for all college events.
              </p>
            </div>

            {/* Generated Digital Student ID Badge */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-xl relative overflow-hidden border border-stone-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="flex items-start justify-between relative z-10 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    EE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-tight text-white">EventEase Student Pass</h4>
                    <span className="text-[9px] text-stone-400 uppercase tracking-widest">{registeredStudent.college}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Active
                </span>
              </div>

              <div className="pt-4 flex items-center gap-4 relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={registeredStudent.avatarUrl}
                  alt={registeredStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/50 shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-white truncate">{registeredStudent.name}</h3>
                  <p className="text-xs text-stone-300 font-mono">USN: {registeredStudent.usn}</p>
                  <p className="text-xs text-emerald-400">
                    {registeredStudent.year} • {selectedBranchData?.name || registeredStudent.branchId} ({selectedBranchData?.code || 'CS'})
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">{registeredStudent.email}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Security Password: <strong>{registeredStudent.securityPassword}</strong></span>
                </span>
                <span className="font-mono text-emerald-400">SYNCED: 100%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/events"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Browse &amp; Register for Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/student/dashboard"
                className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Go to Student Dashboard</span>
              </Link>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegisteredStudent(null);
                  setName('');
                  setEmail('');
                  setUsn('');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                + Register another student profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-xl font-black text-stone-900">Student Profile Information</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                All details will be saved to your local session and automatically populate during event checkouts.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>College Email ID *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohan.sharma@college.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* USN / Roll No & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-stone-400" />
                    <span>USN / PRN / Roll Number *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 1MS22CS105"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-mono outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Contact / WhatsApp Number</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 12345"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Branch / Department Selection WITH "+ Add New Branch" capability */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Academic Branch / Department *</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddBranchModal(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add New Branch</span>
                  </button>
                </div>

                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — Faculty: {b.coordinatorName}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400">
                  Can&apos;t find your department? Click &quot;+ Add New Branch&quot; above to create and link it immediately!
                </p>
              </div>

              {/* Year of Study & College Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                    <span>Year of Study *</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Pre-Final)</option>
                    <option value="4th Year">4th Year (Final Year)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>College Name</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Account Password (for role switcher demo)</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. student2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
                <p className="text-[10px] text-stone-400">
                  Default password for fast demo switching: <code className="text-emerald-700 font-mono">student2026</code>
                </p>
              </div>

              {/* Technical Interests */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span>Areas of Interest / Skills</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestOptions.map((item) => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Complete Student Registration &amp; Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Demo Profiles Reference for Evaluators / Teachers */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Registered Students Directory</h3>
              <p className="text-xs text-stone-500">Currently active student profiles in this college demo.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {users.filter((u) => u.role === 'student').length} Students Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users
              .filter((u) => u.role === 'student')
              .map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-emerald-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-stone-500 truncate font-mono">{u.usn || 'No USN'}</p>
                    <span className="text-[9px] font-bold text-emerald-700 uppercase">
                      {u.branchId ? u.branchId.replace('branch-', '') : 'Student'} • {u.year || '2nd Year'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* MODAL TO ADD A NEW BRANCH ON THE FLY */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Add New Academic Branch</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBranchModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Create a new department in the college portal. This branch will immediately be available for student enrollment, event hosting, and dynamic theme isolation.
            </p>

            {branchError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {branchError}
              </div>
            )}

            <form onSubmit={handleCreateNewBranch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Department / Branch Name *</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Civil Engineering, Electronics, Biotechnology"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CIVIL, ECE, BT"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-mono outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBranchColor}
                      onChange={(e) => setNewBranchColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono text-stone-600">{newBranchColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Faculty Coordinator Name</label>
                <input
                  type="text"
                  value={newBranchCoordinator}
                  onChange={(e) => setNewBranchCoordinator(e.target.value)}
                  placeholder="e.g. Prof. R. K. Joshi"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Branch &amp; Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
