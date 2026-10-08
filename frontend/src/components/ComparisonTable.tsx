import React from 'react';
import type { RouteResult } from '../types';
import { Cpu, BarChart } from 'lucide-react';

interface ComparisonTableProps {
  results: RouteResult[];
  onSelectResult?: (res: RouteResult) => void;
  selectedAlgorithmName?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  results,
  onSelectResult,
  selectedAlgorithmName
}) => {
  if (results.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-cyan-400" />
            Algorithm Performance Comparison Table
          </h3>
          <p className="text-xs text-slate-400 font-mono">Executed on identical input dataset</p>
        </div>
        <span className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-full">
          {results.length} Algorithms Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[11px]">
            <tr>
              <th className="py-3 px-4">Algorithm</th>
              <th className="py-3 px-4">Distance (km)</th>
              <th className="py-3 px-4">Est. Time (min)</th>
              <th className="py-3 px-4">Runtime (sec)</th>
              <th className="py-3 px-4">Guaranteed Optimal</th>
              <th className="py-3 px-4">Complexity</th>
              <th className="py-3 px-4">Explored / Pruned</th>
              <th className="py-3 px-4">Optimality Gap</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {results.map((res, idx) => {
              const isSelected = selectedAlgorithmName === res.algorithm;
              const isExact = res.is_optimal;
              const runtimeDisplay = res.execution_time_sec < 0.001 ? '<0.001 s' : `${res.execution_time_sec.toFixed(4)} s`;
              const gapDisplay = res.optimality_gap_percent !== undefined ? `${res.optimality_gap_percent.toFixed(1)}%` : '0.0%';

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-850 transition-all ${
                    isSelected ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <Cpu className={`w-4 h-4 ${isExact ? 'text-amber-400' : 'text-cyan-400'}`} />
                    {res.algorithm}
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-semibold">{res.distance_km} km</td>
                  <td className="py-3 px-4 text-slate-300">{res.travel_time_min} min</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{runtimeDisplay}</td>
                  <td className="py-3 px-4">
                    {res.is_optimal ? (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        YES (Exact)
                      </span>
                    ) : (
                      <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[10px]">
                        NO (Heuristic)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{res.complexity}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {res.nodes_explored} <span className="text-rose-400">({res.nodes_pruned} pruned)</span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className={res.optimality_gap_percent && res.optimality_gap_percent > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {gapDisplay}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onSelectResult && (
                      <button
                        onClick={() => onSelectResult(res)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
