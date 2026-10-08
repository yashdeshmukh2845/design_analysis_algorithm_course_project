import React, { useState, useEffect } from 'react';
import type { Location, RouteResult, SelectionRecommendation, MLPrediction } from '../types';
import { api } from '../services/api';
import { Route, Play, MapPin, AlertTriangle } from 'lucide-react';
import { AlgorithmSelectorCard } from '../components/AlgorithmSelectorCard';
import { MultiObjectiveSliders } from '../components/MultiObjectiveSliders';
import { RouteAnimator } from '../components/RouteAnimator';

interface OptimizerPageProps {
  locations: Location[];
  selectedRouteResult: RouteResult | null;
  setSelectedRouteResult: (res: RouteResult) => void;
  setActiveTab: (tab: string) => void;
}

export const OptimizerPage: React.FC<OptimizerPageProps> = ({
  locations,
  selectedRouteResult,
  setSelectedRouteResult,
  setActiveTab
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('AUTO');
  const [requiredOptimality] = useState<string>('EXACT');
  const [weights, setWeights] = useState({ alpha: 0.40, beta: 0.30, gamma: 0.15, delta: 0.15 });
  const [trafficLevel, setTrafficLevel] = useState<string>('LOW');
  const [returnToDepot, setReturnToDepot] = useState<boolean>(true);

  const [recommendation, setRecommendation] = useState<SelectionRecommendation | undefined>(undefined);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    if (locations.length > 0) {
      api.analyzeProblem(locations, requiredOptimality).then(res => {
        setRecommendation(res.recommendation);
        setMlPrediction(res.ml_prediction);
      }).catch(err => console.error(err));
    }
  }, [locations, requiredOptimality]);

  const handleRunOptimization = async () => {
    if (locations.length < 2) {
      alert("Please add at least 2 locations (Depot + 1 Delivery Stop) to optimize.");
      return;
    }

    if (selectedAlgo === 'Brute Force' && locations.length > 9) {
      setWarningMsg(`⚠️ Brute Force evaluates ${(locations.length-1)}! permutations. For ${locations.length} locations, this requires massive computation. Recommended algorithm is ${recommendation?.recommended_algorithm || 'Dynamic Programming'}.`);
    } else {
      setWarningMsg(null);
    }

    setLoading(true);
    try {
      const res = await api.optimizeSingle(
        locations,
        selectedAlgo,
        weights,
        trafficLevel,
        returnToDepot,
        requiredOptimality
      );
      setSelectedRouteResult(res);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Optimization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-cyan-400" /> Delivery Route Optimizer
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Execute adaptive route planning engine across {locations.length} delivery locations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="AUTO">AUTO (Adaptive Selection Engine)</option>
            <option value="Brute Force">Brute Force O(N!)</option>
            <option value="Dynamic Programming (Held-Karp)">Dynamic Programming O(N² 2ᴺ)</option>
            <option value="Branch & Bound">Branch & Bound (Pruned State Space)</option>
            <option value="Greedy (Nearest Neighbor)">Greedy Nearest Neighbor O(N²)</option>
            <option value="Nearest Neighbor + 2-opt">Nearest Neighbor + 2-opt Heuristic</option>
          </select>

          <button
            onClick={handleRunOptimization}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {warningMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{warningMsg}</span>
          </div>
          <button
            onClick={() => setSelectedAlgo('AUTO')}
            className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 ml-4"
          >
            Switch to AUTO
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <AlgorithmSelectorCard
            recommendation={recommendation}
            mlPrediction={mlPrediction}
            selectedAlgorithm={selectedAlgo}
            onSelectAlgorithm={(algo) => setSelectedAlgo(algo)}
          />

          <MultiObjectiveSliders
            weights={weights}
            trafficLevel={trafficLevel}
            returnToDepot={returnToDepot}
            onChangeWeights={setWeights}
            onChangeTraffic={setTrafficLevel}
            onChangeReturnDepot={setReturnToDepot}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Geographic Route Map & Delivery Simulation
            </h3>
            {selectedRouteResult && (
              <button
                onClick={() => setActiveTab('visualizer')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                Inspect Step-by-Step DAA Trace →
              </button>
            )}
          </div>

          {selectedRouteResult ? (
            <RouteAnimator
              locations={locations}
              routeResult={selectedRouteResult}
            />
          ) : (
            <div className="w-full h-[520px] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-xs font-mono">
              Click "Run Optimization" above to compute and visualize route.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
