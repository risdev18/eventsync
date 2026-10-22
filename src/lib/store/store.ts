'use client';

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
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_PAYMENTS,
  INITIAL_TICKETS,
  INITIAL_ATTENDANCE,
  INITIAL_RESULTS,
  INITIAL_CERTIFICATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './initialData';

const STORAGE_KEY = 'eventsync_v3_authority';

export interface AppState {
  currentUserId: string;
  collegeName: string;
  users: UserProfile[];
  branches: Branch[];
  events: CollegeEvent[];
  registrations: Registration[];
  payments: PaymentSubmission[];
  tickets: Ticket[];
  attendance: AttendanceRecord[];
  results: EventResult[];
  certificates: Certificate[];
  notifications: InAppNotification[];
  auditLogs: AuditLog[];
}

export function getDefaultState(): AppState {
  return {
    currentUserId: 'user-riya', // Default logged-in demo user (Student Riya Sharma)
    collegeName: 'College of Engineering & Technology',
    users: INITIAL_USERS,
    branches: INITIAL_BRANCHES,
    events: INITIAL_EVENTS,
    registrations: INITIAL_REGISTRATIONS,
    payments: INITIAL_PAYMENTS,
    tickets: INITIAL_TICKETS,
    attendance: INITIAL_ATTENDANCE,
    results: INITIAL_RESULTS,
    certificates: INITIAL_CERTIFICATES,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

// 1. Cached immutable server snapshot to guarantee stable reference and avoid infinite loops
const CACHED_SERVER_SNAPSHOT: AppState = Object.freeze(getDefaultState());

// 2. In-memory singleton client state
let inMemoryState: AppState | null = null;
const listeners = new Set<() => void>();

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error notifying store subscriber:', err);
    }
  });
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return CACHED_SERVER_SNAPSHOT;
  if (inMemoryState) return inMemoryState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      inMemoryState = CACHED_SERVER_SNAPSHOT;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CACHED_SERVER_SNAPSHOT));
      } catch (e) {
        // storage quota or private window
      }
      return inMemoryState;
    }
    const parsed = JSON.parse(raw);

    // 1. Merge default users (including Datathon organizer user-organizer-ds) and security passwords
    const mergedUsers = Array.isArray(parsed.users) ? [...parsed.users] : [...INITIAL_USERS];
    INITIAL_USERS.forEach((initUser) => {
      const idx = mergedUsers.findIndex((u) => u.id === initUser.id);
      if (idx === -1) {
        mergedUsers.push(initUser);
      } else {
        mergedUsers[idx] = {
          ...initUser,
          ...mergedUsers[idx],
          securityPassword:
            mergedUsers[idx].securityPassword ||
            initUser.securityPassword ||
            (mergedUsers[idx].branchId === 'branch-ds'
              ? 'ds2026'
              : mergedUsers[idx].branchId === 'branch-it'
              ? 'it2026'
              : mergedUsers[idx].branchId === 'branch-aml'
              ? 'aml2026'
              : mergedUsers[idx].branchId === 'branch-cs'
              ? 'cs2026'
              : mergedUsers[idx].role === 'admin'
              ? 'admin2026'
              : 'student2026'),
        };
      }
    });

    // 2. Ensure initial events (including event-ds-datathon) are present and CyberGrid is bound to CS
    const mergedEvents = (Array.isArray(parsed.events) ? [...parsed.events] : [...INITIAL_EVENTS]).map((e) => {
      if (e.id === 'event-cs-hackathon' && e.organizerId === 'user-organizer-it') {
        return { ...e, organizerId: 'user-organizer-cs', branchId: 'branch-cs' };
      }
      return e;
    });

    INITIAL_EVENTS.forEach((initEvt) => {
      if (!mergedEvents.some((e) => e.id === initEvt.id)) {
        mergedEvents.push(initEvt);
      }
    });

    // 3. Ensure custom & default branches are preserved
    const mergedBranches = Array.isArray(parsed.branches) ? [...parsed.branches] : [...INITIAL_BRANCHES];
    INITIAL_BRANCHES.forEach((initB) => {
      if (!mergedBranches.some((b) => b.id === initB.id)) {
        mergedBranches.push(initB);
      }
    });

    // 4. Guarantee Riya Sharma (the demo presenter) starts with clean 0 registrations
    const cleanRegistrations = (
      Array.isArray(parsed.registrations) ? parsed.registrations : INITIAL_REGISTRATIONS
    ).filter(
      (r: Registration) =>
        r.userId !== 'user-riya' &&
        !r.members?.some((m) => m.email?.toLowerCase() === 'riya.sharma@college.edu')
    );
    const cleanTickets = (Array.isArray(parsed.tickets) ? parsed.tickets : INITIAL_TICKETS).filter(
      (t: Ticket) =>
        t.userId !== 'user-riya' && t.participantEmail?.toLowerCase() !== 'riya.sharma@college.edu'
    );
    const cleanPayments = (
      Array.isArray(parsed.payments) ? parsed.payments : INITIAL_PAYMENTS
    ).filter((p: PaymentSubmission) => p.userId !== 'user-riya');

    const effectiveCollegeName =
      parsed.collegeName && !parsed.collegeName.startsWith('EventEase')
        ? parsed.collegeName
        : 'College of Engineering & Technology';

    const nowMs = Date.now();
    const sanitizedEvents = mergedEvents.map((e: CollegeEvent) => {
      const cur = e.certificateSettings?.collegeName;
      let evt = e;
      if (!cur || cur.startsWith('EventEase')) {
        evt = {
          ...evt,
          certificateSettings: {
            ...evt.certificateSettings,
            collegeName: effectiveCollegeName,
          },
        };
      }

      // Automatically renew deadlines if expired so presentation and live demo never fail
      const deadlineMs = new Date(evt.registrationDeadline).getTime();
      if (isNaN(deadlineMs) || deadlineMs < nowMs) {
        evt = {
          ...evt,
          registrationDeadline: new Date(nowMs + 14 * 86400000).toISOString(),
          startDate: new Date(nowMs + 16 * 86400000).toISOString(),
          endDate: new Date(nowMs + 18 * 86400000).toISOString(),
        };
      }

      return evt;
    });

    const rawCerts = Array.isArray(parsed.certificates) ? parsed.certificates : INITIAL_CERTIFICATES;
    const sanitizedCerts = rawCerts.map((c: Certificate) => {
      if (!c.collegeName || c.collegeName.startsWith('EventEase')) {
        return {
          ...c,
          collegeName: effectiveCollegeName,
        };
      }
      return c;
    });

    inMemoryState = {
      ...getDefaultState(),
      ...parsed,
      collegeName: effectiveCollegeName,
      users: mergedUsers,
      branches: mergedBranches,
      events: sanitizedEvents,
      certificates: sanitizedCerts,
      registrations: cleanRegistrations,
      tickets: cleanTickets,
      payments: cleanPayments,
    };
    return inMemoryState as AppState;
  } catch (err) {
    console.error('Failed to load local state:', err);
    inMemoryState = CACHED_SERVER_SNAPSHOT;
    return inMemoryState;
  }
}

export function getSnapshot(): AppState {
  if (typeof window === 'undefined') {
    return CACHED_SERVER_SNAPSHOT;
  }
  if (!inMemoryState) {
    return loadState();
  }
  return inMemoryState;
}

export function getServerSnapshot(): AppState {
  return CACHED_SERVER_SNAPSHOT;
}

export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        inMemoryState = JSON.parse(e.newValue);
        notifySubscribers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function updateGlobalState(updater: (prev: AppState) => AppState): AppState {
  const current = getSnapshot();
  const next = updater(current);
  inMemoryState = next;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }

  // Defer notification via microtask so it never clashes with a running React render
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(notifySubscribers);
  } else {
    setTimeout(notifySubscribers, 0);
  }

  return next;
}

export function saveState(state: AppState): void {
  inMemoryState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  }

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(notifySubscribers);
  } else {
    setTimeout(notifySubscribers, 0);
  }
}

export function resetState(): AppState {
  const initial = getDefaultState();
  inMemoryState = initial;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (err) {
      console.error(err);
    }
  }
  notifySubscribers();
  return initial;
}
