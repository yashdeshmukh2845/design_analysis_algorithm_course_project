import React, { useState } from 'react';
import type { Location, PriorityLevel } from '../types';
import { MapPin, Plus, Trash2, Zap, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface ProblemBuilderPageProps {
  locations: Location[];
  setLocations: (locs: Location[]) => void;
  setActiveTab: (tab: string) => void;
}

export const ProblemBuilderPage: React.FC<ProblemBuilderPageProps> = ({
  locations,
  setLocations,
  setActiveTab
}) => {
  const [newLoc, setNewLoc] = useState<Location>({
    name: '',
    latitude: 18.5204,
    longitude: 73.8567,
    package_weight_kg: 5.0,
    priority: 'NORMAL',
    earliest_time_min: 540,
    latest_time_min: 1020,
    service_time_min: 5,
    is_depot: false
  });

  const handleAddLocation = () => {
    if (!newLoc.name.trim()) return;
    setLocations([...locations, { ...newLoc }]);
    setNewLoc({
      name: '',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.1,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.1,
      package_weight_kg: 5.0,
      priority: 'NORMAL',
      earliest_time_min: 540,
      latest_time_min: 1020,
      service_time_min: 5,
      is_depot: false
    });
  };

  const handleRemove = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleLoadDemo = async () => {
    const demo = await api.getDemoProblem();
    setLocations(demo.locations);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Delivery Problem Builder
          </h2>
          <p className="text-xs text-slate-400 font-mono">Customize depot, delivery locations, coordinates, package weights & time windows</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-mono text-xs rounded-xl font-bold flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Reset to Pune Demo Dataset
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Proceed to Optimizer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Add New Delivery Stop
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Stop Name / Address</label>
              <input
                type="text"
                placeholder="e.g., Kothrud Logistics Hub"
                value={newLoc.name}
                onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newLoc.latitude}
                  onChange={(e) => setNewLoc({ ...newLoc, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newLoc.longitude}
                  onChange={(e) => setNewLoc({ ...newLoc, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoc.package_weight_kg}
                  onChange={(e) => setNewLoc({ ...newLoc, package_weight_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Priority</label>
                <select
                  value={newLoc.priority}
                  onChange={(e) => setNewLoc({ ...newLoc, priority: e.target.value as PriorityLevel })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={newLoc.is_depot}
                onChange={(e) => setNewLoc({ ...newLoc, is_depot: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Set as Central Warehouse Depot 🏭</span>
            </label>

            <button
              onClick={handleAddLocation}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Location to Dataset
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Configured Locations ({locations.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Depot is Node #0</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {locations.map((loc, idx) => (
                  <tr key={idx} className="hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{idx}</td>
                    <td className="py-2.5 px-3 text-white font-semibold flex items-center gap-1.5">
                      {loc.is_depot ? '🏭' : '📍'} {loc.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{loc.package_weight_kg} kg</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        loc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        loc.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {loc.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRemove(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
