import React from 'react';
import type { TraceEvent, SelectionRecommendation } from '../types';
import { HelpCircle } from 'lucide-react';

interface AlgorithmStatusPanelProps {
  algorithmName: string;
  complexity: string;
  isOptimal: boolean;
  currentEvent?: TraceEvent;
  recommendation?: SelectionRecommendation;
  totalSteps: number;
}

export const AlgorithmStatusPanel: React.FC<AlgorithmStatusPanelProps> = ({
  algorithmName,
  complexity,
  isOptimal,
  currentEvent,
  recommendation,
  totalSteps
}) => {
  const currentStepNum = currentEvent ? currentEvent.step : 0;
  const progressPercent = totalSteps > 0 ? Math.min(100, Math.round((currentStepNum / totalSteps) * 100)) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Algorithm Engine Status</h4>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            isOptimal ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}>
            {isOptimal ? 'EXACT OPTIMAL' : 'HEURISTIC'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mt-1">{algorithmName}</h3>
        <p className="text-xs text-slate-400 font-mono">Time Complexity: <span className="text-cyan-400">{complexity}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">NODES EXPLORED</span>
          <span className="text-lg font-bold text-cyan-400">{currentEvent?.explored_count || 0}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">BRANCHES PRUNED</span>
          <span className="text-lg font-bold text-rose-400">{currentEvent?.pruned_count || 0}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">CURRENT COST</span>
          <span className="text-base font-bold text-white">
            {currentEvent?.cost ? `${currentEvent.cost.toFixed(2)} km` : '0.00 km'}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px]">BEST KNOWN COST</span>
          <span className="text-base font-bold text-amber-400">
            {currentEvent?.best_cost ? `${currentEvent.best_cost.toFixed(2)} km` : 'N/A'}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
          <span>Execution Progress</span>
          <span className="text-cyan-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>WHAT IS HAPPENING?</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {currentEvent?.description || "Select or play an algorithm to watch the step-by-step state space exploration."}
        </p>
      </div>

      {recommendation && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Adaptive Selector Insight</span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {recommendation.reason}
          </p>
        </div>
      )}
    </div>
  );
};
