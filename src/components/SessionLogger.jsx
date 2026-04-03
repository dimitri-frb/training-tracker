import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { extractStravaData } from '../utils/extractStrava';

export default function SessionLogger({ session, onSave, onClose }) {
  const isRun = session.type === 'run' || session.type === 'longrun';
  const [distance, setDistance] = useState(session.logged?.distance || '');
  const [pace, setPace] = useState(session.logged?.pace || '');
  const [avgHR, setAvgHR] = useState(session.logged?.avgHR || '');
  const [notes, setNotes] = useState(session.logged?.notes || '');
  const [image, setImage] = useState(session.logged?.image || null);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState(null);
  const fileRef = useRef();

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setImage(dataUrl);

      if (!isRun) {
        setExtracting(false);
        return;
      }

      // Run OCR extraction for run sessions
      setExtracting(true);
      setExtractMsg(null);
      try {
        const data = await extractStravaData(dataUrl);
        const filled = [];
        if (data.distance && !distance) {
          setDistance(data.distance);
          filled.push('distance');
        }
        if (data.pace && !pace) {
          setPace(data.pace);
          filled.push('pace');
        }
        if (data.avgHR && !avgHR) {
          setAvgHR(data.avgHR);
          filled.push('HR');
        }
        if (filled.length > 0) {
          setExtractMsg(`Extracted: ${filled.join(', ')}`);
        } else {
          setExtractMsg('No data extracted — fill in manually');
        }
      } catch {
        setExtractMsg('Extraction failed — fill in manually');
      }
      setExtracting(false);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    setExtractMsg(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const logged = {
      notes: notes || null,
      image: image || null,
    };
    if (isRun) {
      logged.distance = distance ? parseFloat(distance) : null;
      logged.pace = pace || null;
      logged.avgHR = avgHR ? parseInt(avgHR) : null;
    }
    onSave(logged);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>
          Log: {session.label} — {format(parseISO(session.date), 'EEE, MMM d')}
        </h3>

        {session.planned && (
          <div className="logger-planned">
            {session.planned.duration && <><strong>Target:</strong> {session.planned.duration} min</>}
            {session.planned.hrTarget && ` | HR: ${session.planned.hrTarget}`}
            {session.planned.notes && <> — {session.planned.notes}</>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="upload-label">
            Screenshot
            <div
              className={`upload-zone ${image ? 'has-image' : ''}`}
              onClick={() => !image && !extracting && fileRef.current?.click()}
            >
              {extracting ? (
                <div className="upload-placeholder">
                  <span className="extract-spinner" />
                  <span>Extracting data...</span>
                </div>
              ) : image ? (
                <div className="upload-preview">
                  <img src={image} alt="Session screenshot" />
                  <button type="button" className="upload-remove" onClick={removeImage}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">+</span>
                  <span>Tap to upload screenshot</span>
                </div>
              )}
            </div>
            {extractMsg && <span className="extract-msg">{extractMsg}</span>}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: 'none' }}
            />
          </label>

          {isRun && (
            <>
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
            </>
          )}

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
