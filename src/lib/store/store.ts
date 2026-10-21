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

const STORAGE_KEY = 'eventease_v1_data';

export interface AppState {
  currentUserId: string;
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
              : 'admin2026'),
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

    inMemoryState = {
      ...getDefaultState(),
      ...parsed,
      users: mergedUsers,
      events: mergedEvents,
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
