import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type {
  DarkStore,
  DeliveryPartner,
  CustomerOrder,
  QuickCommerceDispatchResult,
} from '../types';
import { QuickCommerceMap } from '../components/QuickCommerceMap';
import {
  Zap,
  CloudRain,
  Flame,
  PlusCircle,
  RotateCcw,
  Bike,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Package,
  Star,
  Info
} from 'lucide-react';

export const QuickCommerceDispatchPage: React.FC = () => {
  const [darkStores, setDarkStores] = useState<DarkStore[]>([]);
  const [riders, setRiders] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [dispatchResult, setDispatchResult] = useState<QuickCommerceDispatchResult | null>(null);

  const [selectedAlgo, setSelectedAlgo] = useState<string>('Branch & Bound');
  const [activeRidersCount, setActiveRidersCount] = useState<number>(3);
  const [rainSurge, setRainSurge] = useState<boolean>(false);
  const [rushHour, setRushHour] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Map simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  // Load initial state
  const fetchState = async () => {
    try {
      const data = await api.getQuickCommerceState();
      setDarkStores(data.dark_stores || []);
      setRiders(data.riders || []);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch quick commerce state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Run dispatch
  const handleDispatch = async (algoOverride?: string, rainOverride?: boolean, rushOverride?: boolean, countOverride?: number) => {
    setLoading(true);
    try {
      const result: QuickCommerceDispatchResult = await api.dispatchQuickCommerceFleet({
        algorithm: algoOverride !== undefined ? algoOverride : selectedAlgo,
        rain_surge: rainOverride !== undefined ? rainOverride : rainSurge,
        rush_hour: rushOverride !== undefined ? rushOverride : rushHour,
        active_riders_count: countOverride !== undefined ? countOverride : activeRidersCount,
      });
      setDispatchResult(result);
      setSimulationProgress(0);
      setIsSimulating(true);
    } catch (err: any) {
      console.error('Dispatch failed:', err);
      alert(err.response?.data?.detail || 'Dispatch calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Initial dispatch on mount once state is loaded
  useEffect(() => {
    if (orders.length > 0 && darkStores.length > 0 && !dispatchResult) {
      handleDispatch();
    }
  }, [orders, darkStores]);

  // Inject a new customer order
  const handleAddLiveOrder = async () => {
    setLoading(true);
    try {
      await api.addQuickCommerceOrder();
      await fetchState();
      await handleDispatch();
    } catch (err) {
      console.error('Failed to add live order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to default demo state
  const handleReset = async () => {
    setLoading(true);
    try {
      const data = await api.resetQuickCommerceState();
      setDarkStores(data.dark_stores || []);
      setRiders(data.riders || []);
      setOrders(data.orders || []);
      setDispatchResult(null);
      setSimulationProgress(0);
      setIsSimulating(false);
      handleDispatch();
    } catch (err) {
      console.error('Failed to reset state:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header & Live Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-400" /> Blinkit QuickRoute Engine
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
                Pune Dark Store Fleet (Live)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              10-Minute Quick Commerce Fleet Dispatch Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              DAA-powered multi-depot quick commerce platform modeling real dark stores, delivery partners with bag capacities, live customer SLAs, and weather surge.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddLiveOrder}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              ➕ Inject Live Customer Order
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              title="Reset to default demo"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics HUD */}
        {dispatchResult && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Total Orders
              </span>
              <div className="text-xl font-black text-white mt-1">
                {dispatchResult.summary.total_orders} <span className="text-xs font-normal text-slate-400">drops</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> On-Time SLA
              </span>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {dispatchResult.summary.sla_success_rate_percent}%
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-amber-400" /> Active Riders
              </span>
              <div className="text-xl font-black text-amber-400 mt-1">
                {dispatchResult.summary.active_riders_used} <span className="text-xs font-normal text-slate-400">deployed</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Total Distance
              </span>
              <div className="text-xl font-black text-teal-400 mt-1">
                {dispatchResult.summary.total_fleet_distance_km} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" /> Distance Saved
              </span>
              <div className="text-xl font-black text-purple-400 mt-1">
                {dispatchResult.summary.distance_saved_percent}% <span className="text-xs font-normal text-slate-400">saved</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-pink-400" /> Compute Time
              </span>
              <div className="text-xl font-black text-pink-400 mt-1">
                {dispatchResult.summary.total_execution_time_ms} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel: Algorithms & Environmental Scenarios */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* DAA Algorithm Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" /> Algorithm:
          </span>
          <select
            value={selectedAlgo}
            onChange={(e) => {
              const newAlgo = e.target.value;
              setSelectedAlgo(newAlgo);
              handleDispatch(newAlgo);
            }}
            className="bg-slate-800 text-cyan-400 font-bold border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="Branch & Bound">Branch & Bound (Lower-Bound Pruning)</option>
            <option value="Held-Karp Bitmask DP">Held-Karp Bitmask DP (Optimal O(N² 2ᴺ))</option>
            <option value="Nearest Neighbor + 2-opt">Nearest Neighbor + 2-Opt (Fast Local Search)</option>
            <option value="Greedy">Greedy Nearest Neighbor (O(N²))</option>
          </select>
        </div>

        {/* Real-Life Scenarios: Weather & Traffic Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const nextRain = !rainSurge;
              setRainSurge(nextRain);
              handleDispatch(undefined, nextRain);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              rainSurge
                ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <CloudRain className={`w-4 h-4 ${rainSurge ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} />
            🌧️ Rain Surge (+35% Delay)
          </button>

          <button
            onClick={() => {
              const nextRush = !rushHour;
              setRushHour(nextRush);
              handleDispatch(undefined, undefined, nextRush);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              rushHour
                ? 'bg-amber-600/30 text-amber-300 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${rushHour ? 'text-amber-400' : 'text-slate-400'}`} />
            🚦 Rush Hour Traffic
          </button>

          {/* Active Riders Count Slider */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 font-bold">Riders:</span>
            <span className="text-xs font-black text-amber-400">{activeRidersCount}</span>
            <input
              type="range"
              min="1"
              max="4"
              value={activeRidersCount}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setActiveRidersCount(count);
                handleDispatch(undefined, undefined, undefined, count);
              }}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDispatch()}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            {loading ? 'Optimizing...' : '⚡ Re-Dispatch Fleet'}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map (70%) + Sidebar (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map & Pipeline Card */}
        <div className="lg:col-span-8 space-y-6">
          <QuickCommerceMap
            darkStores={darkStores}
            orders={orders}
            dispatches={dispatchResult?.dispatches || []}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            simulationProgress={simulationProgress}
            setSimulationProgress={setSimulationProgress}
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
          />

          {/* DAA Academic Pipeline Explanation Card (Viva-Ready) */}
          {dispatchResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                    DAA
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      3-Stage Algorithmic Dispatch Pipeline
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      How Quick Commerce converts an NP-Hard problem into sub-second optimal routing
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-cyan-400 font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                  {dispatchResult.complexity}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Stage 1: Multi-Hub Partitioning
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">Nearest Dark Store</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Customer orders clustered to the nearest dark store with inventory using Euclidean/Haversine distance.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Stage 2: Capacity Constraints
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">Greedy Knapsack Bin-Packing</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Fitted grocery packets into rider backpacks respecting weight limits (14–20 kg) and maximum 5 orders per trip.
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Stage 3: Drop Sequencing
                  </span>
                  <h4 className="text-xs font-bold text-slate-200">{selectedAlgo}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Solves the Travelling Salesperson Problem (TSP) for each rider's multi-stop drop loop from Dark Store ➔ Customers ➔ Dark Store.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-800/30 p-3.5 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <b className="text-cyan-300">Viva Insight: </b>
                  {dispatchResult.daa_pipeline_explanation.viva_takeaway}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Rider Fleet Cards & Live Orders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Riders Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Bike className="w-4 h-4 text-amber-400" /> Delivery Fleet Status
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {dispatchResult?.dispatches.length || 0} of {riders.length} Fleet Active
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {dispatchResult?.dispatches.map((plan) => (
                <div
                  key={plan.rider_id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-slate-950 shadow-md"
                        style={{ backgroundColor: plan.color }}
                      >
                        {plan.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{plan.rider_name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="text-amber-400 font-bold flex items-center">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {plan.rating}
                          </span>
                          <span>•</span>
                          <span>{plan.vehicle_model}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {plan.orders_count} drops
                    </span>
                  </div>

                  {/* Backpack Load Capacity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Bag Load (Knapsack)</span>
                      <span className="font-bold text-slate-300">
                        {plan.total_load_kg} / {plan.bag_max_weight_kg} kg ({plan.bag_utilization_percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${plan.bag_utilization_percent}%`,
                          backgroundColor: plan.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Rider Trip Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
                    <div>
                      <span className="text-slate-500">Distance</span>
                      <p className="font-bold text-slate-300">{plan.route_distance_km} km</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Trip Time</span>
                      <p className="font-bold text-slate-300">{plan.estimated_trip_min} min</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cost</span>
                      <p className="font-bold text-slate-300">₹{plan.fuel_cost_inr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Orders Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" /> Customer Orders Queue
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {orders.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {orders.map((ord) => {
                const isVip = ord.priority === 'VIP_10_MIN';
                return (
                  <div
                    key={ord.id}
                    className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{ord.customer_name}</h4>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          isVip ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isVip ? '⚡ 10m VIP' : '20m Standard'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">{ord.address}</p>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/50">
                      <span>{ord.items.slice(0, 2).join(', ')}...</span>
                      <span className="font-bold text-slate-400">{ord.weight_kg} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
