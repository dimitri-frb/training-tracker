import { useState, useMemo } from 'react';
import { format, parseISO, startOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import { paceToSeconds, secondsToPace } from '../data/trainingPlan';
import SessionCard from './SessionCard';
import SessionLogger from './SessionLogger';

function computeKPIs(weekSessions) {
  const loggedRuns = weekSessions.filter(
    s => (s.type === 'run' || s.type === 'longrun') && s.logged
  );

  const totalKm = loggedRuns.reduce((sum, s) => sum + (s.logged.distance || 0), 0);

  const withPace = loggedRuns.filter(s => s.logged.pace);
  const avgPaceSecs = withPace.length > 0
    ? withPace.reduce((sum, s) => sum + paceToSeconds(s.logged.pace), 0) / withPace.length
    : null;

  const withHR = loggedRuns.filter(s => s.logged.avgHR);
  const avgHR = withHR.length > 0
    ? Math.round(withHR.reduce((sum, s) => sum + s.logged.avgHR, 0) / withHR.length)
    : null;

  const totalSessions = weekSessions.length;
  const doneSessions = weekSessions.filter(s => s.status === 'done').length;

  return { totalKm, avgPaceSecs, avgHR, totalSessions, doneSessions, runsLogged: loggedRuns.length };
}

export default function WeeklyView({ sessions, onLog, onUpdate }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [editingSession, setEditingSession] = useState(null);

  const weekSessions = sessions.filter(s => {
    const d = parseISO(s.date);
    return isSameWeek(d, currentWeekStart, { weekStartsOn: 1 });
  }).sort((a, b) => a.date.localeCompare(b.date));

  const weekEnd = addWeeks(currentWeekStart, 1);
  const kpis = useMemo(() => computeKPIs(weekSessions), [weekSessions]);

  return (
    <div className="weekly-view">
      <div className="week-nav">
        <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
          &larr; Prev
        </button>
        <h2>
          {format(currentWeekStart, 'MMM d')} — {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
          Next &rarr;
        </button>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-value">{kpis.totalKm > 0 ? kpis.totalKm.toFixed(1) : '—'}</span>
          <span className="kpi-label">km</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{kpis.avgPaceSecs ? secondsToPace(kpis.avgPaceSecs) : '—'}</span>
          <span className="kpi-label">avg pace</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{kpis.avgHR ?? '—'}</span>
          <span className="kpi-label">avg HR</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{kpis.doneSessions}/{kpis.totalSessions}</span>
          <span className="kpi-label">done</span>
        </div>
      </div>

      {weekSessions.length === 0 ? (
        <p className="empty-week">No sessions planned for this week.</p>
      ) : (
        <div className="session-list">
          {weekSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={() => setEditingSession(session)}
            />
          ))}
        </div>
      )}

      {editingSession && (
        <SessionLogger
          session={editingSession}
          onSave={(data) => {
            onLog(editingSession.id, data);
            setEditingSession(null);
          }}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  );
}
