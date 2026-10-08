import React, { useState, useEffect, useRef } from 'react';
import type { Location, RouteResult } from '../types';
import { Play, Pause, RotateCcw, Truck, CheckCircle2, Clock } from 'lucide-react';
import { LeafletMap } from './LeafletMap';

interface RouteAnimatorProps {
  locations: Location[];
  routeResult: RouteResult;
}

export const RouteAnimator: React.FC<RouteAnimatorProps> = ({ locations, routeResult }) => {
  const route = routeResult.route || [];
  const [isPlaying, setIsPlaying] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0.0);
  const [completedStops, setCompletedStops] = useState<number[]>([]);
  const animRef = useRef<number | null>(null);

  const routePoints: [number, number][] = route.map(idx => {
    const loc = locations[idx];
    return loc ? [loc.latitude, loc.longitude] : [18.5204, 73.8567];
  });

  const currentPos: [number, number] = React.useMemo(() => {
    if (routePoints.length === 0) return [18.5204, 73.8567];
    if (segmentIndex >= routePoints.length - 1) return routePoints[routePoints.length - 1];

    const p1 = routePoints[segmentIndex];
    const p2 = routePoints[segmentIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * progress;
    const lng = p1[1] + (p2[1] - p1[1]) * progress;
    return [lat, lng];
  }, [routePoints, segmentIndex, progress]);

  useEffect(() => {
    if (!isPlaying || routePoints.length < 2) return;

    const speedFactor = 0.015;

    const animate = () => {
      setProgress(prev => {
        if (prev + speedFactor >= 1.0) {
          setSegmentIndex(s => {
            const nextS = s + 1;
            if (nextS < route.length) {
              setCompletedStops(c => [...c, route[nextS]]);
            }
            if (nextS >= routePoints.length - 1) {
              setIsPlaying(false);
              return routePoints.length - 1;
            }
            return nextS;
          });
          return 0.0;
        }
        return prev + speedFactor;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, routePoints, route]);

  const handleReset = () => {
    setIsPlaying(false);
    setSegmentIndex(0);
    setProgress(0.0);
    setCompletedStops([]);
  };

  const currentStopLocIdx = route[segmentIndex] ?? 0;
  const currentLoc = locations[currentStopLocIdx] || { name: 'Depot' };

  return (
    <div className="space-y-4">
      <LeafletMap
        locations={locations}
        route={route}
        vehiclePosition={currentPos}
        currentStopIndex={segmentIndex}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'PAUSE ROUTE PLAYBACK' : 'PLAY ROUTE SIMULATION'}
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Current Stop: <strong className="text-cyan-400">{currentLoc.name}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed: <strong>{completedStops.length} / {Math.max(0, route.length - 1)}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Est. Distance: <strong>{routeResult.distance_km} km</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
