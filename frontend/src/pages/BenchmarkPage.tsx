import React, { useState } from 'react';
import type { SingleBenchmarkPoint } from '../types';
import { api } from '../services/api';
import { Activity, Play, TrendingUp, BarChart } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const BenchmarkPage: React.FC = () => {
  const [data, setData] = useState<SingleBenchmarkPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSizes] = useState<number[]>([4, 5, 6, 7, 8, 9, 10, 12]);

  const handleRunBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.runBenchmark(selectedSizes);
      setData(res);
    } catch (e: any) {
      alert("Benchmark failed.");
    } finally {
      setLoading(false);
    }
  };

  const runtimeChartData = React.useMemo(() => {
    const sizeMap: Record<number, any> = {};
    data.forEach(item => {
      if (!sizeMap[item.input_size]) {
        sizeMap[item.input_size] = { n: item.input_size };
      }
      sizeMap[item.input_size][item.algorithm] = item.runtime_sec;
    });
    return Object.values(sizeMap).sort((a, b) => a.n - b.n);
  }, [data]);

  const gapChartData = React.useMemo(() => {
    return data.filter(d => !d.is_optimal).map(d => ({
      name: `${d.algorithm} (N=${d.input_size})`,
      gap: d.optimality_gap_percent,
      runtime: d.runtime_sec
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> DAA Algorithm Benchmark Laboratory
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Empirical runtime performance, search space pruning, memory allocation & theoretical complexity validation
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          {loading ? 'Running Benchmark Suite...' : 'Execute Scalability Suite'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Execution Runtime vs Problem Size (N)
          </h3>
          <p className="text-xs text-slate-400 font-mono">X-axis: Locations (N) | Y-axis: Execution Time (seconds)</p>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runtimeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="n" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Brute Force" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Dynamic Programming" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Branch & Bound" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Greedy" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Nearest Neighbor + 2-opt" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <BarChart className="w-4 h-4 text-amber-400" /> Heuristic Optimality Gap (%)
          </h3>
          <p className="text-xs text-slate-400 font-mono">Distance difference relative to exact global optimum</p>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={gapChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                <Bar dataKey="gap" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
