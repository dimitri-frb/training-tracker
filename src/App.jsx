import { useState } from 'react';
import MacrocycleView from './components/MacrocycleView';
import WeeklyView from './components/WeeklyView';
import LongRunChart from './components/LongRunChart';
import { useTrainingData } from './hooks/useTrainingData';
import { ATHLETE } from './data/trainingPlan';
import './App.css';

const TABS = [
  { id: 'week', label: 'Week' },
  { id: 'macro', label: 'Macrocycle' },
  { id: 'chart', label: 'Long Runs' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('week');
  const { sessions, logSession, updateSession } = useTrainingData();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Training Tracker</h1>
        <span className="athlete-name">{ATHLETE.name}</span>
      </header>

      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'week' && (
          <WeeklyView
            sessions={sessions}
            onLog={logSession}
            onUpdate={updateSession}
          />
        )}
        {activeTab === 'macro' && <MacrocycleView />}
        {activeTab === 'chart' && <LongRunChart sessions={sessions} />}
      </main>
    </div>
  );
}
