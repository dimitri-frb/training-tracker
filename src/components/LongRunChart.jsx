import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { paceToSeconds, secondsToPace } from '../data/trainingPlan';

export default function LongRunChart({ sessions }) {
  const longRuns = sessions
    .filter(s => s.type === 'longrun' && s.logged?.pace && s.logged?.avgHR)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => ({
      date: format(parseISO(s.date), 'MMM d'),
      pace: paceToSeconds(s.logged.pace),
      paceLabel: s.logged.pace,
      hr: s.logged.avgHR,
      distance: s.logged.distance,
    }));

  if (longRuns.length === 0) {
    return (
      <div className="long-run-chart">
        <h2>Long Run Progression</h2>
        <div className="chart-empty">
          <p>No long run data logged yet.</p>
          <p>Log your Friday long runs to see HR vs Pace trends here.</p>
        </div>
      </div>
    );
  }

  const targetPace = paceToSeconds('4:37');

  return (
    <div className="long-run-chart">
      <h2>Long Run Progression</h2>
      <p className="chart-subtitle">HR vs Pace — tracking aerobic efficiency week over week</p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={longRuns} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis
              yAxisId="hr"
              domain={[120, 170]}
              stroke="#ef4444"
              label={{ value: 'HR (bpm)', angle: -90, position: 'insideLeft', style: { fill: '#ef4444' } }}
            />
            <YAxis
              yAxisId="pace"
              orientation="right"
              domain={[240, 420]}
              tickFormatter={secondsToPace}
              reversed
              stroke="#3b82f6"
              label={{ value: 'Pace (/km)', angle: 90, position: 'insideRight', style: { fill: '#3b82f6' } }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              formatter={(value, name) => {
                if (name === 'hr') return [`${value} bpm`, 'Avg HR'];
                if (name === 'pace') return [secondsToPace(value), 'Avg Pace'];
                return [value, name];
              }}
            />
            <ReferenceLine
              yAxisId="pace"
              y={targetPace}
              stroke="#a855f7"
              strokeDasharray="5 5"
              label={{ value: '4:37 target', fill: '#a855f7', position: 'right' }}
            />
            <Line
              yAxisId="hr"
              type="monotone"
              dataKey="hr"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 5 }}
              name="hr"
            />
            <Line
              yAxisId="pace"
              type="monotone"
              dataKey="pace"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 5 }}
              name="pace"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="long-run-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Distance</th>
              <th>Pace</th>
              <th>Avg HR</th>
            </tr>
          </thead>
          <tbody>
            {longRuns.map(lr => (
              <tr key={lr.date}>
                <td>{lr.date}</td>
                <td>{lr.distance} km</td>
                <td>{lr.paceLabel}/km</td>
                <td>{lr.hr} bpm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
