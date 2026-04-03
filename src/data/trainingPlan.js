export const ATHLETE = {
  name: 'Dimitri Farber',
  hrZones: {
    z1: { name: 'Z1 Recovery', min: 0, max: 130, color: '#94a3b8' },
    z2: { name: 'Z2 Aerobic', min: 131, max: 145, color: '#22c55e' },
    z3: { name: 'Z3 Tempo', min: 146, max: 158, color: '#eab308' },
    z4: { name: 'Z4 Threshold', min: 159, max: 170, color: '#f97316' },
    z5: { name: 'Z5 VO2max', min: 171, max: 188, color: '#ef4444' },
  },
  hrMax: 188,
  lactateThreshold: 169,
  targets: {
    hyroxPace: '4:45-4:50/km',
    marathonPace: '4:37/km',
    marathonGoal: 'sub-3:15',
  },
};

export const RACES = [
  { name: 'Hyrox Duo', date: '2026-05-22', location: 'Lyon', type: 'hyrox' },
  { name: 'Trail 19k / 800m D+', date: '2026-07-04', location: "Val d'Aran", type: 'trail' },
  { name: 'Valencia Marathon', date: '2026-12-07', location: 'Valencia', type: 'marathon', goal: 'sub-3:15' },
];

export const PHASES = [
  { id: 1, name: 'Hyrox Base', start: '2026-03-29', end: '2026-05-22', weeks: 8, color: '#f97316' },
];

export const FIXED_STRUCTURE = {
  monday: { pm: 'Hyrox gym (coach)' },
  tuesday: { am: 'Run', pm: 'Hyrox gym (coach)' },
  wednesday: { am: 'Padel' },
  thursday: { am: 'Run (easy)', pm: 'Hyrox gym (coach)' },
  friday: { am: 'Long Run (KEY)' },
  saturday: { label: 'Rest' },
  sunday: { label: 'Recovery run (optional)' },
};

// Classify an avgHR into a zone key (z1, z2, etc.)
export function getZone(avgHR) {
  if (!avgHR) return null;
  for (const [key, z] of Object.entries(ATHLETE.hrZones)) {
    if (avgHR >= z.min && avgHR <= z.max) return key;
  }
  return null;
}

