'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { formatDate, formatTime } from '@/lib/utils/dateFormat';
import {
  Calendar,
  Users,
  CreditCard,
  QrCode,
  Award,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Palette,
  BarChart2,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Ticket as TicketIcon,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Lock,
  KeyRound,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const {
    events,
    registrations,
    payments,
    tickets,
    attendance,
    currentUser,
    verifyPayment,
    rejectPayment,
    checkInTicket,
    updateUserSecurityPassword,
    verifySecurityPassword,
    deleteEvent,
    deleteRegistration,
  } = useStore();

  // 1. Strict Branch Purview: An organizer is restricted SOLELY to their own branch
  const myEvents = useMemo(() => {
    return events.filter((e) => {
      if (currentUser.role === 'admin') return true;
      if (currentUser.branchId) {
        // STRICT BRANCH ISOLATION: Never show other branch hackathons/datathons!
        return e.branchId === currentUser.branchId;
      }
      return e.organizerId === currentUser.id;
    });
  }, [events, currentUser]);

  // Event selector state: defaults to first event of their branch if available
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return myEvents.length > 0 ? myEvents[0].id : 'ALL';
  });

  // Ensure active selector stays valid if events change
  const activeSelectedEventId = useMemo(() => {
    if (selectedEventId !== 'ALL' && !myEvents.some((e) => e.id === selectedEventId)) {
      return myEvents.length > 0 ? myEvents[0].id : 'ALL';
    }
    return selectedEventId;
  }, [selectedEventId, myEvents]);

  // Search & Filter state for participants directory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING_PAYMENT' | 'CHECKED_IN' | 'NOT_CHECKED_IN'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Security Passcode Dialog State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Password-Protected Deletion Dialog State
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'event' | 'registration';
    id: string;
    title: string;
  } | null>(null);
  const [deletePasscodeInput, setDeletePasscodeInput] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // 2. Active scoped events based on branch and selector
  const activeEvents = useMemo(() => {
    if (activeSelectedEventId === 'ALL') return myEvents;
    return myEvents.filter((e) => e.id === activeSelectedEventId);
  }, [myEvents, activeSelectedEventId]);

  const activeEventIds = useMemo(() => activeEvents.map((e) => e.id), [activeEvents]);

  // 3. Strict Data Scoping: Zero cross-event leakage from other branches/hackathons!
  const scopedRegistrations = useMemo(() => {
    return registrations.filter((r) => activeEventIds.includes(r.eventId));
  }, [registrations, activeEventIds]);

  const scopedPayments = useMemo(() => {
    return payments.filter((p) => activeEventIds.includes(p.eventId));
  }, [payments, activeEventIds]);

  const scopedPendingPayments = useMemo(() => {
    return scopedPayments.filter((p) => p.status === 'submitted');
  }, [scopedPayments]);

  const scopedAttendance = useMemo(() => {
    return attendance.filter((a) => activeEventIds.includes(a.eventId));
  }, [attendance, activeEventIds]);

  const scopedTickets = useMemo(() => {
    return tickets.filter((t) => activeEventIds.includes(t.eventId));
  }, [tickets, activeEventIds]);

  // Scoped metrics
  const totalRegistrations = scopedRegistrations.length;
  const totalVerifiedRevenue = scopedPayments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalAttendance = scopedAttendance.length;

  // Filtered Participants List
  const filteredRegistrations = useMemo(() => {
    return scopedRegistrations.filter((reg) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        reg.teamName?.toLowerCase().includes(q) ||
        reg.members.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.usn && m.usn.toLowerCase().includes(q))
        );

      if (!matchesSearch) return false;

      const regTickets = scopedTickets.filter((t) => t.registrationId === reg.id);
      const isAnyCheckedIn = regTickets.some((t) => t.isCheckedIn);

      if (statusFilter === 'CONFIRMED') return reg.status === 'confirmed';
      if (statusFilter === 'PENDING_PAYMENT') return reg.paymentStatus === 'submitted';
      if (statusFilter === 'CHECKED_IN') return isAnyCheckedIn;
      if (statusFilter === 'NOT_CHECKED_IN') return !isAnyCheckedIn;

      return true;
    });
  }, [scopedRegistrations, scopedTickets, searchQuery, statusFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveSecurityPassword = () => {
    if (!newPasswordInput.trim()) {
      setPasswordErrorMsg('Password cannot be empty.');
      return;
    }
    if (newPasswordInput.length < 4) {
      setPasswordErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    updateUserSecurityPassword(currentUser.id, newPasswordInput.trim());
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('Council security password successfully updated and active!');
    setTimeout(() => {
      setPasswordSuccessMsg('');
      setShowPasswordModal(false);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }, 1800);
  };

  const handleExecuteDelete = () => {
    if (!itemToDelete) return;
    if (!deletePasscodeInput.trim()) {
      setDeleteErrorMsg('Please enter your council security password.');
      return;
    }

    if (itemToDelete.type === 'event') {
      const res = deleteEvent(itemToDelete.id, deletePasscodeInput.trim());
      if (!res.success) {
        setDeleteErrorMsg(res.message);
        return;
      }
      setActionSuccessMsg(res.message);
    } else {
      const res = deleteRegistration(itemToDelete.id, deletePasscodeInput.trim());
      if (!res.success) {
        setDeleteErrorMsg(res.message);
        return;
      }
      setActionSuccessMsg(res.message);
    }

    setItemToDelete(null);
    setDeletePasscodeInput('');
    setDeleteErrorMsg('');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const exportParticipantsCSV = () => {
    if (scopedRegistrations.length === 0) {
      alert('No participants to export for this event.');
      return;
    }

    const headers = [
      'Registration ID',
      'Event Title',
      'Team Name',
      'Participant Name',
      'Email',
      'USN',
      'Branch',
      'Role',
      'Payment Status',
      'Fee Paid',
      'Transaction Ref / UTR',
      'Ticket Code',
      'Checked In',
      'Checked In Time',
      'Registration Date',
    ];

    const rows: string[][] = [];

    scopedRegistrations.forEach((reg) => {
      const evt = events.find((e) => e.id === reg.eventId);
      const payment = payments.find((p) => p.registrationId === reg.id || p.id === reg.paymentSubmissionId);
      const regTickets = tickets.filter((t) => t.registrationId === reg.id);

      reg.members.forEach((mem) => {
        const memTicket = regTickets.find((t) => t.participantEmail === mem.email || t.participantName === mem.name);
        rows.push([
          reg.id,
          evt?.title || reg.eventId,
          reg.teamName || 'Individual',
          mem.name,
          mem.email,
          mem.usn || 'N/A',
          mem.branch || 'N/A',
          mem.isLeader ? 'Leader' : 'Member',
          reg.paymentStatus,
          payment ? String(payment.amount) : String(reg.totalAmount),
          payment?.transactionRef || 'N/A',
          memTicket?.ticketCode || 'N/A',
          memTicket?.isCheckedIn ? 'YES' : 'NO',
          memTicket?.checkedInAt || 'N/A',
          reg.createdAt,
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `participants_${activeEvents[0]?.slug || 'event'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branchDisplay = currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : 'COUNCIL';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse p-4" suppressHydrationWarning>
        <div className="h-44 bg-stone-200/70 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-28 bg-stone-200/70 rounded-2xl" />
          <div className="h-28 bg-stone-200/70 rounded-2xl" />
          <div className="h-28 bg-stone-200/70 rounded-2xl" />
          <div className="h-28 bg-stone-200/70 rounded-2xl" />
        </div>
        <div className="h-96 bg-stone-200/70 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ACTION SUCCESS BANNER */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. WELCOME HEADER WITH BRANCH SCOPE & PASSWORD PROTECTION */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-stone-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {branchDisplay} Department Portal
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Strict Branch Isolation Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {currentUser.name}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl leading-relaxed">
            You are viewing the <strong>{branchDisplay}</strong> branch council. Only events and participants under your branch purview are shown. Other branches (Data Science, IT, AML, CS) are isolated. Password protection is enabled to guard against unauthorized deletions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Set / Manage Council Password Button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 font-bold text-xs border border-stone-700 transition-all cursor-pointer shadow-sm"
            title="Set council security password for deleting events or records"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Council Security Password</span>
          </button>

          <button
            onClick={exportParticipantsCSV}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs border border-stone-700 transition-all cursor-pointer shadow-sm"
            title="Download participants roster as CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Roster (CSV)</span>
          </button>

          <Link
            href="/organizer/events/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* 2. EVENT SCOPE FILTER BAR (Restricted strictly to myEvents of this branch) */}
      {myEvents.length > 1 ? (
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{branchDisplay} Event Focus:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {myEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSelectedEventId === evt.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: evt.theme.primaryColor }}
                />
                <span>{evt.title.split('—')[0].trim()}</span>
              </button>
            ))}

            <button
              onClick={() => setSelectedEventId('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSelectedEventId === 'ALL'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All {branchDisplay} Events ({myEvents.length})
            </button>
          </div>
        </div>
      ) : myEvents.length === 1 ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{myEvents[0].title}</p>
              <p className="text-stone-500">
                Purview: {branchDisplay} Council • Venue: {myEvents[0].venue}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold self-start sm:self-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Strictly Isolated to {branchDisplay}
          </span>
        </div>
      ) : null}

      {/* 3. STRICTLY SCOPED METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Active Events</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{activeEvents.length}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Under {branchDisplay} purview</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Registered Teams</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{totalRegistrations} Teams</h3>
          <p className="text-[11px] text-stone-500 mt-1">
            {scopedRegistrations.reduce((acc, r) => acc + r.members.length, 0)} total participants
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{scopedPendingPayments.length}</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {scopedPendingPayments.length > 0 ? 'Require manual UTR review' : 'All submissions clear'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Checked In Attendees</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900 mt-2">{totalAttendance}</h3>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            ₹{totalVerifiedRevenue} verified revenue
          </p>
        </div>
      </div>

      {/* 4. SCOPED PENDING PAYMENT REVIEW QUEUE */}
      {scopedPendingPayments.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900">
                Payment Verification Queue ({scopedPendingPayments.length} Submissions)
              </h2>
            </div>
            <span className="text-xs text-amber-700 font-medium">
              Only submissions for {branchDisplay} events
            </span>
          </div>

          <div className="space-y-3">
            {scopedPendingPayments.map((p) => {
              const evt = events.find((e) => e.id === p.eventId);
              return (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{p.userName}</span>
                      <span className="text-xs text-stone-500">({p.userEmail})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {evt?.title}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">
                      Amount: <strong>₹{p.amount}</strong> • UTR/Ref:{' '}
                      <span className="font-mono font-bold text-emerald-800">{p.transactionRef}</span> • Submitted: {formatTime(p.submittedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        verifyPayment(p.id, currentUser.id, currentUser.name)
                      }
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify &amp; Activate Ticket
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason for student:', 'Invalid UTR reference number');
                        if (reason) rejectPayment(p.id, reason, currentUser.id, currentUser.name);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MAIN FEATURE: EVENT PARTICIPANTS & TEAMS DIRECTORY */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-stone-900">
                {activeEvents.length === 1
                  ? `${activeEvents[0].title.split('—')[0].trim()} Participants & Teams Directory`
                  : `${branchDisplay} Participants & Teams Directory`}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly showing students and teams participating in {activeEvents.map((e) => e.title.split('—')[0].trim()).join(', ')}. No cross-event contamination.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportParticipantsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Download Roster</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name, team, USN (1MS22...), or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({scopedRegistrations.length})
            </button>
            <button
              onClick={() => setStatusFilter('CONFIRMED')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                statusFilter === 'CONFIRMED'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Confirmed ({scopedRegistrations.filter((r) => r.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_PAYMENT')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                statusFilter === 'PENDING_PAYMENT'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Pending Pay ({scopedRegistrations.filter((r) => r.paymentStatus === 'submitted').length})
            </button>
            <button
              onClick={() => setStatusFilter('CHECKED_IN')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                statusFilter === 'CHECKED_IN'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Checked In ({scopedAttendance.length})
            </button>
          </div>
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Team &amp; Leader</th>
                <th className="py-3.5 px-4">All Team Members</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Ticket Code</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700">No participants found</p>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      {searchQuery
                        ? `No records matching "${searchQuery}" in this ${branchDisplay} event purview.`
                        : `No participants registered for ${branchDisplay} events yet.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const evt = events.find((e) => e.id === reg.eventId);
                  const regTickets = scopedTickets.filter((t) => t.registrationId === reg.id);
                  const payment = scopedPayments.find(
                    (p) => p.registrationId === reg.id || p.id === reg.paymentSubmissionId
                  );
                  const isCheckedIn = regTickets.some((t) => t.isCheckedIn);
                  const leader = reg.members.find((m) => m.isLeader) || reg.members[0];

                  return (
                    <tr key={reg.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Team / Leader */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">
                              {reg.teamName || 'Individual Entry'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                              {reg.members.length} {reg.members.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                          <p className="text-stone-500 text-[11px]">
                            Leader: <strong className="text-stone-800">{leader?.name}</strong>
                          </p>
                          <p className="text-stone-400 text-[10px]">{leader?.email}</p>
                        </div>
                      </td>

                      {/* Team Members List */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {reg.members.map((mem) => {
                            const memTicket = regTickets.find((t) => t.participantEmail === mem.email || t.participantName === mem.name);
                            return (
                              <div
                                key={mem.id || mem.email}
                                className="flex flex-wrap items-center gap-1.5 text-[11px]"
                              >
                                <span className="font-semibold text-stone-800">{mem.name}</span>
                                {mem.usn && (
                                  <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[10px]">
                                    {mem.usn}
                                  </span>
                                )}
                                {mem.branch && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px]">
                                    {mem.branch}
                                  </span>
                                )}
                                {mem.isLeader && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9px]">
                                    Leader
                                  </span>
                                )}
                                {memTicket?.isCheckedIn && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Checked In" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${evt?.theme.primaryColor}22`,
                              color: evt?.theme.primaryColor,
                            }}
                          >
                            {evt?.title.split('—')[0].trim()}
                          </span>
                          <p className="text-[10px] text-stone-400" suppressHydrationWarning>
                            Reg: {formatDate(reg.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 align-top">
                        {reg.paymentStatus === 'verified' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified (₹{reg.totalAmount})
                            </span>
                            {payment?.transactionRef && (
                              <p className="text-[10px] font-mono text-stone-500">
                                {payment.transactionRef}
                              </p>
                            )}
                          </div>
                        ) : reg.paymentStatus === 'submitted' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending Review (₹{reg.totalAmount})
                            </span>
                            {payment && (
                              <button
                                onClick={() => verifyPayment(payment.id, currentUser.id, currentUser.name)}
                                className="block text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                              >
                                ✓ Quick Verify
                              </button>
                            )}
                          </div>
                        ) : reg.paymentStatus === 'not_required' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                            Free Entry
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            {reg.paymentStatus}
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-4 px-4 align-top">
                        {isCheckedIn ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              <QrCode className="w-3 h-3 text-purple-600" />
                              Checked In
                            </span>
                            <p className="text-[10px] text-stone-400">
                              {regTickets.find((t) => t.isCheckedIn)?.checkedInBy || 'Faculty'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500">
                              Pending Entry
                            </span>
                            {regTickets[0] && (
                              <button
                                onClick={() => checkInTicket(regTickets[0].ticketCode, currentUser.name)}
                                className="block text-[10px] font-bold text-purple-700 hover:underline cursor-pointer"
                              >
                                + Check In
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Ticket Code */}
                      <td className="py-4 px-4 align-top">
                        {regTickets.length > 0 ? (
                          <div className="space-y-1">
                            {regTickets.map((tkt) => (
                              <div key={tkt.id} className="flex items-center gap-1">
                                <span className="font-mono text-[10px] font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded">
                                  {tkt.ticketCode}
                                </span>
                                <button
                                  onClick={() => handleCopyCode(tkt.ticketCode)}
                                  className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                                  title="Copy ticket code"
                                >
                                  {copiedCode === tkt.ticketCode ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400">Pending Pay</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {evt && (
                            <>
                              <Link
                                href={`/organizer/events/${evt.id}/attendance`}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                title="Open Attendance Scanner"
                              >
                                <QrCode className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/organizer/events/${evt.id}/certificates`}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Certificates Hub"
                              >
                                <Award className="w-4 h-4" />
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setItemToDelete({
                                type: 'registration',
                                id: reg.id,
                                title: reg.teamName || 'this registration',
                              });
                              setDeletePasscodeInput('');
                              setDeleteErrorMsg('');
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Participant Record (Requires Security Password)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. BRANCH EVENTS MANAGEMENT TABLE WITH PASSWORD PROTECTED ACTIONS */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Manage Your {branchDisplay} Events</h2>
            <p className="text-xs text-stone-500">Theme setup, registrations, attendance check-in, results and certificates</p>
          </div>
          <Link
            href="/organizer/events/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>+ Create Event</span>
          </Link>
        </div>

        <div className="divide-y divide-stone-200">
          {activeEvents.map((evt) => (
            <div key={evt.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-stone-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 overflow-hidden shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.theme.posterUrl || evt.theme.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">{evt.title}</h3>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                      style={{
                        backgroundColor: `${evt.theme.primaryColor}22`,
                        color: evt.theme.primaryColor,
                      }}
                    >
                      Theme: {evt.theme.themeName}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500" suppressHydrationWarning>
                    Dates: {formatDate(evt.startDate)} - {formatDate(evt.endDate)} • Venue: {evt.venue}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-600 pt-0.5">
                    <span>Capacity: <strong>{evt.registeredCount}/{evt.capacity}</strong></span>
                    <span>•</span>
                    <span>Fee: <strong>{evt.paymentSettings.isPaid ? `₹${evt.paymentSettings.feeAmount}` : 'Free'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Event Management Action Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <Link
                  href={`/organizer/events/${evt.id}/theme`}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-stone-700 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Theme Studio
                </Link>

                <Link
                  href={`/organizer/events/${evt.id}/payments`}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-stone-700 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Payments
                </Link>

                <Link
                  href={`/organizer/events/${evt.id}/attendance`}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-stone-700 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Attendance
                </Link>

                <Link
                  href={`/organizer/events/${evt.id}/results`}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 text-xs font-semibold text-stone-700 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Winners &amp; Results
                </Link>

                <Link
                  href={`/organizer/events/${evt.id}/certificates`}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Certificates
                </Link>

                {/* Password-Protected Event Deletion */}
                <button
                  onClick={() => {
                    setItemToDelete({
                      type: 'event',
                      id: evt.id,
                      title: evt.title,
                    });
                    setDeletePasscodeInput('');
                    setDeleteErrorMsg('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Delete Event (Protected by Security Password)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. SET / CHANGE COUNCIL SECURITY PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">Council Security Password</h3>
                  <p className="text-[11px] text-stone-500">{branchDisplay} Branch Authorization Guard</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Setting a password prevents unauthorized organizers or other branches from deleting events, clearing attendance, or modifying your council roster.
                </p>
              </div>
              <p className="text-[11px] text-stone-400 pl-6">
                Default demo password: <code className="font-mono font-bold text-stone-700">{currentUser.branchId === 'branch-ds' ? 'ds2026' : currentUser.branchId === 'branch-it' ? 'it2026' : 'admin2026'}</code>
              </p>
            </div>

            {passwordErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {passwordSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  New Security Password:
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new 4+ character password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSecurityPassword}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Save &amp; Activate Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PASSWORD-PROTECTED DELETION CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900">Authorize Deletion</h3>
                <p className="text-[11px] text-stone-500">Security Password Required</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                You are about to delete: <strong className="text-stone-900">{itemToDelete.title}</strong>.
              </p>
              <p className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px]">
                ⚠️ To prevent unauthorized organizers or accidental deletions, enter your council security password below.
              </p>
            </div>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="text-xs">
              <label className="block font-bold text-stone-700 mb-1">
                Enter Council Security Password:
              </label>
              <input
                type="password"
                value={deletePasscodeInput}
                onChange={(e) => setDeletePasscodeInput(e.target.value)}
                placeholder="Council password (e.g. it2026 or ds2026)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  setItemToDelete(null);
                  setDeletePasscodeInput('');
                  setDeleteErrorMsg('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Verify &amp; Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
