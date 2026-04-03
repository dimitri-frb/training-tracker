import { useState } from 'react';
import { format, parseISO, startOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import SessionCard from './SessionCard';
import SessionLogger from './SessionLogger';

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
