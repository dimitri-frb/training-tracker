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
  { id: 1, name: 'Hyrox Base', start: '2026-03-29', end: '2026-05-17', weeks: 7, color: '#f97316' },
  { id: 2, name: 'Trail Block', start: '2026-05-23', end: '2026-06-22', weeks: 4, color: '#22c55e' },
  { id: 3, name: 'Marathon Build', start: '2026-07-05', end: '2026-10-12', weeks: 14, color: '#3b82f6' },
  { id: 4, name: 'Marathon Taper', start: '2026-10-13', end: '2026-12-06', weeks: 8, color: '#a855f7' },
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

// Initial sessions data — weeks 1 & 2
export const INITIAL_SESSIONS = [
  // Week 1
  {
    id: 'w1-sun',
    date: '2026-03-29',
    type: 'run',
    label: 'Z1 Opener',
    planned: { duration: 30, hrTarget: '< 130 bpm' },
    logged: { distance: 4.72, pace: '6:22', avgHR: 130, notes: 'First run back from injury. Felt good.' },
    status: 'done',
  },
  {
    id: 'w1-mon',
    date: '2026-03-30',
    type: 'rest',
    label: 'Rest',
    status: 'done',
  },
  {
    id: 'w1-tue-pm',
    date: '2026-03-31',
    type: 'gym',
    label: 'Hyrox Gym (PM)',
    status: 'upcoming',
  },
  {
    id: 'w1-wed',
    date: '2026-04-01',
    type: 'padel',
    label: 'Padel',
    status: 'upcoming',
  },
  {
    id: 'w1-thu',
    date: '2026-04-02',
    type: 'rest',
    label: 'Rest',
    status: 'done',
  },
  {
    id: 'w1-thu-pm',
    date: '2026-04-02',
    type: 'gym',
    label: 'Hyrox Gym (PM)',
    status: 'done',
  },
  {
    id: 'w1-fri',
    date: '2026-04-03',
    type: 'longrun',
    label: 'Long Run',
    planned: { duration: 75, hrTarget: '130-140 bpm STRICT' },
    isKey: true,
    status: 'upcoming',
  },
  {
    id: 'w1-sat',
    date: '2026-04-04',
    type: 'rest',
    label: 'Rest',
    status: 'upcoming',
  },
  {
    id: 'w1-sun2',
    date: '2026-04-05',
    type: 'run',
    label: 'Recovery',
    planned: { duration: 35, hrTarget: '< 133 bpm', notes: 'Treadmill' },
    status: 'upcoming',
  },
  // Week 2
  {
    id: 'w2-mon',
    date: '2026-04-06',
    type: 'rest',
    label: 'Rest',
    status: 'upcoming',
  },
  {
    id: 'w2-tue',
    date: '2026-04-07',
    type: 'run',
    label: 'Z2 Run',
    planned: { duration: 50, hrTarget: 'Z2' },
    status: 'upcoming',
  },
  {
    id: 'w2-tue-pm',
    date: '2026-04-07',
    type: 'gym',
    label: 'Hyrox Gym (PM)',
    status: 'upcoming',
  },
  {
    id: 'w2-wed',
    date: '2026-04-08',
    type: 'padel',
    label: 'Padel',
    status: 'upcoming',
  },
  {
    id: 'w2-thu',
    date: '2026-04-09',
    type: 'run',
    label: 'Z2 Push Run',
    planned: { duration: 50, hrTarget: 'Z2' },
    status: 'upcoming',
  },
  {
    id: 'w2-thu-pm',
    date: '2026-04-09',
    type: 'gym',
    label: 'Hyrox Gym (PM)',
    status: 'upcoming',
  },
  {
    id: 'w2-fri',
    date: '2026-04-10',
    type: 'longrun',
    label: 'Long Run',
    planned: { duration: 75, hrTarget: '130-140 bpm' },
    isKey: true,
    status: 'upcoming',
  },
  {
    id: 'w2-sat',
    date: '2026-04-11',
    type: 'rest',
    label: 'Rest',
    status: 'upcoming',
  },
  {
    id: 'w2-sun',
    date: '2026-04-12',
    type: 'run',
    label: 'Recovery',
    planned: { duration: 35, hrTarget: '< 133 bpm' },
    status: 'upcoming',
  },
];
