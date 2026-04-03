import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { startOfWeek, parseISO, format } from 'date-fns';
import { paceToSeconds, secondsToPace, getZone, ATHLETE, WEEK_OBJECTIVES } from '../data/trainingPlan';

export default function ProgressionChart({ sessions }) {
  const data = useMemo(() => {
    // Group logged runs by week, then compute avg pace per zone per week
    const loggedRuns = sessions.filter(
      s => (s.type === 'run' || s.type === 'longrun') && s.logged?.pace && s.logged?.avgHR
    );

    const weekMap = {};
    loggedRuns.forEach(s => {
      const weekStart = format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!weekMap[weekStart]) weekMap[weekStart] = [];
      weekMap[weekStart].push(s);
    });

    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, runs]) => {
        const obj = WEEK_OBJECTIVES[weekStart];
        const label = obj ? `W${obj.week}` : format(parseISO(weekStart), 'MMM d');

        const zonePaces = {};
        runs.forEach(s => {
          const zone = getZone(s.logged.avgHR);
          if (!zone) return;
          if (!zonePaces[zone]) zonePaces[zone] = [];
          zonePaces[zone].push(paceToSeconds(s.logged.pace));
        });

        const row = { week: label };
        for (const [zone, paces] of Object.entries(zonePaces)) {
          row[zone] = Math.round(paces.reduce((a, b) => a + b, 0) / paces.length);
        }

        // Also compute total km for the week
        const weekAllRuns = sessions.filter(
          s => (s.type === 'run' || s.type === 'longrun') && s.logged?.distance &&
            format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), 'yyyy-MM-dd') === weekStart
        );
        row.km = weekAllRuns.reduce((sum, s) => sum + (s.logged.distance || 0), 0);

        return row;
      });
  }, [sessions]);

  // Find which zones have data across all weeks
  const activeZones = useMemo(() => {
    const zones = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k.startsWith('z')) zones.add(k);
      });
    });
    return Array.from(zones).sort();
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="progression">
        <h2>Progression</h2>
        <div className="chart-empty">
          <p>No run data logged yet.</p>
          <p>Log runs with pace and HR to see your pace-per-zone trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progression">
      <h2>Progression</h2>
      <p className="chart-subtitle">Average pace per HR zone — week over week</p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="week" stroke="#888" />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={secondsToPace}
              reversed
              stroke="#888"
              label={{ value: 'Pace (/km)', angle: -90, position: 'insideLeft', style: { fill: '#888' } }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '6px' }}
              formatter={(value, name) => [secondsToPace(value), name.toUpperCase()]}
            />
            <Legend formatter={(value) => value.toUpperCase()} />
            {activeZones.map(zone => (
              <Line
                key={zone}
                type="monotone"
                dataKey={zone}
                stroke={ATHLETE.hrZones[zone]?.color || '#888'}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-subtitle" style={{ marginTop: '24px' }}>Weekly volume</p>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="week" stroke="#888" />
            <YAxis stroke="#888" label={{ value: 'km', angle: -90, position: 'insideLeft', style: { fill: '#888' } }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '6px' }}
              formatter={(value) => [`${value.toFixed(1)} km`, 'Volume']}
            />
            <Line
              type="monotone"
              dataKey="km"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="progression-table">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>km</th>
              {activeZones.map(z => (
                <th key={z} style={{ color: ATHLETE.hrZones[z]?.color }}>{z.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.week}>
                <td>{row.week}</td>
                <td>{row.km?.toFixed(1) || '—'}</td>
                {activeZones.map(z => (
                  <td key={z}>{row[z] ? secondsToPace(row[z]) : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
