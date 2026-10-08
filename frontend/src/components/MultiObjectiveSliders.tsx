import React from 'react';
import { Sliders, ShieldAlert, Clock, Navigation, AlertTriangle } from 'lucide-react';

interface MultiObjectiveSlidersProps {
  weights: { alpha: number; beta: number; gamma: number; delta: number };
  trafficLevel: string;
  returnToDepot: boolean;
  onChangeWeights: (weights: { alpha: number; beta: number; gamma: number; delta: number }) => void;
  onChangeTraffic: (traffic: string) => void;
  onChangeReturnDepot: (returnDepot: boolean) => void;
}

export const MultiObjectiveSliders: React.FC<MultiObjectiveSlidersProps> = ({
  weights,
  trafficLevel,
  returnToDepot,
  onChangeWeights,
  onChangeTraffic,
  onChangeReturnDepot
}) => {
  const handleChange = (key: keyof typeof weights, val: number) => {
    onChangeWeights({ ...weights, [key]: val });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Multi-Objective Weight Configuration
        </h4>
        <span className="text-[11px] font-mono text-cyan-400">Total Score Formula</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Distance Weight Alpha */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-cyan-400" /> Distance Weight (α)</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.alpha * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.alpha}
            onChange={(e) => handleChange('alpha', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Time Weight Beta */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> Travel Time Weight (β)</span>
            <span className="text-blue-400 font-bold">{Math.round(weights.beta * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.beta}
            onChange={(e) => handleChange('beta', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Traffic Weight Gamma */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Traffic Weight (γ)</span>
            <span className="text-amber-400 font-bold">{Math.round(weights.gamma * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.gamma}
            onChange={(e) => handleChange('gamma', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Priority Penalty Weight Delta */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Priority & Late Penalty (δ)</span>
            <span className="text-rose-400 font-bold">{Math.round(weights.delta * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.delta}
            onChange={(e) => handleChange('delta', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* Traffic Level & Return to Depot Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Traffic Condition:</span>
          {['LOW', 'MODERATE', 'HIGH', 'SEVERE'].map((level) => (
            <button
              key={level}
              onClick={() => onChangeTraffic(level)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                trafficLevel === level
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={returnToDepot}
            onChange={(e) => onChangeReturnDepot(e.target.checked)}
            className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <span>Return to Depot</span>
        </label>
      </div>
    </div>
  );
};
