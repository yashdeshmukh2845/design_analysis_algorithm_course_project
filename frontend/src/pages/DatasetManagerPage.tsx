import React, { useState } from 'react';
import type { Location } from '../types';
import { api } from '../services/api';
import { Database, Download, Zap, RefreshCw } from 'lucide-react';

interface DatasetManagerPageProps {
  locations: Location[];
  setLocations: (locs: Location[]) => void;
  setActiveTab?: (tab: string) => void;
}

export const DatasetManagerPage: React.FC<DatasetManagerPageProps> = ({
  locations,
  setLocations
}) => {
  const [numRandom, setNumRandom] = useState(10);
  const [spreadKm, setSpreadKm] = useState(12.0);
  const [csvOutput, setCsvOutput] = useState<string | null>(null);

  const handleGenerateRandom = async () => {
    try {
      const data = await api.generateRandomDataset(numRandom, spreadKm);
      setLocations(data);
    } catch (e) {
      alert("Failed to generate dataset.");
    }
  };

  const handleLoadPuneDemo = async () => {
    const demo = await api.getDemoProblem();
    setLocations(demo.locations);
  };

  const handleExportCSV = async () => {
    const res = await api.exportCSV(locations);
    setCsvOutput(res.csv_content);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> Delivery Dataset Manager
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Generate synthetic delivery locations, load preset demo networks, or export CSV datasets
          </p>
        </div>

        <button
          onClick={handleLoadPuneDemo}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-mono text-xs rounded-xl font-bold flex items-center gap-2"
        >
          <Zap className="w-4 h-4" /> Load Pune Demo Dataset (10 Locations)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" /> Random Dataset Generator
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Number of Delivery Locations (N)</label>
              <select
                value={numRandom}
                onChange={(e) => setNumRandom(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value={5}>5 Locations (Small Exact Benchmark)</option>
                <option value={10}>10 Locations (Medium Exact Benchmark)</option>
                <option value={15}>15 Locations (Branch & Bound Test)</option>
                <option value={20}>20 Locations (DP / Heuristic Boundary)</option>
                <option value={25}>25 Locations (Scalable Heuristic)</option>
                <option value={50}>50 Locations (Large Scale Heuristic)</option>
                <option value={100}>100 Locations (Stress Test)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Geographic Spread Radius ({spreadKm} km)</label>
              <input
                type="range"
                min="5"
                max="50"
                value={spreadKm}
                onChange={(e) => setSpreadKm(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <button
              onClick={handleGenerateRandom}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Generate {numRandom} Locations Dataset
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV Dataset
          </h3>

          <p className="text-xs text-slate-300 font-sans">
            Export configured delivery dataset ({locations.length} locations) to standard CSV format:
            <code className="block mt-1 text-[11px] font-mono text-cyan-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
              id,name,latitude,longitude,weight,priority,earliest,latest
            </code>
          </p>

          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Generate CSV Export Data
          </button>

          {csvOutput && (
            <textarea
              rows={5}
              readOnly
              value={csvOutput}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
