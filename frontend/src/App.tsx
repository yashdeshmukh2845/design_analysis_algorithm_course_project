import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { Location } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { QuickCommerceDispatchPage } from './pages/QuickCommerceDispatchPage';
import { AlgorithmLabPage } from './pages/AlgorithmLabPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { DocumentationPage } from './pages/DocumentationPage';

export function App() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    api.getDemoProblem().then(demo => {
      setLocations(demo.locations);
    }).catch(err => console.error(err));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            {/* Flagship: 10-Minute Blinkit Quick Commerce Fleet Dispatch */}
            <Route path="/" element={<QuickCommerceDispatchPage />} />
            <Route path="/dispatch" element={<Navigate to="/" replace />} />

            {/* DAA Algorithm Lab & State Space Pruning */}
            <Route path="/lab" element={<AlgorithmLabPage locations={locations} />} />

            {/* Benchmark Laboratory & Big-O Curves */}
            <Route path="/benchmark" element={<BenchmarkPage />} />

            {/* Academic Viva Defense & Project Documentation Guide */}
            <Route path="/viva" element={<DocumentationPage />} />
            <Route path="/docs" element={<Navigate to="/viva" replace />} />

            {/* Legacy Fallbacks Redirecting to Home or Lab */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/optimizer" element={<Navigate to="/" replace />} />
            <Route path="/visualizer" element={<Navigate to="/lab" replace />} />
            <Route path="/builder" element={<Navigate to="/" replace />} />
            <Route path="/comparison" element={<Navigate to="/lab" replace />} />
            <Route path="/reports" element={<Navigate to="/viva" replace />} />
            <Route path="/datasets" element={<Navigate to="/" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>QuickRoute — Blinkit Quick-Commerce 10-Min Dispatch Simulator</span>
            <span>Sem 5 Design & Analysis of Algorithms (DAA) Course Project</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
