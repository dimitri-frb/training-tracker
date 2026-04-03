import { PHASES, RACES } from '../data/trainingPlan';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function MacrocycleView() {
  const today = new Date();
  const totalStart = parseISO(PHASES[0].start);
  const totalEnd = parseISO(PHASES[PHASES.length - 1].end);
  const totalDays = differenceInDays(totalEnd, totalStart);

  function getPosition(dateStr) {
    const d = parseISO(dateStr);
    return (differenceInDays(d, totalStart) / totalDays) * 100;
  }

  function getWidth(startStr, endStr) {
    return (differenceInDays(parseISO(endStr), parseISO(startStr)) / totalDays) * 100;
  }

  const todayPos = Math.min(100, Math.max(0, (differenceInDays(today, totalStart) / totalDays) * 100));

  return (
    <div className="macrocycle">
      <h2>Macrocycle Overview</h2>

      <div className="race-cards">
        {RACES.map(race => {
          const daysOut = differenceInDays(parseISO(race.date), today);
          return (
            <div key={race.name} className={`race-card race-${race.type}`}>
              <div className="race-card-name">{race.name}</div>
              <div className="race-card-meta">
                {format(parseISO(race.date), 'MMM d, yyyy')} — {race.location}
              </div>
              <div className="race-card-countdown">
                {daysOut > 0 ? `${daysOut} days` : daysOut === 0 ? 'TODAY' : 'Done'}
              </div>
              {race.goal && <div className="race-card-goal">{race.goal}</div>}
            </div>
          );
        })}
      </div>

      <div className="timeline">
        <div className="timeline-bar">
          {PHASES.map(phase => (
            <div
              key={phase.id}
              className="timeline-phase"
              style={{
                left: `${getPosition(phase.start)}%`,
                width: `${getWidth(phase.start, phase.end)}%`,
                backgroundColor: phase.color,
              }}
            >
              <span className="timeline-phase-label">{phase.name}</span>
              <span className="timeline-phase-weeks">{phase.weeks}w</span>
            </div>
          ))}

          {RACES.map(race => (
            <div
              key={race.name}
              className="timeline-race-marker"
              style={{ left: `${getPosition(race.date)}%` }}
              title={`${race.name} — ${format(parseISO(race.date), 'MMM d')}`}
            >
              <div className="marker-dot" />
              <div className="marker-label">{race.name.split(' ')[0]}</div>
            </div>
          ))}

          <div
            className="timeline-today"
            style={{ left: `${todayPos}%` }}
          >
            <div className="today-line" />
            <div className="today-label">Today</div>
          </div>
        </div>
      </div>

      <div className="phase-details">
        {PHASES.map(phase => {
          const isActive = today >= parseISO(phase.start) && today <= parseISO(phase.end);
          return (
            <div key={phase.id} className={`phase-detail ${isActive ? 'active' : ''}`}>
              <div className="phase-color" style={{ backgroundColor: phase.color }} />
              <div>
                <strong>{phase.name}</strong>
                <span className="phase-dates">
                  {format(parseISO(phase.start), 'MMM d')} → {format(parseISO(phase.end), 'MMM d')} ({phase.weeks}w)
                </span>
                {isActive && <span className="phase-badge">Current</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
