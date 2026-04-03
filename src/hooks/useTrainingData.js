import { useState, useEffect } from 'react';
import { INITIAL_SESSIONS } from '../data/trainingPlan';

const STORAGE_KEY = 'training-tracker-sessions';
const VERSION_KEY = 'training-tracker-version';
const CURRENT_VERSION = 6; // bump when INITIAL_SESSIONS changes

function mergeSessions(stored, initial) {
  // Respect user deletions
  const deleted = new Set(JSON.parse(localStorage.getItem('training-tracker-deleted') || '[]'));

  // Keep logged data from stored, but ensure all initial sessions exist
  const storedMap = new Map(stored.map(s => [s.id, s]));
  const merged = initial.filter(s => !deleted.has(s.id)).map(s => {
    const existing = storedMap.get(s.id);
    if (existing?.logged) {
      return { ...s, logged: existing.logged, status: existing.status };
    }
    return existing || s;
  });
  // Keep user-added sessions (ids starting with "custom-") but drop old removed ones
  stored.forEach(s => {
    if (s.id.startsWith('custom-') && !initial.find(i => i.id === s.id)) {
      merged.push(s);
    }
  });
  return merged;
}

export function useTrainingData() {
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0');

    if (stored && storedVersion >= CURRENT_VERSION) {
      try {
        return JSON.parse(stored);
      } catch {
        return INITIAL_SESSIONS;
      }
    }

    if (stored && storedVersion < CURRENT_VERSION) {
      try {
        const parsed = JSON.parse(stored);
        const merged = mergeSessions(parsed, INITIAL_SESSIONS);
        localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
        return merged;
      } catch {
        return INITIAL_SESSIONS;
      }
    }

    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    return INITIAL_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  function logSession(sessionId, data) {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, logged: data, status: 'done' }
          : s
      )
    );
  }

  function updateSession(sessionId, updates) {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      )
    );
  }

  function addSession(session) {
    setSessions(prev => [...prev, session]);
  }

  function deleteSession(sessionId) {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    // Track deleted IDs so they don't come back on version bumps
    const deleted = JSON.parse(localStorage.getItem('training-tracker-deleted') || '[]');
    deleted.push(sessionId);
    localStorage.setItem('training-tracker-deleted', JSON.stringify(deleted));
  }

  function resetData() {
    setSessions(INITIAL_SESSIONS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('training-tracker-deleted');
    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
  }

  return { sessions, logSession, updateSession, addSession, deleteSession, resetData };
}
