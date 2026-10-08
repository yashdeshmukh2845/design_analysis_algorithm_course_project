import React from 'react';
import type { SelectionRecommendation, MLPrediction } from '../types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AlgorithmSelectorCardProps {
  recommendation?: SelectionRecommendation;
  mlPrediction?: MLPrediction;
  onSelectAlgorithm?: (algo: string) => void;
  selectedAlgorithm?: string;
}

export const AlgorithmSelectorCard: React.FC<AlgorithmSelectorCardProps> = ({
  recommendation,
  mlPrediction,
  onSelectAlgorithm,
  selectedAlgorithm
}) => {
  if (!recommendation) return null;

  const isRecommendedSelected = selectedAlgorithm === 'AUTO' || selectedAlgorithm === recommendation.recommended_algorithm;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adaptive Algorithm Selector</h3>
            <span className="text-[11px] text-slate-400 font-mono">Dynamic Problem Complexity Analyzer</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-mono text-cyan-400">
          <span>Match Confidence: <strong>{Math.round(recommendation.confidence_score * 100)}%</strong></span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono text-cyan-400 font-semibold">RECOMMENDED ALGORITHM</span>
          <span className="text-xs font-mono text-amber-400 font-bold">{recommendation.expected_complexity}</span>
        </div>
        <div className="text-xl font-extrabold text-white flex items-center gap-3">
          <span>{recommendation.recommended_algorithm}</span>
          {recommendation.is_optimal_guaranteed ? (
            <span className="text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
              ✓ Guaranteed Exact Optimum
            </span>
          ) : (
            <span className="text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
              ⚡ Scalable Heuristic
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans border-l-2 border-cyan-500 pl-3 py-1 bg-cyan-950/20">
          "{recommendation.reason}"
        </p>

        {onSelectAlgorithm && (
          <button
            onClick={() => onSelectAlgorithm(recommendation.recommended_algorithm)}
            className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              isRecommendedSelected
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isRecommendedSelected ? '✓ Currently Selected for Optimization' : `Select ${recommendation.recommended_algorithm}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> ALGORITHM ADVANTAGES
          </span>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {recommendation.pros.map((pro, idx) => (
              <li key={idx}>{pro}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-rose-400 font-bold flex items-center gap-1.5 font-mono text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" /> LIMITATIONS & CONSTRAINTS
          </span>
          <p className="text-slate-300 leading-snug">
            {recommendation.limitations}
          </p>
        </div>
      </div>

      {mlPrediction && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Experimental ML Classifier Prediction:</span>
          <span className="text-purple-400 font-bold">{mlPrediction.predicted_algorithm} ({Math.round(mlPrediction.confidence * 100)}%)</span>
        </div>
      )}
    </div>
  );
};
