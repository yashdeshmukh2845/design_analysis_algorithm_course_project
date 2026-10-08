import React, { useState, useEffect } from 'react';
import type { Location, RouteResult, SelectionRecommendation } from '../types';
import { api } from '../services/api';
import {
  Zap,
  MapPin,
  Route,
  Activity,
  Cpu,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { NodeGraphCanvas } from '../components/NodeGraphCanvas';
import { AlgorithmSelectorCard } from '../components/AlgorithmSelectorCard';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  locations: Location[];
  setLocations: (locs: Location[]) => void;
  selectedRouteResult: RouteResult | null;
  setSelectedRouteResult: (res: RouteResult) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  locations,
  setLocations,
  selectedRouteResult,
  setSelectedRouteResult
}) => {
  const [recommendation, setRecommendation] = useState<SelectionRecommendation | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locations.length > 0) {
      api.analyzeProblem(locations).then(res => {
        setRecommendation(res.recommendation);
      }).catch(err => console.error(err));
    }
  }, [locations]);

  const loadDemoData = async () => {
    setLoading(true);
    try {
      const demo = await api.getDemoProblem();
      setLocations(demo.locations);
      const res = await api.optimizeSingle(demo.locations, 'AUTO');
      setSelectedRouteResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Academic DAA Project Platform
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Smart Delivery Optimization System
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            An Adaptive Algorithmic Framework for Intelligent Delivery Route Planning. Compare exact dynamic programming, branch & bound, and heuristic algorithms under real-world operational constraints.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('optimizer')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <Route className="w-4 h-4" /> Run Optimization Engine <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={loadDemoData}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> {loading ? 'Loading...' : 'Load Pune Demo Dataset (10 Stops)'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL DELIVERIES</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{locations.length}</div>
          <span className="text-[11px] text-slate-400 font-sans">Active Delivery Nodes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL DISTANCE</span>
            <Route className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {selectedRouteResult ? `${selectedRouteResult.distance_km} km` : '0.0 km'}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Optimized Route Length</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex justify-between text-slate-400 text-xs font-mono">
            <span>ESTIMATED TIME</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {selectedRouteResult ? `${selectedRouteResult.travel_time_min} min` : '0 min'}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Includes Service & Traffic</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex justify-between text-slate-400 text-xs font-mono">
            <span>ALGORITHM SELECTED</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 truncate font-mono">
            {selectedRouteResult ? selectedRouteResult.algorithm : 'None'}
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            {selectedRouteResult?.is_optimal ? '✓ Exact Optimum Guaranteed' : 'Scalable Heuristic'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Current Route Graph Preview
            </h3>
            <button
              onClick={() => setActiveTab('visualizer')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open Live Visualizer Laboratory <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <NodeGraphCanvas
            locations={locations}
            currentEvent={selectedRouteResult?.execution_trace?.[selectedRouteResult.execution_trace.length - 1]}
            algorithmName={selectedRouteResult?.algorithm || 'No Algorithm Selected'}
            isOptimal={selectedRouteResult?.is_optimal || false}
            isFinished={true}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Adaptive Recommendation
          </h3>
          <AlgorithmSelectorCard
            recommendation={recommendation}
            selectedAlgorithm={selectedRouteResult?.algorithm}
          />
        </div>
      </div>
    </div>
  );
};