// Helper to parse pace string "M:SS" to seconds per km
export function paceToSeconds(pace) {
  if (!pace) return null;
  const parts = pace.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Helper to format seconds per km to "M:SS"
export function secondsToPace(secs) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Week objectives — keyed by Monday date of each week
export const WEEK_OBJECTIVES = {
  '2026-03-30': { week: 1, title: 'Return to Running', desc: 'First steps back from injury. Z1 only, strict HR caps. Build confidence.', targetKm: 20 },
  '2026-04-06': { week: 2, title: 'Aerobic Foundation', desc: 'Introduce Z2 runs. Keep long run strictly aerobic. Listen to the hip.', targetKm: 25 },
  '2026-04-13': { week: 3, title: 'Volume +10%', desc: 'Bump long run to 80 min. Add Thursday easy run. Stay in Z2.', targetKm: 28 },
  '2026-04-20': { week: 4, title: 'Consistency', desc: 'Hold volume. First Z3 intervals on Tuesday. Long run push to 85 min.', targetKm: 32 },
  '2026-04-27': { week: 5, title: 'Hyrox Specificity', desc: 'Add race-pace efforts on Tuesday. Long run 90 min with Z2 push finish.', targetKm: 35 },
  '2026-05-04': { week: 6, title: 'Peak Week', desc: 'Highest volume week. Long run 90 min. Tuesday tempo at Hyrox pace (4:45-4:50/km).', targetKm: 38 },
  '2026-05-11': { week: 7, title: 'Taper', desc: 'Reduce volume 30%. Keep intensity. Sharpen for race day.', targetKm: 25 },
  '2026-05-18': { week: 8, title: 'Race Week — Hyrox Duo', desc: 'Light openers only. Race day Friday May 22. Trust the work.', targetKm: 15 },
};

// Helper to generate a standard week of sessions
function makeWeek(w, monDate, opts = {}) {
  const d = (offset) => {
    const date = new Date(monDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const sessions = [];

  // Tuesday AM — Run
  if (opts.tuRun) {
    sessions.push({ id: `w${w}-tue`, date: d(1), type: 'run', label: opts.tuRun.label, planned: opts.tuRun.planned, status: 'upcoming' });
  }
  // Tuesday PM — Hyrox Gym
  sessions.push({ id: `w${w}-tue-pm`, date: d(1), type: 'gym', label: 'Hyrox Gym (PM)', status: 'upcoming' });

  // Wednesday — Padel
  sessions.push({ id: `w${w}-wed`, date: d(2), type: 'padel', label: 'Padel', status: 'upcoming' });

  // Thursday AM — Easy Run
  if (opts.thuRun) {
    sessions.push({ id: `w${w}-thu`, date: d(3), type: 'run', label: opts.thuRun.label, planned: opts.thuRun.planned, status: 'upcoming' });
  }
  // Thursday PM — Hyrox Gym
  sessions.push({ id: `w${w}-thu-pm`, date: d(3), type: 'gym', label: 'Hyrox Gym (PM)', status: 'upcoming' });

  // Friday — Long Run (KEY)
  if (opts.longRun) {
    sessions.push({ id: `w${w}-fri`, date: d(4), type: 'longrun', label: 'Long Run', planned: opts.longRun.planned, isKey: true, status: 'upcoming' });
  }

  // Sunday — Recovery (optional)
  if (opts.sunRun) {
    sessions.push({ id: `w${w}-sun`, date: d(6), type: 'run', label: opts.sunRun.label, planned: opts.sunRun.planned, status: 'upcoming' });
  }

  return sessions;
}

// Initial sessions data — Hyrox Base phase (Weeks 1–8)
export const INITIAL_SESSIONS = [
  // ===== WEEK 1 (Mar 29 – Apr 5) — Return to Running =====
  {
    id: 'w1-sun',
    date: '2026-03-29',
    type: 'run',
    label: 'Z1 Opener',
    planned: { duration: 30, hrTarget: '< 130 bpm' },
    logged: { distance: 4.72, pace: '6:22', avgHR: 130, notes: 'First run back from injury. Felt good.' },
    status: 'done',
  },
  { id: 'w1-tue-pm', date: '2026-03-31', type: 'gym', label: 'Hyrox Gym (PM)', status: 'upcoming' },
  { id: 'w1-wed', date: '2026-04-01', type: 'padel', label: 'Padel', status: 'upcoming' },
  { id: 'w1-thu-pm', date: '2026-04-02', type: 'gym', label: 'Hyrox Gym (PM)', status: 'done' },
  { id: 'w1-fri', date: '2026-04-03', type: 'longrun', label: 'Long Run', planned: { duration: 75, hrTarget: '130-140 bpm STRICT' }, isKey: true, status: 'upcoming' },
  { id: 'w1-sun2', date: '2026-04-05', type: 'run', label: 'Recovery', planned: { duration: 35, hrTarget: '< 133 bpm', notes: 'Treadmill' }, status: 'upcoming' },

  // ===== WEEK 2 (Apr 6–12) — Aerobic Foundation =====
  ...makeWeek(2, '2026-04-06', {
    tuRun: { label: 'Z2 Run', planned: { duration: 50, hrTarget: 'Z2' } },
    thuRun: { label: 'Z2 Push Run', planned: { duration: 50, hrTarget: 'Z2' } },
    longRun: { planned: { duration: 75, hrTarget: '130-140 bpm' } },
    sunRun: { label: 'Recovery', planned: { duration: 35, hrTarget: '< 133 bpm' } },
  }),

  // ===== WEEK 3 (Apr 13–19) — Volume +10% =====
  ...makeWeek(3, '2026-04-13', {
    tuRun: { label: 'Z2 Run', planned: { duration: 50, hrTarget: 'Z2' } },
    thuRun: { label: 'Easy Run', planned: { duration: 40, hrTarget: 'Z1' } },
    longRun: { planned: { duration: 80, hrTarget: '130-140 bpm' } },
    sunRun: { label: 'Recovery', planned: { duration: 35, hrTarget: '< 133 bpm' } },
  }),

  // ===== WEEK 4 (Apr 20–26) — Consistency =====
  ...makeWeek(4, '2026-04-20', {
    tuRun: { label: 'Z3 Intervals', planned: { duration: 55, hrTarget: '5x4 min Z3 / 2 min Z1' } },
    thuRun: { label: 'Easy Run', planned: { duration: 40, hrTarget: 'Z1' } },
    longRun: { planned: { duration: 85, hrTarget: '130-142 bpm' } },
    sunRun: { label: 'Recovery', planned: { duration: 35, hrTarget: '< 133 bpm' } },
  }),

  // ===== WEEK 5 (Apr 27 – May 3) — Hyrox Specificity =====
  ...makeWeek(5, '2026-04-27', {
    tuRun: { label: 'Hyrox Pace', planned: { duration: 55, hrTarget: '6x1km @ 4:45-4:50/km' } },
    thuRun: { label: 'Easy Run', planned: { duration: 45, hrTarget: 'Z1' } },
    longRun: { planned: { duration: 90, hrTarget: '130-140 bpm, last 10 min Z2 push' } },
    sunRun: { label: 'Recovery', planned: { duration: 35, hrTarget: '< 133 bpm' } },
  }),

  // ===== WEEK 6 (May 4–10) — Peak Week =====
  ...makeWeek(6, '2026-05-04', {
    tuRun: { label: 'Tempo', planned: { duration: 55, hrTarget: '20 min Z3 tempo @ 4:45-4:50/km' } },
    thuRun: { label: 'Easy Run', planned: { duration: 45, hrTarget: 'Z1' } },
    longRun: { planned: { duration: 90, hrTarget: '130-142 bpm' } },
    sunRun: { label: 'Recovery', planned: { duration: 40, hrTarget: '< 133 bpm' } },
  }),

  // ===== WEEK 7 (May 11–17) — Taper =====
  ...makeWeek(7, '2026-05-11', {
    tuRun: { label: 'Sharpener', planned: { duration: 40, hrTarget: '4x1km @ 4:40/km' } },
    thuRun: { label: 'Easy Run', planned: { duration: 30, hrTarget: 'Z1' } },
    longRun: { planned: { duration: 60, hrTarget: '130-140 bpm' } },
    sunRun: { label: 'Recovery', planned: { duration: 30, hrTarget: '< 130 bpm' } },
  }),

  // ===== WEEK 8 (May 18–24) — Race Week =====
  { id: 'w8-tue', date: '2026-05-19', type: 'run', label: 'Opener', planned: { duration: 25, hrTarget: '15 min Z1 + 3x30s strides' }, status: 'upcoming' },
  { id: 'w8-tue-pm', date: '2026-05-19', type: 'gym', label: 'Hyrox Gym (PM)', status: 'upcoming' },
  { id: 'w8-wed', date: '2026-05-20', type: 'padel', label: 'Padel', status: 'upcoming' },
  { id: 'w8-thu', date: '2026-05-21', type: 'run', label: 'Shakeout', planned: { duration: 20, hrTarget: 'Z1' }, status: 'upcoming' },
  { id: 'w8-fri', date: '2026-05-22', type: 'run', label: 'HYROX DUO', planned: { notes: 'RACE DAY — Lyon' }, isKey: true, status: 'upcoming' },
];
