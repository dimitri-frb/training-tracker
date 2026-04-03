import { useState, useEffect } from 'react';
import { INITIAL_SESSIONS } from '../data/trainingPlan';

const STORAGE_KEY = 'training-tracker-sessions';

export function useTrainingData() {
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return INITIAL_SESSIONS;
      }
    }
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
  }

  return { sessions, logSession, updateSession, addSession, resetData };
}
