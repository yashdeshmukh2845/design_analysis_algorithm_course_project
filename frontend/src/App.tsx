import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { Location, RouteResult } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemBuilderPage } from './pages/ProblemBuilderPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { AlgorithmLabPage } from './pages/AlgorithmLabPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { DatasetManagerPage } from './pages/DatasetManagerPage';
import { ReportsPage } from './pages/ReportsPage';
import { DocumentationPage } from './pages/DocumentationPage';

export function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedRouteResult, setSelectedRouteResult] = useState<RouteResult | null>(null);

  useEffect(() => {
    api.getDemoProblem().then(demo => {
      setLocations(demo.locations);
      api.optimizeSingle(demo.locations, 'AUTO').then(res => {
        setSelectedRouteResult(res);
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  locations={locations}
                  setLocations={setLocations}
                  selectedRouteResult={selectedRouteResult}
                  setSelectedRouteResult={setSelectedRouteResult}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/builder"
              element={
                <ProblemBuilderPage
                  locations={locations}
                  setLocations={setLocations}
                />
              }
            />
            <Route
              path="/optimizer"
              element={
                <OptimizerPage
                  locations={locations}
                  selectedRouteResult={selectedRouteResult}
                  setSelectedRouteResult={setSelectedRouteResult}
                />
              }
            />
            <Route
              path="/lab"
              element={
                <AlgorithmLabPage
                  locations={locations}
                />
              }
            />
            <Route
              path="/visualizer"
              element={
                <VisualizationPage
                  locations={locations}
                  selectedRouteResult={selectedRouteResult}
                  setSelectedRouteResult={setSelectedRouteResult}
                />
              }
            />
            <Route
              path="/comparison"
              element={
                <ComparisonPage
                  locations={locations}
                  selectedRouteResult={selectedRouteResult}
                  setSelectedRouteResult={setSelectedRouteResult}
                />
              }
            />
            <Route
              path="/benchmark"
              element={<BenchmarkPage />}
            />
            <Route
              path="/datasets"
              element={
                <DatasetManagerPage
                  locations={locations}
                  setLocations={setLocations}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ReportsPage
                  locations={locations}
                  selectedRouteResult={selectedRouteResult}
                />
              }
            />
            <Route
              path="/docs"
              element={<DocumentationPage />}
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>

        <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>Smart Delivery Optimization System — Academic DAA Project</span>
            <span>Adaptive Algorithmic Framework for Delivery Route Planning</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
