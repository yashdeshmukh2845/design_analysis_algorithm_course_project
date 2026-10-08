import React, { useState } from 'react';
import type { Location, RouteResult } from '../types';
import { api } from '../services/api';
import { FileText, Printer, Sparkles } from 'lucide-react';

interface ReportsPageProps {
  locations: Location[];
  selectedRouteResult: RouteResult | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ locations, selectedRouteResult }) => {
  const [reportData, setReportData] = useState<any | null>(null);

  const handleBuildReport = async () => {
    try {
      const data = await api.generateReport(
        "Smart Delivery Route Optimization Report",
        locations,
        { recommended_algorithm: selectedRouteResult?.algorithm || "Dynamic Programming" },
        selectedRouteResult ? [selectedRouteResult] : [],
        { alpha: 0.4, beta: 0.3, gamma: 0.15, delta: 0.15 }
      );
      setReportData(data);
    } catch (e) {
      alert("Failed to build report.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Academic Project Report Generator
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Generate printable project documentation, route summaries, and DAA algorithm comparative conclusions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBuildReport}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Build Academic Report
          </button>

          {reportData && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Export PDF
            </button>
          )}
        </div>
      </div>

      {reportData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 font-sans text-slate-200 print:bg-white print:text-black print:p-0">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">DESIGN AND ANALYSIS OF ALGORITHMS (DAA) PROJECT REPORT</span>
            <h1 className="text-2xl font-bold text-white print:text-black">{reportData.title}</h1>
            <p className="text-xs text-slate-400 print:text-gray-600">{reportData.subtitle}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono">1. Problem Specification</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono print:bg-gray-100">
              <div>
                <span className="text-slate-500 block">NETWORK NAME</span>
                <strong className="text-white print:text-black">{reportData.problem_summary.problem_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">TOTAL LOCATIONS</span>
                <strong className="text-cyan-400">{reportData.problem_summary.total_locations} Nodes</strong>
              </div>
              <div>
                <span className="text-slate-500 block">CENTRAL DEPOT</span>
                <strong className="text-white print:text-black">{reportData.problem_summary.depot_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">TRAFFIC LEVEL</span>
                <strong className="text-amber-400">{reportData.problem_summary.traffic_level}</strong>
              </div>
            </div>
          </div>

          {selectedRouteResult && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono">2. Optimization Results Summary</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono print:bg-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-500 block">ALGORITHM</span>
                    <strong className="text-emerald-400 text-sm">{selectedRouteResult.algorithm}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-mono">OPTIMAL DISTANCE</span>
                    <strong className="text-amber-400 text-sm">{selectedRouteResult.distance_km} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EXECUTION RUNTIME</span>
                    <strong className="text-blue-400 text-sm">{selectedRouteResult.execution_time_sec.toFixed(4)} s</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EXPLORED / PRUNED</span>
                    <strong className="text-white">{selectedRouteResult.nodes_explored} ({selectedRouteResult.nodes_pruned} pruned)</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">GENERATED ROUTE SEQUENCE:</span>
                  <p className="text-xs font-bold text-cyan-300 font-mono mt-1">
                    {'Depot (0) → ' + selectedRouteResult.route.slice(1, -1).join(' → ') + ' → Depot (0)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 uppercase font-mono">3. Academic DAA Conclusions</h3>
            <ul className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 list-disc list-inside print:bg-gray-100 print:text-black font-sans">
              {reportData.daa_conclusions.map((c: string, idx: number) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">Click "Build Academic Report" to generate report payload</h3>
        </div>
      )}
    </div>
  );
};
