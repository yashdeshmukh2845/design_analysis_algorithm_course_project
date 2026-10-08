import React, { useState } from 'react';
import type { Location, RouteResult } from '../types';
import { api } from '../services/api';
import { Cpu, Play } from 'lucide-react';
import { NodeGraphCanvas } from '../components/NodeGraphCanvas';
import { VisualizationControls } from '../components/VisualizationControls';
import { AlgorithmStatusPanel } from '../components/AlgorithmStatusPanel';

interface AlgorithmLabPageProps {
  locations: Location[];
  setActiveTab?: (tab: string) => void;
}

export const AlgorithmLabPage: React.FC<AlgorithmLabPageProps> = ({ locations }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('Dynamic Programming (Held-Karp)');
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeSingle(locations, selectedAlgo);
      setResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const traceEvents = result?.execution_trace || [];
  const currentEvent = traceEvents[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> DAA Algorithm Experimentation Laboratory
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Manually execute individual DAA algorithms and inspect step-by-step state space exploration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl px-3 py-2"
          >
            <option value="Brute Force">Brute Force O(N!)</option>
            <option value="Dynamic Programming (Held-Karp)">Dynamic Programming O(N² 2ᴺ)</option>
            <option value="Branch & Bound">Branch & Bound (State Space Tree)</option>
            <option value="Greedy (Nearest Neighbor)">Greedy Nearest Neighbor O(N²)</option>
            <option value="Nearest Neighbor + 2-opt">Nearest Neighbor + 2-opt Heuristic</option>
          </select>

          <button
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> {loading ? 'Running...' : 'Execute Algorithm'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <NodeGraphCanvas
            locations={locations}
            currentEvent={currentEvent}
            algorithmName={result?.algorithm || selectedAlgo}
            isOptimal={result?.is_optimal || false}
            isFinished={currentStep >= traceEvents.length - 1}
          />

          <VisualizationControls
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={traceEvents.length}
            speed={speed}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onStepChange={(s) => setCurrentStep(s)}
            onSpeedChange={(sp) => setSpeed(sp)}
            onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
          />
        </div>

        <div>
          <AlgorithmStatusPanel
            algorithmName={result?.algorithm || selectedAlgo}
            complexity={result?.complexity || "O(N)"}
            isOptimal={result?.is_optimal || false}
            currentEvent={currentEvent}
            totalSteps={traceEvents.length}
          />
        </div>
      </div>
    </div>
  );
};
