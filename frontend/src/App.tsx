import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            locations={locations}
            setLocations={setLocations}
            selectedRouteResult={selectedRouteResult}
            setSelectedRouteResult={setSelectedRouteResult}
          />
        )}
        {activeTab === 'builder' && (
          <ProblemBuilderPage
            locations={locations}
            setLocations={setLocations}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'optimizer' && (
          <OptimizerPage
            locations={locations}
            selectedRouteResult={selectedRouteResult}
            setSelectedRouteResult={setSelectedRouteResult}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'lab' && (
          <AlgorithmLabPage
            locations={locations}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'visualizer' && (
          <VisualizationPage
            locations={locations}
            selectedRouteResult={selectedRouteResult}
            setSelectedRouteResult={setSelectedRouteResult}
          />
        )}
        {activeTab === 'comparison' && (
          <ComparisonPage
            locations={locations}
            selectedRouteResult={selectedRouteResult}
            setSelectedRouteResult={setSelectedRouteResult}
          />
        )}
        {activeTab === 'benchmark' && (
          <BenchmarkPage />
        )}
        {activeTab === 'datasets' && (
          <DatasetManagerPage
            locations={locations}
            setLocations={setLocations}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsPage
            locations={locations}
            selectedRouteResult={selectedRouteResult}
          />
        )}
        {activeTab === 'docs' && (
          <DocumentationPage />
        )}
      </main>

      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Smart Delivery Optimization System — Academic DAA Project</span>
          <span>Adaptive Algorithmic Framework for Delivery Route Planning</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
