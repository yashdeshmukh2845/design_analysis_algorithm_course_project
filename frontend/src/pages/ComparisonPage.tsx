import React, { useState } from 'react';
import type { Location, RouteResult } from '../types';
import { api } from '../services/api';
import { BarChart2, Play, Cpu } from 'lucide-react';
import { ComparisonTable } from '../components/ComparisonTable';
import { NodeGraphCanvas } from '../components/NodeGraphCanvas';

interface ComparisonPageProps {
  locations: Location[];
  selectedRouteResult: RouteResult | null;
  setSelectedRouteResult: (res: RouteResult) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  locations,
  selectedRouteResult,
  setSelectedRouteResult
}) => {
  const [results, setResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompareAll = async () => {
    if (locations.length < 1) return;
    setLoading(true);
    try {
      const data = await api.compareAlgorithms(locations);
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedRouteResult(data.results[0]);
      }
    } catch (e: any) {
      alert(e.response?.data?.detail || "Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (locations.length > 0 && results.length === 0) {
      handleCompareAll();
    }
  }, [locations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" /> Multi-Algorithm Side-by-Side Comparison
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Execute all 5 algorithms simultaneously on identical input dataset to measure trade-offs
          </p>
        </div>

        <button
          onClick={handleCompareAll}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          {loading ? 'Running All Algorithms...' : 'Run 1-Click Multi-Algorithm Benchmark'}
        </button>
      </div>

      <ComparisonTable
        results={results}
        onSelectResult={(res) => setSelectedRouteResult(res)}
        selectedAlgorithmName={selectedRouteResult?.algorithm}
      />

      {selectedRouteResult && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Inspecting Route: {selectedRouteResult.algorithm}
          </h3>
          <NodeGraphCanvas
            locations={locations}
            currentEvent={selectedRouteResult.execution_trace?.[selectedRouteResult.execution_trace.length - 1]}
            algorithmName={selectedRouteResult.algorithm}
            isOptimal={selectedRouteResult.is_optimal}
            isFinished={true}
          />
        </div>
      )}
    </div>
  );
};
