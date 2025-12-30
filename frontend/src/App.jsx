import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WorkItems from './pages/WorkItems';
import Blockers from './pages/Blockers';
import WeeklySummary from './pages/WeeklySummary';
import OneOnOnePrep from './pages/OneOnOnePrep';
import Skills from './pages/Skills';
import GitHubIntegration from './pages/GitHubIntegration';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/work" element={<WorkItems />} />
        <Route path="/blockers" element={<Blockers />} />
        <Route path="/summary" element={<WeeklySummary />} />
        <Route path="/prep" element={<OneOnOnePrep />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/github" element={<GitHubIntegration />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;