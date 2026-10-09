import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Location, RouteResult } from '../types';
import { Play, Pause, RotateCcw, Truck, CheckCircle2, Clock, Zap } from 'lucide-react';
import { LeafletMap } from './LeafletMap';

interface RouteAnimatorProps {
  locations: Location[];
  routeResult: RouteResult;
}

const haversineDist = (p1: [number, number], p2: [number, number]): number => {
  const R = 6371; // km
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateHeading = (p1: [number, number], p2: [number, number]): number => {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

export const RouteAnimator: React.FC<RouteAnimatorProps> = ({ locations, routeResult }) => {
  const route = routeResult.route || [];
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentDist, setCurrentDist] = useState(0.0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Extract valid route points strictly bound within locations
  const validRoute = useMemo(() => {
    return route.filter(idx => idx >= 0 && idx < locations.length);
  }, [route, locations]);

  const routePoints: [number, number][] = useMemo(() => {
    return validRoute.map(idx => [locations[idx].latitude, locations[idx].longitude]);
  }, [validRoute, locations]);

  // Compute segment distances & cumulative distances
  const { totalDist, cumulativeDists } = useMemo(() => {
    if (routePoints.length < 2) return { totalDist: 0, cumulativeDists: [0] };
    const cum: number[] = [0];
    let sum = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const d = haversineDist(routePoints[i], routePoints[i + 1]);
      sum += d;
      cum.push(sum);
    }
    return { totalDist: sum, cumulativeDists: cum };
  }, [routePoints]);

  // Compute exact position, heading, segment index, and completed stops from currentDist
  const { currentPos, currentHeading, segmentIndex, completedStops } = useMemo(() => {
    if (routePoints.length === 0) {
      return {
        currentPos: [18.5204, 73.8567] as [number, number],
        currentHeading: 0,
        segmentIndex: 0,
        completedStops: []
      };
    }
    if (routePoints.length === 1 || totalDist === 0) {
      return {
        currentPos: routePoints[0],
        currentHeading: 0,
        segmentIndex: 0,
        completedStops: validRoute
      };
    }

    const targetD = Math.max(0, Math.min(totalDist, currentDist));

    // Find segment i where cumulativeDists[i] <= targetD <= cumulativeDists[i+1]
    let segIdx = 0;
    for (let i = 0; i < cumulativeDists.length - 1; i++) {
      if (targetD >= cumulativeDists[i]) {
        segIdx = i;
      }
    }

    if (segIdx >= routePoints.length - 1) {
      const last = routePoints[routePoints.length - 1];
      const prev = routePoints[routePoints.length - 2];
      return {
        currentPos: last,
        currentHeading: calculateHeading(prev, last),
        segmentIndex: routePoints.length - 1,
        completedStops: validRoute
      };
    }

    const p1 = routePoints[segIdx];
    const p2 = routePoints[segIdx + 1];
    const segLen = cumulativeDists[segIdx + 1] - cumulativeDists[segIdx];
    const frac = segLen > 0.00001 ? (targetD - cumulativeDists[segIdx]) / segLen : 0;

    const lat = p1[0] + (p2[0] - p1[0]) * frac;
    const lng = p1[1] + (p2[1] - p1[1]) * frac;
    const heading = calculateHeading(p1, p2);

    const completed = validRoute.slice(0, segIdx + 1);

    return {
      currentPos: [lat, lng] as [number, number],
      currentHeading: heading,
      segmentIndex: segIdx,
      completedStops: completed
    };
  }, [routePoints, totalDist, cumulativeDists, currentDist, validRoute]);

  // Smooth continuous requestAnimationFrame loop
  useEffect(() => {
    if (!isPlaying || totalDist === 0) {
      lastTimeRef.current = null;
      return;
    }

    // Base speed: cover total route in 15 seconds at 1x speed
    const speedKmPerSec = Math.max(0.5, (totalDist / 15.0) * speedMultiplier);

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = (now - lastTimeRef.current) / 1000.0; // seconds
        setCurrentDist(prev => {
          const next = prev + speedKmPerSec * dt;
          if (next >= totalDist) {
            setIsPlaying(false);
            return totalDist;
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
    };
  }, [isPlaying, totalDist, speedMultiplier]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDist(0.0);
  };

  const handleSeek = (distVal: number) => {
    setCurrentDist(distVal);
  };

  const currentStopLocIdx = validRoute[segmentIndex] ?? 0;
  const currentLoc = locations[currentStopLocIdx] || { name: 'Depot' };

  return (
    <div className="space-y-4">
      <LeafletMap
        locations={locations}
        route={validRoute}
        vehiclePosition={currentPos}
        vehicleHeading={currentHeading}
        currentStopIndex={segmentIndex}
        completedStops={completedStops}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Scrubber Range */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Stop {segmentIndex + 1} of {Math.max(1, validRoute.length)} ({currentLoc.name})</span>
            <span>{totalDist > 0 ? ((currentDist / totalDist) * 100).toFixed(0) : 0}% Route Completed ({currentDist.toFixed(1)} / {totalDist.toFixed(1)} km)</span>
          </div>
          <input
            type="range"
            min="0"
            max={totalDist || 1}
            step="0.01"
            value={currentDist}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isPlaying && currentDist >= totalDist) {
                  setCurrentDist(0);
                }
                setIsPlaying(!isPlaying);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'PAUSE PLAYBACK' : 'PLAY SIMULATION'}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selection */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              {[0.5, 1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    speedMultiplier === s
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Target: <strong className="text-cyan-400">{currentLoc.name}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Visited: <strong>{completedStops.length} / {Math.max(0, validRoute.length - 1)}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Length: <strong>{totalDist.toFixed(2)} km</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


