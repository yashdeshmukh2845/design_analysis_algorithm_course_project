import React, { useMemo } from 'react';
import type { Location, TraceEvent } from '../types';
import { AlertTriangle, Cpu, Sparkles } from 'lucide-react';

interface NodeGraphCanvasProps {
  locations: Location[];
  currentEvent?: TraceEvent;
  algorithmName: string;
  isOptimal: boolean;
  isFinished: boolean;
}

export const NodeGraphCanvas: React.FC<NodeGraphCanvasProps> = ({
  locations,
  currentEvent,
  algorithmName,
  isOptimal,
  isFinished
}) => {
  const nodeCoords = useMemo(() => {
    if (locations.length === 0) return [];
    
    const lats = locations.map(l => l.latitude);
    const lngs = locations.map(l => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.01;
    const lngSpan = maxLng - minLng || 0.01;

    return locations.map((loc, idx) => {
      if (latSpan < 0.0001 && lngSpan < 0.0001) {
        const angle = (idx / locations.length) * 2 * Math.PI - Math.PI / 2;
        const cx = 400 + 220 * Math.cos(angle);
        const cy = 250 + 180 * Math.sin(angle);
        return { x: cx, y: cy, loc };
      }
      const padding = 70;
      const x = padding + ((loc.longitude - minLng) / lngSpan) * (800 - 2 * padding);
      const y = (500 - padding) - ((loc.latitude - minLat) / latSpan) * (500 - 2 * padding);
      return { x, y, loc };
    });
  }, [locations]);

  const currentPath = currentEvent?.path || [];
  const currentCost = currentEvent?.cost || 0;
  const bestCost = currentEvent?.best_cost || 0;
  const lowerBound = currentEvent?.lower_bound;
  const isPruned = currentEvent?.is_pruned || false;
  const eventType = currentEvent?.type || '';

  const allEdges = useMemo(() => {
    const edges = [];
    for (let i = 0; i < nodeCoords.length; i++) {
      for (let j = i + 1; j < nodeCoords.length; j++) {
        edges.push({
          source: i,
          target: j,
          x1: nodeCoords[i].x,
          y1: nodeCoords[i].y,
          x2: nodeCoords[j].x,
          y2: nodeCoords[j].y
        });
      }
    }
    return edges;
  }, [nodeCoords]);

  const activeEdges = useMemo(() => {
    if (currentPath.length < 2) return [];
    const edges = [];
    for (let i = 0; i < currentPath.length - 1; i++) {
      const u = currentPath[i];
      const v = currentPath[i + 1];
      if (u < nodeCoords.length && v < nodeCoords.length) {
        edges.push({
          u, v,
          x1: nodeCoords[u].x,
          y1: nodeCoords[u].y,
          x2: nodeCoords[v].x,
          y2: nodeCoords[v].y
        });
      }
    }
    return edges;
  }, [currentPath, nodeCoords]);

  return (
    <div className="relative w-full h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
      <div className="flex items-center justify-between z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              {algorithmName}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Step {currentEvent?.step || 0} • Event: <span className="text-cyan-300 font-semibold">{eventType || 'INITIALIZING'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {isFinished ? (
            <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold ${
              isOptimal ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              {isOptimal ? '✓ OPTIMAL ROUTE FOUND' : '✓ HEURISTIC ROUTE GENERATED'}
            </div>
          ) : isPruned ? (
            <div className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              ✕ BRANCH PRUNED
            </div>
          ) : (
            <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">
              Evaluating State Space...
            </div>
          )}
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
        <defs>
          <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="finalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
            <stop offset="100%" stopColor="#EAB308" stopOpacity="1" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {allEdges.map((edge, idx) => (
          <line
            key={`bg-edge-${idx}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="#1E293B"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
        ))}

        {activeEdges.map((edge, idx) => {
          const isFinalRoute = isFinished;
          const isEdgePruned = isPruned && idx === activeEdges.length - 1;

          return (
            <g key={`active-edge-group-${idx}`}>
              <line
                key={`active-edge-${idx}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={isFinalRoute ? "url(#finalGrad)" : isEdgePruned ? "#F43F5E" : "url(#activeGrad)"}
                strokeWidth={isFinalRoute ? "4" : isEdgePruned ? "2.5" : "3.5"}
                strokeDasharray={isEdgePruned ? "4 4" : "none"}
                filter={isFinalRoute ? "url(#goldGlow)" : "url(#cyanGlow)"}
                className={!isFinalRoute && !isEdgePruned ? "path-active-pulse" : ""}
              />
              {!isFinalRoute && !isEdgePruned && (
                <circle r="4" fill="#38BDF8" filter="url(#cyanGlow)">
                  <animateMotion
                    path={`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`}
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {nodeCoords.map((nc, idx) => {
          const isDepot = nc.loc.is_depot;
          const isCurrentNode = currentEvent?.current_node === idx;
          const isInPath = currentPath.includes(idx);
          const sequenceNum = currentPath.indexOf(idx);

          let nodeFill = "#0F172A";
          let nodeStroke = "#334155";
          let glowClass = "";

          if (isDepot) {
            nodeFill = "#065F46";
            nodeStroke = "#10B981";
            glowClass = "glow-emerald";
          } else if (isFinished && isInPath) {
            nodeFill = "#78350F";
            nodeStroke = "#F59E0B";
            glowClass = "glow-gold";
          } else if (isCurrentNode) {
            nodeFill = isPruned ? "#881337" : "#0E7490";
            nodeStroke = isPruned ? "#F43F5E" : "#06B6D4";
            glowClass = isPruned ? "glow-rose" : "glow-cyan";
          } else if (isInPath) {
            nodeFill = "#1E293B";
            nodeStroke = "#38BDF8";
          }

          return (
            <g key={`node-${idx}`} className="cursor-pointer transition-all duration-300">
              {isCurrentNode && (
                <circle
                  cx={nc.x}
                  cy={nc.y}
                  r={isDepot ? 22 : 18}
                  fill="none"
                  stroke={isPruned ? "#F43F5E" : "#06B6D4"}
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}

              <circle
                cx={nc.x}
                cy={nc.y}
                r={isDepot ? 18 : 14}
                fill={nodeFill}
                stroke={nodeStroke}
                strokeWidth={isCurrentNode ? "3" : "2"}
                className={glowClass}
              />

              <text
                x={nc.x}
                y={nc.y + 4}
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize={isDepot ? "11" : "10"}
                fontWeight="bold"
                className="select-none font-mono"
              >
                {isDepot ? '🏭' : sequenceNum >= 0 ? sequenceNum : idx}
              </text>

              <text
                x={nc.x}
                y={nc.y + 30}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10"
                fontWeight="600"
                className="select-none font-sans"
              >
                {nc.loc.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Current Cost</span>
          <span className="text-cyan-400 font-bold text-sm">{currentCost.toFixed(2)} km</span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Best Known Cost</span>
          <span className="text-amber-400 font-bold text-sm">{bestCost > 0 ? `${bestCost.toFixed(2)} km` : 'N/A'}</span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Lower Bound / DP State</span>
          <span className="text-purple-400 font-bold text-sm">
            {lowerBound !== undefined && lowerBound !== null ? `${lowerBound.toFixed(2)} km` : currentEvent?.mask ? `Mask: 0b${currentEvent.mask.toString(2)}` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Explored / Pruned</span>
          <span className="text-slate-200 font-bold text-sm">
            {currentEvent?.explored_count || 0} <span className="text-rose-400">({currentEvent?.pruned_count || 0} pruned)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
