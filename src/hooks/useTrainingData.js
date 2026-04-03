import { useState, useEffect } from 'react';
import { INITIAL_SESSIONS } from '../data/trainingPlan';

const STORAGE_KEY = 'training-tracker-sessions';
const VERSION_KEY = 'training-tracker-version';
const CURRENT_VERSION = 4; // bump when INITIAL_SESSIONS changes

function mergeSessions(stored, initial) {
  // Keep logged data from stored, but ensure all initial sessions exist
  const storedMap = new Map(stored.map(s => [s.id, s]));
  const merged = initial.map(s => {
    const existing = storedMap.get(s.id);
    if (existing?.logged) {
      return { ...s, logged: existing.logged, status: existing.status };
    }
    return existing || s;
  });
  // Also keep any extra sessions the user added manually
  stored.forEach(s => {
    if (!initial.find(i => i.id === s.id)) {
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

  function resetData() {
    setSessions(INITIAL_SESSIONS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
  }

  return { sessions, logSession, updateSession, addSession, resetData };
}
