import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

interface VisualizationControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlayPause: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlayPause,
  onStepChange,
  onSpeedChange,
  onReset
}) => {
  const speeds = [0.25, 0.5, 1, 2, 4];
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Progress Scrubber Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Step {currentStep + 1} of {Math.max(1, totalSteps)}</span>
          <span>{progressPercent.toFixed(0)}% Complete</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Playback Button Group */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Restart Animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-all"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onPlayPause}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'PAUSE' : 'PLAY ANIMATION'}
          </button>

          {/* Next Step */}
          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-all"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          <span className="text-[11px] font-mono text-slate-400 mr-1">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
