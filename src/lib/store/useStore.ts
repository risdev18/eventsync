'use client';

import { useSyncExternalStore, useCallback, useMemo, useState, useEffect } from 'react';
import {
  UserProfile,
  Branch,
  CollegeEvent,
  Registration,
  PaymentSubmission,
  Ticket,
  AttendanceRecord,
  EventResult,
  Certificate,
  InAppNotification,
  AuditLog,
  EventTheme,
  EventStatus,
  UserRole,
  TeamMember,
  EventCertificateSettings,
} from '../types';
import {
  getSnapshot,
  getServerSnapshot,
  subscribeToStore,
  updateGlobalState,
  resetState,
  AppState,
} from './store';

export function useStore() {
  const state = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    updateGlobalState(updater);
  }, []);

  // Current User helpers
  const currentUser = useMemo(() => {
    return state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  }, [state.users, state.currentUserId]);

  const switchUser = useCallback(
    (userId: string) => {
      updateState((prev) => ({ ...prev, currentUserId: userId }));
    },
    [updateState]
  );

  const switchRole = useCallback(
    (role: UserRole) => {
      updateState((prev) => {
        const targetUser = prev.users.find((u) => u.role === role) || prev.users[0];
        return { ...prev, currentUserId: targetUser.id };
      });
    },
    [updateState]
  );

  // Event actions
  const createEvent = useCallback(
    (eventData: Omit<CollegeEvent, 'id' | 'createdAt' | 'registeredCount'>) => {
      // Strictly enforce that branch organizers create events ONLY for their own branch
      const enforcedBranchId =
        currentUser.role === 'admin'
          ? eventData.branchId
          : currentUser.branchId || eventData.branchId;

      const newId = `event-${Date.now()}`;
      const newEvent: CollegeEvent = {
        ...eventData,
        branchId: enforcedBranchId,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        id: newId,
        createdAt: new Date().toISOString(),
        registeredCount: 0,
      };

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'EVENT_CREATED',
        details: `Created event "${newEvent.title}" (${enforcedBranchId}) with theme "${newEvent.theme.themeName}"`,
        timestamp: new Date().toISOString(),
      };

      updateState((prev) => ({
        ...prev,
        events: [newEvent, ...prev.events],
        auditLogs: [newLog, ...prev.auditLogs],
      }));

      return newEvent;
    },
    [currentUser, updateState]
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<CollegeEvent>) => {
      updateState((prev) => {
        const evt = prev.events.find((e) => e.id === id);
        if (!evt) return prev;
        if (
          currentUser.role !== 'admin' &&
          currentUser.branchId &&
          evt.branchId !== currentUser.branchId &&
          evt.organizerId !== currentUser.id
        ) {
          console.warn('Unauthorized update on event belonging to another branch');
          return prev;
        }
        return {
          ...prev,
          events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        };
      });
    },
    [currentUser, updateState]
  );

  const updateEventTheme = useCallback(
    (eventId: string, theme: EventTheme) => {
      updateState((prev) => {
        const evt = prev.events.find((e) => e.id === eventId);
        if (!evt) return prev;
        if (
          currentUser.role !== 'admin' &&
          currentUser.branchId &&
          evt.branchId !== currentUser.branchId &&
          evt.organizerId !== currentUser.id
        ) {
          console.warn('Unauthorized theme update on event belonging to another branch');
          return prev;
        }

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'THEME_UPDATED',
          details: `Updated theme for event "${evt?.title || eventId}" to "${theme.themeName}"`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prev,
          events: prev.events.map((e) => (e.id === eventId ? { ...e, theme } : e)),
          auditLogs: [newLog, ...prev.auditLogs],
        };
      });
    },
    [currentUser, updateState]
  );

  const updateEventStatus = useCallback(
    (id: string, status: EventStatus) => {
      updateState((prev) => {
        const evt = prev.events.find((e) => e.id === id);
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'STATUS_UPDATED',
          details: `Changed status of "${evt?.title || id}" to ${status}`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prev,
          events: prev.events.map((e) => (e.id === id ? { ...e, status } : e)),
          auditLogs: [newLog, ...prev.auditLogs],
        };
      });
    },
    [currentUser, updateState]
  );

  // Registration & Payment submission
  const createRegistration = useCallback(
    (data: {
      eventId: string;
      isTeam: boolean;
      teamName?: string;
      members: Array<Omit<TeamMember, 'id'>>;
      totalAmount: number;
      transactionRef?: string;
      proofImageUrl?: string;
    }) => {
      const regId = `reg-${Date.now()}`;
      const now = new Date().toISOString();
      const event = state.events.find((e) => e.id === data.eventId);
      if (!event) {
        throw new Error('Event not found.');
      }

      // 1. Registration deadline check
      if (new Date() > new Date(event.registrationDeadline)) {
        throw new Error(`Registration deadline passed on ${new Date(event.registrationDeadline).toLocaleDateString()}.`);
      }

      // 2. Capacity enforcement
      if (event.registeredCount >= event.capacity) {
        throw new Error(`Event is at full capacity (${event.capacity} seats). Registrations are closed.`);
      }

      // 3. Duplicate registration check for current student and team member emails
      const incomingEmails = new Set(data.members.map((m) => m.email.toLowerCase().trim()));
      if (currentUser.email) {
        incomingEmails.add(currentUser.email.toLowerCase().trim());
      }

      const activeEventRegs = state.registrations.filter(
        (r) => r.eventId === data.eventId && r.status !== 'cancelled' && r.status !== 'rejected'
      );

      const hasDuplicate = activeEventRegs.some((r) => {
        if (r.userId === currentUser.id) return true;
        return r.members.some((m) => incomingEmails.has(m.email.toLowerCase().trim()));
      });

      if (hasDuplicate) {
        throw new Error('You or one of your team members is already registered for this event.');
      }

      const teamMembers: TeamMember[] = data.members.map((m, idx) => ({
        ...m,
        id: `mem-${Date.now()}-${idx}`,
      }));

      const isPaid = event?.paymentSettings.isPaid && data.totalAmount > 0;
      const paymentStatus = !isPaid
        ? 'not_required'
        : data.transactionRef
        ? 'submitted'
        : 'awaiting_submission';

      const regStatus = !isPaid
        ? 'confirmed'
        : data.transactionRef
        ? 'submitted'
        : 'pending_payment';

      const newRegistration: Registration = {
        id: regId,
        eventId: data.eventId,
        userId: currentUser.id,
        isTeam: data.isTeam,
        teamName: data.teamName,
        teamSize: data.members.length,
        members: teamMembers,
        status: regStatus,
        paymentStatus,
        totalAmount: data.totalAmount,
        createdAt: now,
        verifiedAt: !isPaid ? now : undefined,
      };

      let newPayment: PaymentSubmission | undefined = undefined;
      if (isPaid && data.transactionRef) {
        newPayment = {
          id: `pay-${Date.now()}`,
          registrationId: regId,
          eventId: data.eventId,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          amount: data.totalAmount,
          transactionRef: data.transactionRef,
          proofImageUrl: data.proofImageUrl || '/images/upi-qr.png',
          status: 'submitted',
          submittedAt: now,
        };
        newRegistration.paymentSubmissionId = newPayment.id;
      }

      // Generate Tickets immediately if confirmed (free event)
      const newTickets: Ticket[] = [];
      if (regStatus === 'confirmed') {
        teamMembers.forEach((member, i) => {
          newTickets.push({
            id: `tkt-${Date.now()}-${i}`,
            ticketCode: `TKT-${event?.branchId.replace('branch-', '').toUpperCase() || 'EVT'}-${Math.floor(
              10000 + Math.random() * 90000
            )}-${i + 1}`,
            registrationId: regId,
            eventId: data.eventId,
            userId: member.email === currentUser.email ? currentUser.id : `guest-${i}`,
            participantName: member.name,
            participantEmail: member.email,
            teamName: data.teamName,
            eventTitle: event?.title || 'College Event',
            eventDate: event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD',
            eventVenue: event?.venue || 'Campus Venue',
            isCheckedIn: false,
          });
        });
      }

      const newNotification: InAppNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: regStatus === 'confirmed' ? 'Registration Confirmed! 🎟️' : 'Payment Submitted ⏳',
        message:
          regStatus === 'confirmed'
            ? `You have successfully registered for ${event?.title}! Your tickets are available in your dashboard.`
            : `Registration for ${event?.title} submitted. The organizer is reviewing your payment proof.`,
        type: regStatus === 'confirmed' ? 'success' : 'info',
        link: regStatus === 'confirmed' ? '/student/tickets' : '/student/registrations',
        eventId: data.eventId,
        read: false,
        createdAt: now,
      };

      updateState((prev) => ({
        ...prev,
        registrations: [newRegistration, ...prev.registrations],
        payments: newPayment ? [newPayment, ...prev.payments] : prev.payments,
        tickets: [...newTickets, ...prev.tickets],
        notifications: [newNotification, ...prev.notifications],
        events: prev.events.map((e) =>
          e.id === data.eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
        ),
      }));

      return { registration: newRegistration, payment: newPayment };
    },
    [currentUser, state.events, state.registrations, updateState]
  );

  // Student Registration Cancellation
  const cancelRegistration = useCallback(
    (registrationId: string, reason?: string) => {
      updateState((prev) => {
        const reg = prev.registrations.find((r) => r.id === registrationId);
        if (!reg) return prev;

        const event = prev.events.find((e) => e.id === reg.eventId);
        const now = new Date().toISOString();

        const updatedRegs = prev.registrations.map((r) =>
          r.id === registrationId ? { ...r, status: 'cancelled' as const } : r
        );

        // Decrement registered count on the event
        const updatedEvents = prev.events.map((e) =>
          e.id === reg.eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e
        );

        // Remove or invalidate active tickets
        const updatedTickets = prev.tickets.filter((t) => t.registrationId !== registrationId);

        const newNotification: InAppNotification = {
          id: `notif-${Date.now()}`,
          userId: reg.userId,
          title: 'Registration Cancelled ❌',
          message: `Your registration for "${event?.title || 'Event'}" has been cancelled successfully.${
            reason ? ` Note: ${reason}` : ''
          }`,
          type: 'info',
          link: '/student/registrations',
          eventId: reg.eventId,
          read: false,
          createdAt: now,
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'REGISTRATION_CANCELLED',
          details: `Cancelled registration ${registrationId} for event "${event?.title || reg.eventId}"`,
          timestamp: now,
        };

        return {
          ...prev,
          registrations: updatedRegs,
          events: updatedEvents,
          tickets: updatedTickets,
          notifications: [newNotification, ...prev.notifications],
          auditLogs: [newLog, ...prev.auditLogs],
        };
      });
      return { success: true, message: 'Registration cancelled successfully.' };
    },
    [currentUser, updateState]
  );

  // Bookmark Helpers (Local Storage Sync)
  const getBookmarks = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('eventease_bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const toggleBookmark = useCallback((eventId: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem('eventease_bookmarks');
      const list: string[] = raw ? JSON.parse(raw) : [];
      let nextList: string[];
      let isSaved = false;
      if (list.includes(eventId)) {
        nextList = list.filter((id) => id !== eventId);
        isSaved = false;
      } else {
        nextList = [...list, eventId];
        isSaved = true;
      }
      localStorage.setItem('eventease_bookmarks', JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent('eventease_bookmarks_updated', { detail: nextList }));
      return isSaved;
    } catch {
      return false;
    }
  }, []);

  // Event Creation Wizard Draft Helpers
  const saveDraftEvent = useCallback((draftData: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('eventease_event_wizard_draft', JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to save wizard draft:', e);
    }
  }, []);

  const loadDraftEvent = useCallback((): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('eventease_event_wizard_draft');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraftEvent = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('eventease_event_wizard_draft');
    } catch {}
  }, []);

  // Payment Verification
  const verifyPayment = useCallback(
    (submissionId: string, reviewerId: string, reviewerName: string) => {
      updateState((prev) => {
        const payment = prev.payments.find((p) => p.id === submissionId);
        if (!payment) return prev;

        const reg = prev.registrations.find((r) => r.id === payment.registrationId);
        const event = prev.events.find((e) => e.id === payment.eventId);
        const now = new Date().toISOString();

        // Generate tickets for all team members
        const newTickets: Ticket[] = [];
        if (reg) {
          reg.members.forEach((m, i) => {
            newTickets.push({
              id: `tkt-${Date.now()}-${i}`,
              ticketCode: `TKT-${event?.branchId.replace('branch-', '').toUpperCase() || 'EVT'}-${Math.floor(
                10000 + Math.random() * 90000
              )}-${i + 1}`,
              registrationId: reg.id,
              eventId: payment.eventId,
              userId: m.email === reg.members[0].email ? reg.userId : `guest-${i}`,
              participantName: m.name,
              participantEmail: m.email,
              teamName: reg.teamName,
              eventTitle: event?.title || 'College Event',
              eventDate: event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD',
              eventVenue: event?.venue || 'Campus Venue',
              isCheckedIn: false,
            });
          });
        }

        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          userId: payment.userId,
          title: 'Payment Verified 🎉',
          message: `Your payment of ₹${payment.amount} for "${event?.title}" has been verified! Your event tickets are now generated.`,
          type: 'success',
          link: '/student/tickets',
          eventId: payment.eventId,
          read: false,
          createdAt: now,
        };

        const audit: AuditLog = {
          id: `log-${Date.now()}`,
          userId: reviewerId,
          userName: reviewerName,
          userRole: 'organizer',
          action: 'PAYMENT_VERIFIED',
          details: `Verified ₹${payment.amount} payment for ${reg?.teamName || payment.userName} (UTR: ${payment.transactionRef})`,
          timestamp: now,
        };

        return {
          ...prev,
          payments: prev.payments.map((p) =>
            p.id === submissionId
              ? { ...p, status: 'verified', reviewerId, reviewerName, reviewedAt: now }
              : p
          ),
          registrations: prev.registrations.map((r) =>
            r.id === payment.registrationId
              ? { ...r, status: 'confirmed', paymentStatus: 'verified', verifiedAt: now }
              : r
          ),
          tickets: [...newTickets, ...prev.tickets],
          notifications: [notif, ...prev.notifications],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });
    },
    [updateState]
  );

  const rejectPayment = useCallback(
    (submissionId: string, reason: string, reviewerId: string, reviewerName: string) => {
      updateState((prev) => {
        const payment = prev.payments.find((p) => p.id === submissionId);
        if (!payment) return prev;

        const event = prev.events.find((e) => e.id === payment.eventId);
        const now = new Date().toISOString();

        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          userId: payment.userId,
          title: 'Payment Rejected ⚠️',
          message: `Payment verification for "${event?.title}" was rejected: "${reason}". Please review transaction details in registrations.`,
          type: 'warning',
          link: '/student/registrations',
          eventId: payment.eventId,
          read: false,
          createdAt: now,
        };

        const audit: AuditLog = {
          id: `log-${Date.now()}`,
          userId: reviewerId,
          userName: reviewerName,
          userRole: 'organizer',
          action: 'PAYMENT_REJECTED',
          details: `Rejected payment for ${payment.userName} (Reason: ${reason})`,
          timestamp: now,
        };

        return {
          ...prev,
          payments: prev.payments.map((p) =>
            p.id === submissionId
              ? {
                  ...p,
                  status: 'rejected',
                  rejectionReason: reason,
                  reviewerId,
                  reviewerName,
                  reviewedAt: now,
                }
              : p
          ),
          registrations: prev.registrations.map((r) =>
            r.id === payment.registrationId
              ? { ...r, status: 'rejected', paymentStatus: 'rejected' }
              : r
          ),
          notifications: [notif, ...prev.notifications],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });
    },
    [updateState]
  );

  // Ticket Attendance Check-in
  const checkInTicket = useCallback(
    (ticketCode: string, checkedInBy: string) => {
      const ticket = state.tickets.find((t) => t.ticketCode.trim().toUpperCase() === ticketCode.trim().toUpperCase());
      if (!ticket) {
        return { success: false, message: 'Invalid ticket code. Ticket not found in platform records.' };
      }
      if (ticket.isCheckedIn) {
        return {
          success: false,
          message: `Ticket already checked in on ${new Date(ticket.checkedInAt || '').toLocaleTimeString()} by ${ticket.checkedInBy || 'Staff'}. Duplicate scan rejected!`,
          ticket,
        };
      }

      const now = new Date().toISOString();
      const newAttendance: AttendanceRecord = {
        id: `att-${Date.now()}`,
        eventId: ticket.eventId,
        ticketId: ticket.id,
        registrationId: ticket.registrationId,
        participantName: ticket.participantName,
        participantEmail: ticket.participantEmail,
        teamName: ticket.teamName,
        timestamp: now,
        verifiedBy: checkedInBy,
      };

      const notif: InAppNotification = {
        id: `notif-${Date.now()}`,
        userId: ticket.userId,
        title: 'Check-In Confirmed 🎟️',
        message: `Welcome to ${ticket.eventTitle}! Your attendance has been verified.`,
        type: 'info',
        link: '/student/attendance',
        eventId: ticket.eventId,
        read: false,
        createdAt: now,
      };

      updateState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticket.id
            ? { ...t, isCheckedIn: true, checkedInAt: now, checkedInBy }
            : t
        ),
        attendance: [newAttendance, ...prev.attendance],
        notifications: [notif, ...prev.notifications],
      }));

      return { success: true, message: `Successfully checked in ${ticket.participantName}!`, ticket };
    },
    [state.tickets, updateState]
  );

  // Results & Winner Management
  const publishResults = useCallback(
    (
      eventId: string,
      placements: Array<{
        placement: 1 | 2 | 3;
        teamName: string;
        registrationId: string;
        score?: number;
        notes?: string;
        members: Array<{ name: string; email: string }>;
      }>,
      confirmedBy: string
    ) => {
      const now = new Date().toISOString();
      const event = state.events.find((e) => e.id === eventId);
      if (!event) return;

      const newResults: EventResult[] = placements.map((p, idx) => ({
        id: `res-${Date.now()}-${idx}`,
        eventId,
        registrationId: p.registrationId,
        teamName: p.teamName,
        placement: p.placement,
        members: p.members,
        score: p.score,
        notes: p.notes,
        confirmedBy,
        publishedAt: now,
      }));

      // Automatically generate Winner Certificates for every member of the winning teams!
      const newWinnerCertificates: Certificate[] = [];
      placements.forEach((p) => {
        const awardTitle =
          p.placement === 1
            ? 'Certificate of Achievement - 1st Position'
            : p.placement === 2
            ? 'Certificate of Achievement - 2nd Position'
            : 'Certificate of Achievement - 3rd Position';

        p.members.forEach((member, mIdx) => {
          newWinnerCertificates.push({
            id: `cert-win-${Date.now()}-${p.placement}-${mIdx}`,
            certificateNumber: `CERT-${event.branchId.replace('branch-', '').toUpperCase()}-WIN${p.placement}-2026-${Math.floor(
              100 + Math.random() * 900
            )}`,
            eventId: event.id,
            eventTitle: event.title,
            branchName: event.branchId.replace('branch-', '').toUpperCase(),
            recipientName: member.name,
            recipientEmail: member.email,
            teamName: p.teamName,
            type: 'winner',
            awardCategory: awardTitle,
            placement: p.placement,
            eventDate: `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`,
            issueDate: now,
            qrVerificationCode: `EVNT-VRFY-${event.id.toUpperCase()}-WIN${p.placement}-${mIdx}`,
            signatories: event.certificateSettings.signatories,
            isRevoked: false,
            theme: event.theme,
            photoTemplateUrl:
              event.certificateSettings?.templateMode === 'photo_template'
                ? event.certificateSettings.photoTemplateUrl
                : undefined,
            photoSettings:
              event.certificateSettings?.templateMode === 'photo_template'
                ? event.certificateSettings.photoSettings
                : undefined,
            customTemplateHtml:
              event.certificateSettings?.templateMode === 'chatgpt_custom'
                ? event.certificateSettings.customChatGPTTemplate
                : undefined,
          });
        });
      });

      const audit: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        userName: confirmedBy,
        userRole: 'organizer',
        action: 'RESULTS_PUBLISHED',
        details: `Published official winners for "${event.title}" and auto-generated ${newWinnerCertificates.length} winner certificates`,
        timestamp: now,
      };

      updateState((prev) => ({
        ...prev,
        results: [...newResults, ...prev.results.filter((r) => r.eventId !== eventId)],
        certificates: [...newWinnerCertificates, ...prev.certificates],
        auditLogs: [audit, ...prev.auditLogs],
      }));
    },
    [currentUser, state.events, updateState]
  );

  // Generate Participation Certificates (for attendees only)
  const generateParticipationCertificates = useCallback(
    (eventId: string) => {
      const event = state.events.find((e) => e.id === eventId);
      if (!event) return { count: 0 };

      // Find all attendees for this event
      const attendees = state.attendance.filter((a) => a.eventId === eventId);
      const existingCerts = state.certificates.filter(
        (c) => c.eventId === eventId && c.type === 'participation'
      );
      const existingEmails = new Set(existingCerts.map((c) => c.recipientEmail));

      const now = new Date().toISOString();
      const newCerts: Certificate[] = [];

      attendees.forEach((att, idx) => {
        if (!existingEmails.has(att.participantEmail)) {
          newCerts.push({
            id: `cert-part-${Date.now()}-${idx}`,
            certificateNumber: `CERT-${event.branchId.replace('branch-', '').toUpperCase()}-PART-2026-${Math.floor(
              100 + Math.random() * 900
            )}`,
            eventId: event.id,
            eventTitle: event.title,
            branchName: event.branchId.replace('branch-', '').toUpperCase(),
            recipientName: att.participantName,
            recipientEmail: att.participantEmail,
            teamName: att.teamName,
            type: 'participation',
            awardCategory: 'Certificate of Participation',
            eventDate: `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`,
            issueDate: now,
            qrVerificationCode: `EVNT-VRFY-${event.id.toUpperCase()}-PART-${idx}`,
            signatories: event.certificateSettings.signatories,
            isRevoked: false,
            theme: event.theme,
            photoTemplateUrl:
              event.certificateSettings?.templateMode === 'photo_template'
                ? event.certificateSettings.photoTemplateUrl
                : undefined,
            photoSettings:
              event.certificateSettings?.templateMode === 'photo_template'
                ? event.certificateSettings.photoSettings
                : undefined,
            customTemplateHtml:
              event.certificateSettings?.templateMode === 'chatgpt_custom'
                ? event.certificateSettings.customChatGPTTemplate
                : undefined,
          });
        }
      });

      if (newCerts.length > 0) {
        updateState((prev) => ({
          ...prev,
          certificates: [...newCerts, ...prev.certificates],
        }));
      }

      return { count: newCerts.length };
    },
    [state.events, state.attendance, state.certificates, updateState]
  );

  const updateEventCertificateSettings = useCallback(
    (eventId: string, settings: Partial<EventCertificateSettings>, applyToExistingCerts: boolean = true) => {
      updateState((prev) => {
        const evt = prev.events.find((e) => e.id === eventId);
        if (!evt) return prev;
        if (
          currentUser.role !== 'admin' &&
          currentUser.branchId &&
          evt.branchId !== currentUser.branchId &&
          evt.organizerId !== currentUser.id
        ) {
          console.warn('Unauthorized certificate settings update on event belonging to another branch');
          return prev;
        }
        const updatedCertificateSettings: EventCertificateSettings = {
          ...evt.certificateSettings,
          ...settings,
        };

        const updatedEvents = prev.events.map((e) =>
          e.id === eventId ? { ...e, certificateSettings: updatedCertificateSettings } : e
        );

        let updatedCertificates = prev.certificates;
        if (applyToExistingCerts) {
          const isPhoto = updatedCertificateSettings.templateMode === 'photo_template';
          const isHtml = updatedCertificateSettings.templateMode === 'chatgpt_custom';

          updatedCertificates = prev.certificates.map((c) =>
            c.eventId === eventId
              ? {
                  ...c,
                  photoTemplateUrl: isPhoto ? updatedCertificateSettings.photoTemplateUrl : undefined,
                  photoSettings: isPhoto ? updatedCertificateSettings.photoSettings : undefined,
                  customTemplateHtml: isHtml ? updatedCertificateSettings.customChatGPTTemplate : undefined,
                }
              : c
          );
        }

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CERTIFICATE_REVOKED',
          details: `Updated certificate template settings for "${evt.title}" (${settings.templateMode || 'updated'})`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...prev,
          events: updatedEvents,
          certificates: updatedCertificates,
          auditLogs: [newLog, ...prev.auditLogs],
        };
      });
    },
    [currentUser, updateState]
  );

  const revokeCertificate = useCallback(
    (certId: string, reason: string) => {
      updateState((prev) => ({
        ...prev,
        certificates: prev.certificates.map((c) =>
          c.id === certId ? { ...c, isRevoked: true, revocationReason: reason } : c
        ),
      }));
    },
    [updateState]
  );

  // Notifications
  const markNotificationRead = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    [updateState]
  );

  const clearNotifications = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [updateState]);

  // Organizer Security Passcode & Authorization
  const updateUserSecurityPassword = useCallback(
    (userId: string, newPasscode: string) => {
      updateState((prev) => {
        const updatedUsers = prev.users.map((u) =>
          u.id === userId ? { ...u, securityPassword: newPasscode } : u
        );
        return {
          ...prev,
          users: updatedUsers,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              userId,
              userName: currentUser.name,
              userRole: currentUser.role,
              action: 'SETTINGS_UPDATED',
              details: `Updated council security password for ${currentUser.name} (${currentUser.branchId || 'Admin'})`,
              timestamp: new Date().toISOString(),
            },
            ...prev.auditLogs,
          ],
        };
      });
    },
    [currentUser, updateState]
  );

  const verifySecurityPassword = useCallback(
    (userId: string, enteredPasscode: string): boolean => {
      const targetUser = state.users.find((u) => u.id === userId) || currentUser;
      const expected =
        targetUser?.securityPassword ||
        (targetUser?.branchId === 'branch-ds'
          ? 'ds2026'
          : targetUser?.branchId === 'branch-it'
          ? 'it2026'
          : targetUser?.branchId === 'branch-aml'
          ? 'aml2026'
          : targetUser?.role === 'admin'
          ? 'admin2026'
          : 'student2026');

      return enteredPasscode.trim() === expected.trim();
    },
    [currentUser, state.users]
  );

  const deleteEvent = useCallback(
    (eventId: string, enteredPasscode: string): { success: boolean; message: string } => {
      if (!verifySecurityPassword(currentUser.id, enteredPasscode)) {
        return {
          success: false,
          message: 'Security Passcode Incorrect! You are not authorized to delete this event.',
        };
      }

      const evt = state.events.find((e) => e.id === eventId);
      if (!evt) return { success: false, message: 'Event not found.' };

      if (
        currentUser.role !== 'admin' &&
        currentUser.branchId &&
        evt.branchId !== currentUser.branchId &&
        evt.organizerId !== currentUser.id
      ) {
        return {
          success: false,
          message: 'Branch Restriction: You are not authorized to delete events belonging to another department.',
        };
      }

      updateState((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
        registrations: prev.registrations.filter((r) => r.eventId !== eventId),
        tickets: prev.tickets.filter((t) => t.eventId !== eventId),
        payments: prev.payments.filter((p) => p.eventId !== eventId),
        attendance: prev.attendance.filter((a) => a.eventId !== eventId),
        results: prev.results.filter((res) => res.eventId !== eventId),
        certificates: prev.certificates.filter((c) => c.eventId !== eventId),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: 'EVENT_DELETED',
            details: `Deleted event "${evt.title}" (${evt.branchId}) using verified security password`,
            timestamp: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      }));

      return { success: true, message: `Event "${evt.title}" deleted successfully.` };
    },
    [currentUser, state.events, updateState, verifySecurityPassword]
  );

  const deleteRegistration = useCallback(
    (registrationId: string, enteredPasscode: string): { success: boolean; message: string } => {
      if (!verifySecurityPassword(currentUser.id, enteredPasscode)) {
        return {
          success: false,
          message: 'Security Passcode Incorrect! You are not authorized to delete this participant record.',
        };
      }

      const reg = state.registrations.find((r) => r.id === registrationId);
      if (!reg) return { success: false, message: 'Registration not found.' };

      updateState((prev) => ({
        ...prev,
        registrations: prev.registrations.filter((r) => r.id !== registrationId),
        tickets: prev.tickets.filter((t) => t.registrationId !== registrationId),
        payments: prev.payments.filter((p) => p.registrationId !== registrationId),
        attendance: prev.attendance.filter((a) => a.registrationId !== registrationId),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: 'REGISTRATION_DELETED',
            details: `Deleted participant/team "${reg.teamName || reg.id}" using verified security password`,
            timestamp: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      }));

      return { success: true, message: 'Participant record deleted successfully.' };
    },
    [currentUser, state.registrations, updateState, verifySecurityPassword]
  );

  const resetStudentRegistrations = useCallback(() => {
    updateState((prev) => {
      const email = currentUser.email.toLowerCase();
      const updatedRegs = prev.registrations.filter(
        (r) => r.userId !== currentUser.id && !r.members.some((m) => m.email.toLowerCase() === email)
      );
      const updatedTickets = prev.tickets.filter(
        (t) => t.userId !== currentUser.id && t.participantEmail.toLowerCase() !== email
      );
      const updatedPayments = prev.payments.filter((p) => p.userId !== currentUser.id);

      return {
        ...prev,
        registrations: updatedRegs,
        tickets: updatedTickets,
        payments: updatedPayments,
      };
    });
    return { success: true, message: 'All demo registrations cleared. Ready for fresh registration demo!' };
  }, [currentUser, updateState]);

  // Student Self-Registration Portal
  const registerStudent = useCallback(
    (data: {
      name: string;
      email: string;
      usn: string;
      branchId: string;
      year?: string;
      phone?: string;
      college?: string;
      interests?: string[];
      avatarUrl?: string;
      securityPassword?: string;
    }) => {
      const now = new Date().toISOString();
      const newId = `user-student-${Date.now()}`;
      const newStudent: UserProfile = {
        id: newId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: 'student',
        usn: data.usn.trim().toUpperCase(),
        branchId: data.branchId,
        year: data.year || '1st Year',
        phone: data.phone?.trim() || '+91 98765 00000',
        college: data.college?.trim() || 'College of Engineering & Technology',
        interests: data.interests || ['Hackathons', 'Workshops'],
        avatarUrl:
          data.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        securityPassword: data.securityPassword?.trim() || 'student2026',
      };

      const welcomeNotif: InAppNotification = {
        id: `notif-${Date.now()}`,
        userId: newId,
        title: 'Registration Successful! 🎓',
        message: `Welcome to EventEase, ${newStudent.name}! Your student profile has been registered for ${newStudent.college}.`,
        type: 'success',
        link: '/student/profile',
        read: false,
        createdAt: now,
      };

      const audit: AuditLog = {
        id: `log-${Date.now()}`,
        userId: newId,
        userName: newStudent.name,
        userRole: 'student',
        action: 'STUDENT_REGISTERED',
        details: `Student ${newStudent.name} (${newStudent.usn}) registered in department ${newStudent.branchId}`,
        timestamp: now,
      };

      updateState((prev) => ({
        ...prev,
        currentUserId: newId,
        users: [...prev.users, newStudent],
        notifications: [welcomeNotif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      return newStudent;
    },
    [updateState]
  );

  // Dynamic Academic Branch Creation
  const addBranch = useCallback(
    (branchData: {
      name: string;
      code: string;
      description?: string;
      iconName?: string;
      accentColor?: string;
      coordinatorName?: string;
      coordinatorEmail?: string;
    }) => {
      const cleanCode = branchData.code.trim().toUpperCase();
      const branchId = `branch-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const newBranch: Branch = {
        id: branchId,
        name: branchData.name.trim(),
        code: cleanCode,
        description: branchData.description?.trim() || `${branchData.name.trim()} Department`,
        iconName: branchData.iconName || 'Layers',
        accentColor: branchData.accentColor || '#059669',
        coordinatorName: branchData.coordinatorName?.trim() || 'Department Faculty Head',
        coordinatorEmail:
          branchData.coordinatorEmail?.trim() || `coordinator.${cleanCode.toLowerCase()}@college.edu`,
        active: true,
        eventCount: 0,
      };

      const audit: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'BRANCH_ADDED',
        details: `Created new academic branch "${newBranch.name}" (${newBranch.code})`,
        timestamp: new Date().toISOString(),
      };

      updateState((prev) => {
        if (prev.branches.some((b) => b.id === branchId || b.code === cleanCode)) {
          return prev;
        }
        return {
          ...prev,
          branches: [...prev.branches, newBranch],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      return newBranch;
    },
    [currentUser, updateState]
  );

  const updateStudentProfile = useCallback(
    (userId: string, updates: Partial<UserProfile>) => {
      updateState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
      }));
    },
    [updateState]
  );

  return {
    isHydrated,
    currentUser,
    switchUser,
    switchRole,
    users: state.users,
    branches: state.branches,
    events: state.events,
    registrations: state.registrations,
    payments: state.payments,
    tickets: state.tickets,
    attendance: state.attendance,
    results: state.results,
    certificates: state.certificates,
    notifications: state.notifications,
    auditLogs: state.auditLogs,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteRegistration,
    updateUserSecurityPassword,
    verifySecurityPassword,
    updateEventTheme,
    updateEventStatus,
    createRegistration,
    cancelRegistration,
    resetStudentRegistrations,
    registerStudent,
    addBranch,
    updateStudentProfile,
    getBookmarks,
    toggleBookmark,
    saveDraftEvent,
    loadDraftEvent,
    clearDraftEvent,
    verifyPayment,
    rejectPayment,
    checkInTicket,
    publishResults,
    generateParticipationCertificates,
    updateEventCertificateSettings,
    revokeCertificate,
    markNotificationRead,
    clearNotifications,
    resetToDemoData: resetState,
  };
}
