import { format, parseISO } from 'date-fns';
import { ATHLETE } from '../data/trainingPlan';

const ZONE_RANGES = Object.fromEntries(
  Object.entries(ATHLETE.hrZones).map(([key, z]) => [
    key.toUpperCase(),
    `${z.min}–${z.max} bpm`,
  ])
);

function expandHrTarget(target) {
  if (!target) return null;
  return target.replace(/\b(Z[1-5])\b/g, (match) => {
    const range = ZONE_RANGES[match];
    return range ? `${match} (${range})` : match;
  });
}

const TYPE_ICONS = {
  run: '\u{1F3C3}',
  longrun: '\u{1F525}',
  rest: '\u{1F4A4}',
  padel: '\u{1F3BE}',
  gym: '\u{1F4AA}',
};

const STATUS_COLORS = {
  done: '#22c55e',
  upcoming: '#94a3b8',
  missed: '#ef4444',
};

function SessionRow({ session, onEdit }) {
  const { type, label, planned, logged, status, isKey } = session;
  const isLoggable = type !== 'rest';

  return (
    <div
      className={`session-row ${isLoggable ? 'clickable' : ''}`}
      onClick={isLoggable ? onEdit : undefined}
    >
      <div className="session-header">
        <span className="session-icon">{TYPE_ICONS[type] || '\u{2B50}'}</span>
        <span className="session-label">{label}</span>
        {isKey && <span className="key-badge">KEY</span>}
        <span className="status-dot" style={{ backgroundColor: STATUS_COLORS[status] }} />
      </div>

      {planned && (
        <div className="session-planned">
          {planned.duration && <span>{planned.duration} min</span>}
          {planned.hrTarget && <span className="hr-target">HR: {expandHrTarget(planned.hrTarget)}</span>}
          {planned.notes && <span className="plan-notes">{planned.notes}</span>}
        </div>
      )}

      {logged && (
        <div className="session-logged">
          {logged.distance && <span>{logged.distance} km</span>}
          {logged.pace && <span>{logged.pace}/km</span>}
          {logged.avgHR && <span>{logged.avgHR} bpm</span>}
          {logged.notes && <p className="log-notes">{logged.notes}</p>}
          {logged.image && (
            <img src={logged.image} alt="Strava screenshot" className="session-screenshot" />
          )}
        </div>
      )}
    </div>
  );
}

export default function DayCard({ date, sessions, onEdit }) {
  const dayName = format(parseISO(date), 'EEE');
  const dayNum = format(parseISO(date), 'MMM d');

  // Determine card-level status: done if all done, key if any is key
  const allDone = sessions.every(s => s.status === 'done' || s.type === 'rest');
  const hasKey = sessions.some(s => s.isKey);

  return (
    <div className={`day-card ${allDone ? 'done' : ''} ${hasKey ? 'key-session' : ''}`}>
      <div className="session-day">
        <span className="day-name">{dayName}</span>
        <span className="day-num">{dayNum}</span>
      </div>
      <div className="day-sessions">
        {sessions.map((session, i) => (
          <SessionRow
            key={session.id}
            session={session}
            onEdit={() => onEdit(session)}
          />
        ))}
      </div>
    </div>
  );
}
