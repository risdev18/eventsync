'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { ThemedContainer } from '@/components/theme/ThemedContainer';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import {
  Users,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Download,
  AlertCircle,
  QrCode,
  Sparkles,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SampleCertificateModal } from '@/components/certificates/SampleCertificateModal';

export default function DynamicRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { events, currentUser, createRegistration, registrations, branches } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showSampleCert, setShowSampleCert] = useState(false);

  // Form State
  const [isTeam, setIsTeam] = useState<boolean>(true);
  const [teamName, setTeamName] = useState<string>('Team Phoenix');
  const [teamSize, setTeamSize] = useState<number>(2);

  const getLeaderBranch = () => {
    if (!currentUser.branchId) return 'CS';
    const found = branches.find((b) => b.id === currentUser.branchId);
    return found ? found.code : currentUser.branchId.replace('branch-', '').toUpperCase();
  };

  const [members, setMembers] = useState([
    {
      name: currentUser.name || 'Riya Sharma',
      email: currentUser.email || 'riya.sharma@college.edu',
      usn: currentUser.usn || '1MS22CS098',
      branch: getLeaderBranch(),
      year: currentUser.year || '2nd Year',
      phone: currentUser.phone || '+91 98765 43210',
      isLeader: true,
    },
    {
      name: 'Aditya Rao',
      email: 'aditya.rao@college.edu',
      usn: '1MS22CS012',
      branch: 'CS',
      year: '2nd Year',
      phone: '+91 98765 43211',
      isLeader: false,
    },
  ]);

  // Keep leader details synced with currentUser (e.g. when switched or newly registered)
  React.useEffect(() => {
    if (currentUser) {
      const leaderBranch = currentUser.branchId
        ? (branches.find((b) => b.id === currentUser.branchId)?.code ||
            currentUser.branchId.replace('branch-', '').toUpperCase())
        : 'CS';

      setMembers((prev) => [
        {
          name: currentUser.name,
          email: currentUser.email,
          usn: currentUser.usn || prev[0]?.usn || '1MS22CS098',
          branch: leaderBranch,
          year: currentUser.year || prev[0]?.year || '2nd Year',
          phone: currentUser.phone || prev[0]?.phone || '+91 98765 43210',
          isLeader: true,
        },
        ...prev.slice(1),
      ]);
    }
  }, [currentUser, branches]);

  // Payment State
  const [transactionRef, setTransactionRef] = useState<string>('UPI-908129384712');
  const [proofImage, setProofImage] = useState<string>('/images/upi-qr.png');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRegId, setCreatedRegId] = useState<string>('');

  if (!event) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <DemoRoleSwitcher />
        <Navbar />
        <div className="p-8 text-center">
          <p>Event not found.</p>
        </div>
      </div>
    );
  }

  const theme = event.theme;
  const regSettings = event.registrationSettings;
  const paySettings = event.paymentSettings;

  // Validation checks for eligibility & availability
  const now = new Date();
  const isDeadlinePassed = Boolean(
    event.registrationDeadline && now > new Date(event.registrationDeadline)
  );
  const isFullCapacity = event.registeredCount >= event.capacity;
  const existingUserRegistration = registrations.find(
    (r) =>
      r.eventId === event.id &&
      r.status !== 'cancelled' &&
      r.status !== 'rejected' &&
      (r.userId === currentUser.id ||
        r.members.some(
          (m) =>
            m.email.toLowerCase() === currentUser.email.toLowerCase() ||
            (currentUser.usn && m.usn.toLowerCase() === currentUser.usn.toLowerCase())
        ))
  );
  const isRegistrationBlocked = Boolean(
    existingUserRegistration || isDeadlinePassed || isFullCapacity
  );

  // Calculate dynamic amount
  const calculatedFee = !paySettings.isPaid
    ? 0
    : paySettings.feeType === 'per_team'
    ? paySettings.feeAmount
    : paySettings.feeAmount * members.length;

  // Handle Team Size change
  const handleTeamSizeChange = (newSize: number) => {
    setTeamSize(newSize);
    if (newSize > members.length) {
      const addedCount = newSize - members.length;
      const newItems = Array.from({ length: addedCount }).map((_, i) => ({
        name: `Member ${members.length + i + 1}`,
        email: `member${members.length + i + 1}@college.edu`,
        usn: `1MS22CS0${members.length + i + 1}0`,
        branch: 'CS',
        year: '2nd Year',
        phone: '',
        isLeader: false,
      }));
      setMembers([...members, ...newItems]);
    } else if (newSize < members.length) {
      setMembers(members.slice(0, newSize));
    }
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleAddMember = () => {
    if (members.length < regSettings.maxTeamSize) {
      handleTeamSizeChange(members.length + 1);
    }
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length > regSettings.minTeamSize && idx > 0) {
      setMembers(members.filter((_, i) => i !== idx));
      setTeamSize(members.length - 1);
    }
  };

  // Step 1 validation
  const validateStep1 = () => {
    if (isTeam && !teamName.trim()) {
      setErrorMsg('Please enter a team name.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Step 2 validation
  const validateStep2 = () => {
    const emails = new Set();
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim() || !m.email.trim()) {
        setErrorMsg(`Please complete all required fields for Member ${i + 1}`);
        return false;
      }
      if (emails.has(m.email.toLowerCase())) {
        setErrorMsg(`Duplicate email found: ${m.email}. Each team member must have a unique email.`);
        return false;
      }
      emails.add(m.email.toLowerCase());
    }
    setErrorMsg('');
    return true;
  };

  // Submission
  const handleSubmitRegistration = () => {
    if (paySettings.isPaid && !transactionRef.trim()) {
      setErrorMsg('Please enter the UPI Transaction Reference / UTR number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { registration } = createRegistration({
        eventId: event.id,
        isTeam,
        teamName: isTeam ? teamName : undefined,
        members,
        totalAmount: calculatedFee,
        transactionRef: paySettings.isPaid ? transactionRef : undefined,
        proofImageUrl: proofImage,
      });

      setCreatedRegId(registration.id);
      setCurrentStep(4);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please check form details.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      {/* THEMED REGISTRATION PAGE WRAPPER */}
      <ThemedContainer theme={theme} className="flex-1 py-10 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Title with Themed styling */}
          <div className="text-center space-y-2">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-75 hover:opacity-100 mb-1"
              style={{ color: theme.textColor }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Event Details</span>
            </Link>

            <h1
              className="text-2xl sm:text-4xl font-black uppercase tracking-tight"
              style={{ color: theme.textColor }}
            >
              Register for {event.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md">
                Theme: {theme.themeName}
              </div>
              <button
                type="button"
                onClick={() => setShowSampleCert(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/25 transition-all cursor-pointer backdrop-blur-md shadow-sm"
                style={{ color: theme.textColor }}
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Preview Sample Certificate</span>
              </button>
            </div>
          </div>

          {/* THEMED HERO ARTWORK BANNER */}
          <div
            className="relative rounded-3xl overflow-hidden border shadow-2xl"
            style={{ borderColor: `${theme.primaryColor}55` }}
          >
            <div className="relative aspect-[21/7] sm:aspect-[21/6] w-full bg-stone-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.bannerUrl || theme.posterUrl || '/images/theme-tech.jpg'}
                alt={theme.themeName}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${theme.backgroundColor} 0%, ${theme.backgroundColor}CC 45%, transparent 100%)`,
                }}
              />
            </div>

            {/* Banner Information Overlay */}
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow"
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: theme.backgroundColor,
                      }}
                    >
                      {theme.badgeText || `${theme.themeName} Edition`}
                    </span>
                    <span className="text-xs text-white/80 font-medium">
                      Official Team Registration
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {event.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs">
                  <div>
                    <span className="block text-[10px] opacity-70">Team Limit</span>
                    <span className="font-bold text-white">
                      {regSettings.minTeamSize}-{regSettings.maxTeamSize} Members
                    </span>
                  </div>
                  <div className="w-px h-6 bg-white/20" />
                  <div>
                    <span className="block text-[10px] opacity-70">Registration Fee</span>
                    <span className="font-bold" style={{ color: theme.primaryColor }}>
                      {paySettings.isPaid ? `₹${paySettings.feeAmount} (${paySettings.feeType === 'per_team' ? 'team' : 'person'})` : 'Free Entry'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation matching reference mockup */}
          <div
            className="p-3 sm:p-4 rounded-2xl border shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: `${theme.surfaceColor}EE`,
              borderColor: `${theme.primaryColor}33`,
            }}
          >
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: 'Team Details' },
                { step: 2, label: 'Members' },
                { step: 3, label: 'Payment' },
                { step: 4, label: 'Confirm' },
              ].map((s) => {
                const isCurrent = currentStep === s.step;
                const isDone = currentStep > s.step;

                return (
                  <div key={s.step} className="flex-1 flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow ${
                        isCurrent
                          ? 'ring-2 scale-110'
                          : isDone
                          ? 'opacity-90'
                          : 'opacity-40'
                      }`}
                      style={{
                        backgroundColor: isCurrent || isDone ? theme.primaryColor : '#334155',
                        color: theme.backgroundColor,
                        boxShadow: isCurrent ? `0 0 12px ${theme.primaryColor}` : 'none',
                      }}
                    >
                      {isDone ? <CheckCircle className="w-4 h-4" /> : s.step}
                    </div>
                    <span className="text-[11px] font-medium mt-1 hidden sm:inline opacity-80">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Existing Registration Banner */}
          {existingUserRegistration && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500 text-amber-100 text-xs space-y-3 backdrop-blur-md">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                <span>You Are Already Registered for This Event</span>
              </div>
              <p className="leading-relaxed">
                Our records show an active registration for <strong>{event.title}</strong> under ID{' '}
                <strong className="font-mono text-white bg-black/40 px-2 py-0.5 rounded">
                  {existingUserRegistration.id}
                </strong>{' '}
                (Status:{' '}
                <span className="capitalize font-bold text-amber-200">
                  {existingUserRegistration.status}
                </span>
                ). Duplicate registrations are blocked to preserve quota availability for fellow students.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {existingUserRegistration.status === 'confirmed' && (
                  <Link
                    href="/student/tickets"
                    className="px-3.5 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    View Entry Tickets
                  </Link>
                )}
                <Link
                  href="/student/registrations"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Go to My Registrations
                </Link>
              </div>
            </div>
          )}

          {/* Registration Deadline Passed Banner */}
          {!existingUserRegistration && isDeadlinePassed && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="block font-bold text-sm text-red-100">Registration Has Closed</strong>
                <span>
                  The registration cutoff for this event was{' '}
                  <strong>{new Date(event.registrationDeadline).toLocaleString()}</strong>. No new entries
                  are being accepted.
                </span>
              </div>
            </div>
          )}

          {/* Full Capacity Banner */}
          {!existingUserRegistration && !isDeadlinePassed && isFullCapacity && (
            <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs flex items-center gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="block font-bold text-sm text-amber-100">
                  Event at Full Capacity ({event.capacity}/{event.capacity} Seats Filled)
                </strong>
                <span>
                  All available seats for this event have been reserved. Registration is currently locked.
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card Form Body */}
          <div
            className="p-6 sm:p-8 rounded-2xl border shadow-2xl backdrop-blur-md space-y-6"
            style={{
              backgroundColor: `${theme.surfaceColor}F2`,
              borderColor: `${theme.primaryColor}44`,
            }}
          >
            {/* STEP 1: TEAM DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">1. Team Configuration</h3>
                  <p className="text-xs opacity-70">
                    Set up your team name and permitted team size for {event.title}.
                  </p>
                </div>

                {/* Profile Auto-Fill Confirmation Banner */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="opacity-90">
                      Registering as: <strong>{currentUser.name}</strong> ({currentUser.usn || 'Verified Student'} • {members[0]?.branch})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    Profile Auto-Filled ✓
                  </span>
                </div>

                {/* Team or Individual Toggle */}
                {regSettings.allowIndividual && (
                  <div className="flex gap-4 p-1.5 rounded-xl bg-white/5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTeam(false);
                        handleTeamSizeChange(1);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                        !isTeam ? 'bg-white/20 shadow' : 'opacity-60'
                      }`}
                    >
                      Individual Participant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTeam(true);
                        handleTeamSizeChange(Math.max(2, regSettings.minTeamSize));
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                        isTeam ? 'bg-white/20 shadow' : 'opacity-60'
                      }`}
                    >
                      Team Registration
                    </button>
                  </div>
                )}

                {isTeam && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Team Name *</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. ByteBites, Phoenix, CodeMasters..."
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-sm outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Select Team Size ({regSettings.minTeamSize} to {regSettings.maxTeamSize} members) *
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => handleTeamSizeChange(Number(e.target.value))}
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-sm outline-none focus:border-white transition-colors"
                      >
                        {Array.from({
                          length: regSettings.maxTeamSize - regSettings.minTeamSize + 1,
                        }).map((_, i) => {
                          const size = regSettings.minTeamSize + i;
                          return (
                            <option key={size} value={size} className="bg-stone-900 text-white">
                              {size} Members
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </>
                )}

                {/* Continue button */}
                <button
                  type="button"
                  disabled={isRegistrationBlocked}
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.backgroundColor,
                  }}
                >
                  <span>
                    {existingUserRegistration
                      ? 'Already Registered'
                      : isDeadlinePassed
                      ? 'Registration Closed'
                      : isFullCapacity
                      ? 'Capacity Reached'
                      : 'Continue to Member Details'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: DYNAMIC MEMBERS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">2. Team Member Information</h3>
                    <p className="text-xs opacity-70">
                      Enter full name, college email, USN, and academic branch for each member.
                    </p>
                  </div>
                  {members.length < regSettings.maxTeamSize && isTeam && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: theme.primaryColor }}
                        >
                          {idx === 0 ? 'Member 1 (Team Leader)' : `Member ${idx + 1}`}
                        </span>

                        {idx > 0 && members.length > regSettings.minTeamSize && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] opacity-80">Full Name *</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            placeholder="Student Name"
                            className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-xs outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] opacity-80">College Email *</label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            placeholder="student@college.edu"
                            className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-xs outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] opacity-80">USN / Roll Number *</label>
                          <input
                            type="text"
                            value={member.usn}
                            onChange={(e) => handleMemberChange(idx, 'usn', e.target.value)}
                            placeholder="1MS22CS..."
                            className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-xs outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] opacity-80">Branch / Year *</label>
                          <input
                            type="text"
                            value={`${member.branch} - ${member.year}`}
                            onChange={(e) => handleMemberChange(idx, 'branch', e.target.value)}
                            placeholder="CS - 2nd Year"
                            className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-xs outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        if (paySettings.isPaid) {
                          setCurrentStep(3);
                        } else {
                          handleSubmitRegistration();
                        }
                      }
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.backgroundColor,
                    }}
                  >
                    <span>{paySettings.isPaid ? 'Continue to Payment' : 'Confirm Registration (Free)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: UPI PAYMENT */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">3. QR-Based Event Payment</h3>
                  <p className="text-xs opacity-70">
                    Scan the organizer&apos;s UPI QR code to complete the registration fee.
                  </p>
                </div>

                {/* Amount Highlight Box */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs opacity-70">Total Amount Payable:</span>
                    <p className="text-2xl font-black" style={{ color: theme.primaryColor }}>
                      ₹{calculatedFee}
                    </p>
                    <span className="text-[11px] opacity-60">
                      ({paySettings.feeType === 'per_team' ? 'Per Team Fee' : `₹${paySettings.feeAmount} x ${members.length} members`})
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Manual Organizer Verification
                  </span>
                </div>

                {/* QR Code Container matching reference */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paySettings.qrImageUrl || '/images/upi-qr.png'}
                    alt="UPI Payment QR"
                    className="w-40 h-40 bg-white p-2 rounded-xl shadow-lg shrink-0 object-contain"
                  />

                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-sm">Payment QR Code</h4>
                    <p className="opacity-80">
                      Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to pay the registration fee.
                    </p>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 space-y-1">
                      <p>
                        <strong className="opacity-70">Payee Name:</strong> {paySettings.payeeName}
                      </p>
                      <p>
                        <strong className="opacity-70">UPI ID:</strong> {paySettings.upiId}
                      </p>
                    </div>

                    <a
                      href={paySettings.qrImageUrl || '/images/upi-qr.png'}
                      download="EventEase_UPI_QR.png"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download QR
                    </a>
                  </div>
                </div>

                {/* UTR Input & Screenshot Proof */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">
                      12-Digit UPI Transaction ID / Reference (UTR) *
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 409281749281"
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-sm outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Payment Proof Screenshot *</label>
                    <div className="p-4 rounded-xl border border-dashed border-white/20 bg-black/30 text-center space-y-2">
                      <Upload className="w-6 h-6 mx-auto opacity-60" />
                      <p className="text-xs opacity-70">
                        {proofImage ? 'Payment proof attached (UPI screenshot)' : 'Upload payment confirmation screenshot'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setProofImage('/images/upi-qr.png')}
                        className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/20 cursor-pointer"
                      >
                        {proofImage ? 'Change Proof Image' : 'Attach Demo Screenshot'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="py-2.5 px-4 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitRegistration}
                    className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.backgroundColor,
                    }}
                  >
                    <span>{isSubmitting ? 'Submitting Registration...' : 'Submit Payment & Register'}</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {currentStep === 4 && (
              <div className="text-center py-6 space-y-5">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-2xl"
                  style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
                >
                  <Sparkles className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black">Registration Successfully Submitted!</h3>
                  <p className="text-xs sm:text-sm opacity-80 mt-1 max-w-md mx-auto">
                    {paySettings.isPaid
                      ? 'Your registration and payment reference have been sent to the branch organizer for verification. Once approved, your tickets will activate automatically!'
                      : 'Your registration is confirmed and tickets are ready!'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 max-w-sm mx-auto text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="opacity-70">Event:</span>
                    <span className="font-semibold">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Team Name:</span>
                    <span className="font-semibold">{teamName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Members:</span>
                    <span className="font-semibold">{members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Status:</span>
                    <span className="text-emerald-400 font-bold">
                      {paySettings.isPaid ? 'Awaiting Payment Verification' : 'Confirmed'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <Link
                    href="/student/tickets"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.backgroundColor,
                    }}
                  >
                    View My Tickets
                  </Link>
                  <Link
                    href="/student/dashboard"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold border border-white/20 hover:bg-white/10"
                  >
                    Go to Student Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample Certificate Modal */}
        <SampleCertificateModal
          event={event}
          isOpen={showSampleCert}
          onClose={() => setShowSampleCert(false)}
        />
      </ThemedContainer>
    </div>
  );
}
