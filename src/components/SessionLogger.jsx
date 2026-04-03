import { useState } from 'react';
import { format, parseISO } from 'date-fns';

export default function SessionLogger({ session, onSave, onClose }) {
  const [distance, setDistance] = useState(session.logged?.distance || '');
  const [pace, setPace] = useState(session.logged?.pace || '');
  const [avgHR, setAvgHR] = useState(session.logged?.avgHR || '');
  const [notes, setNotes] = useState(session.logged?.notes || '');

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      distance: distance ? parseFloat(distance) : null,
      pace: pace || null,
      avgHR: avgHR ? parseInt(avgHR) : null,
      notes: notes || null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>
          Log: {session.label} — {format(parseISO(session.date), 'EEE, MMM d')}
        </h3>

        {session.planned && (
          <div className="logger-planned">
            <strong>Target:</strong> {session.planned.duration} min
            {session.planned.hrTarget && ` | HR: ${session.planned.hrTarget}`}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Distance (km)
              <input
                type="number"
                step="0.01"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 10.5"
              />
            </label>
            <label>
              Avg Pace (min/km)
              <input
                type="text"
                value={pace}
                onChange={e => setPace(e.target.value)}
                placeholder="e.g. 5:30"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Avg HR (bpm)
              <input
                type="number"
                value={avgHR}
                onChange={e => setAvgHR(e.target.value)}
                placeholder="e.g. 138"
              />
            </label>
          </div>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did it feel?"
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
