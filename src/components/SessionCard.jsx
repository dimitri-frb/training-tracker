import { format, parseISO } from 'date-fns';

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

export default function SessionCard({ session, onEdit }) {
  const { date, type, label, planned, logged, status, isKey } = session;
  const dayName = format(parseISO(date), 'EEE');
  const dayNum = format(parseISO(date), 'MMM d');

  return (
    <div className={`session-card ${status} ${isKey ? 'key-session' : ''}`}>
      <div className="session-day">
        <span className="day-name">{dayName}</span>
        <span className="day-num">{dayNum}</span>
      </div>

      <div className="session-body">
        <div className="session-header">
          <span className="session-icon">{TYPE_ICONS[type] || '\u{2B50}'}</span>
          <span className="session-label">{label}</span>
          {isKey && <span className="key-badge">KEY</span>}
          <span className="status-dot" style={{ backgroundColor: STATUS_COLORS[status] }} />
        </div>

        {planned && (
          <div className="session-planned">
            {planned.duration && <span>{planned.duration} min</span>}
            {planned.hrTarget && <span className="hr-target">HR: {planned.hrTarget}</span>}
            {planned.notes && <span className="plan-notes">{planned.notes}</span>}
          </div>
        )}

        {logged && (
          <div className="session-logged">
            {logged.distance && <span>{logged.distance} km</span>}
            {logged.pace && <span>{logged.pace}/km</span>}
            {logged.avgHR && <span>{logged.avgHR} bpm</span>}
            {logged.notes && <p className="log-notes">{logged.notes}</p>}
          </div>
        )}
      </div>

      <div className="session-actions">
        {(type === 'run' || type === 'longrun') && (
          <button className="btn-log" onClick={onEdit}>
            {logged ? 'Edit' : 'Log'}
          </button>
        )}
      </div>
    </div>
  );
}
