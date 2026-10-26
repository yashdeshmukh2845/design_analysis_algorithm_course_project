import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type {
  DarkStore,
  CustomerOrder,
  RiderDispatchPlan,
} from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface QuickCommerceMapProps {
  darkStores: DarkStore[];
  orders: CustomerOrder[];
  dispatches: RiderDispatchPlan[];
  onMapClick?: (lat: number, lng: number) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simulationProgress: number; // 0.0 to 1.0
  setSimulationProgress: (val: number | ((prev: number) => number)) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
}

// Custom Leaflet Icons

const createHubIcon = (store: DarkStore) => L.divIcon({
  className: 'custom-hub-icon',
  html: `<div style="
    background: linear-gradient(135deg, #0F172A, #1E293B);
    color: #F8FAFC;
    padding: 4px 8px;
    border-radius: 12px;
    border: 2px solid #F59E0B;
    box-shadow: 0 0 18px rgba(245, 158, 11, 0.6);
    font-size: 11px;
    font-weight: 800;
    font-family: sans-serif;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transform: translate(-50%, -50%);
  ">
    <span style="background: #F59E0B; color: #000; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">🏬</span>
    <span>${store.code}</span>
  </div>`,
  iconSize: [120, 32],
  iconAnchor: [60, 16],
});

const createCustomerIcon = (order: CustomerOrder, isDelivered: boolean) => {
  const isVip = order.priority === 'VIP_10_MIN';
  const bgColor = isDelivered ? '#10B981' : isVip ? '#EF4444' : '#3B82F6';
  const badgeText = isDelivered ? '✓ DELIVERED' : isVip ? '⚡ 10m SLA' : '📦 20m';

  return L.divIcon({
    className: 'custom-customer-icon',
    html: `<div style="
      background: #0F172A;
      color: #FFFFFF;
      padding: 3px 6px;
      border-radius: 10px;
      border: 1.5px solid ${bgColor};
      box-shadow: 0 0 12px ${bgColor}88;
      font-size: 10px;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      white-space: nowrap;
      transform: translate(-50%, -50%);
    ">
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="background: ${bgColor}; color: #FFFFFF; padding: 1px 4px; border-radius: 4px; font-weight: 700; font-size: 9px;">${badgeText}</span>
      </div>
      <span style="font-weight: 600; font-size: 9px; color: #CBD5E1; max-width: 90px; overflow: hidden; text-overflow: ellipsis;">${order.customer_name}</span>
    </div>`,
    iconSize: [100, 32],
    iconAnchor: [50, 16],
  });
};

const createRiderScooterIcon = (rider: RiderDispatchPlan, headingDeg: number = 0) => L.divIcon({
  className: 'custom-scooter-icon',
  html: `<div style="
    background: ${rider.color};
    color: #000000;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 0 20px ${rider.color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transform: translate(-50%, -50%) rotate(${headingDeg}deg);
    transition: transform 0.1s linear;
  ">
    🛵
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapAutoBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size immediately and after layout settles
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export const QuickCommerceMap: React.FC<QuickCommerceMapProps> = ({
  darkStores,
  orders,
  dispatches,
  onMapClick,
  isSimulating,
  setIsSimulating,
  simulationProgress,
  setSimulationProgress,
  speedMultiplier,
  setSpeedMultiplier,
}) => {
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Initial map center at Pune (Shivajinagar)
  const defaultCenter: [number, number] = [18.5308, 73.8475];

  // Compute all points to set map bounds
  const mapBounds: L.LatLngBoundsExpression | null = useMemo(() => {
    const pts: [number, number][] = [];
    darkStores.forEach(ds => pts.push([ds.latitude, ds.longitude]));
    orders.forEach(o => pts.push([o.latitude, o.longitude]));
    if (pts.length === 0) return null;
    return pts;
  }, [darkStores, orders]);

  // Animation Loop based on simulationProgress (0.0 to 1.0)
  useEffect(() => {
    if (!isSimulating || dispatches.length === 0) {
      lastTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = (now - lastTimeRef.current) / 1000; // seconds
        // Full simulation cycle takes 16 seconds at 1x
        const progressIncrement = (dt / 16) * speedMultiplier;
        setSimulationProgress(prev => {
          const next = prev + progressIncrement;
          if (next >= 1.0) {
            setIsSimulating(false);
            return 1.0;
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating, dispatches, speedMultiplier, setIsSimulating, setSimulationProgress]);

  // Compute live interpolated positions and completed orders for each dispatched rider
  const riderPositions = useMemo(() => {
    const positions: {
      rider: RiderDispatchPlan;
      pos: [number, number];
      heading: number;
      completedOrderIds: Set<string>;
    }[] = [];

    dispatches.forEach(d => {
      const waypoints = d.route_latlngs;
      if (!waypoints || waypoints.length < 2) return;

      const totalHops = waypoints.length - 1;
      const exactHopIndex = simulationProgress * totalHops;
      const currentHop = Math.min(Math.floor(exactHopIndex), totalHops - 1);
      const frac = exactHopIndex - currentHop;

      const p1 = waypoints[currentHop];
      const p2 = waypoints[currentHop + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * frac;
      const lng = p1[1] + (p2[1] - p1[1]) * frac;

      // Calculate heading angle
      const dLng = p2[1] - p1[1];
      const dLat = p2[0] - p1[0];
      const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      // Identify which customer orders have been visited so far
      const completedSet = new Set<string>();
      d.orders.forEach((ord, idx) => {
        // Drop stops correspond to waypoint index (idx + 1)
        if (currentHop >= idx + 1) {
          completedSet.add(ord.order_id);
        }
      });

      positions.push({
        rider: d,
        pos: [lat, lng],
        heading: angle,
        completedOrderIds: completedSet,
      });
    });

    return positions;
  }, [dispatches, simulationProgress]);

  // Set of all completed orders across all riders
  const allCompletedOrderIds = useMemo(() => {
    const set = new Set<string>();
    riderPositions.forEach(rp => {
      rp.completedOrderIds.forEach(id => set.add(id));
    });
    return set;
  }, [riderPositions]);

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090D16]"
      style={{ width: '100%', height: '620px', minHeight: '620px', position: 'relative' }}
    >
      {/* Simulation Playback HUD Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3">
        <button
          onClick={() => {
            if (simulationProgress >= 1.0) setSimulationProgress(0);
            setIsSimulating(!isSimulating);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isSimulating
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isSimulating ? 'Pause Ride' : simulationProgress >= 1.0 ? 'Replay Ride' : 'Simulate Ride'}
        </button>

        <button
          onClick={() => {
            setIsSimulating(false);
            setSimulationProgress(0);
          }}
          title="Reset Simulation"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed multiplier selector */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/50">
          {[1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                speedMultiplier === s
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-32 hidden sm:flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Trip</span>
            <span>{Math.round(simulationProgress * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-75"
              style={{ width: `${simulationProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Hint / Legend Badge */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-lg text-[11px] text-slate-300 flex items-center gap-4 hidden md:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-white"></span>
          <span>Dark Store (Hub)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
          <span>⚡ VIP 10-Min SLA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
          <span>Standard 20-Min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white"></span>
          <span>Delivered ✓</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%', minHeight: '620px' }}
        zoomControl={true}
      >
        <MapInvalidator />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoBounds bounds={mapBounds} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Route Polylines per Rider */}
        {dispatches.map((plan, idx) => {
          if (!plan.route_latlngs || plan.route_latlngs.length < 2) return null;
          return (
            <Polyline
              key={idx}
              positions={plan.route_latlngs}
              pathOptions={{
                color: plan.color,
                weight: 4,
                opacity: 0.85,
                dashArray: '4, 8',
              }}
            />
          );
        })}

        {/* Dark Stores (Hubs) */}
        {darkStores.map(ds => (
          <Marker
            key={ds.id}
            position={[ds.latitude, ds.longitude]}
            icon={createHubIcon(ds)}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏬</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-950">{ds.name}</h4>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      {ds.code}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 mt-2 border-t pt-2">
                  <p>📦 Inventory: <b>{ds.inventory_items} items in stock</b></p>
                  <p>⏱️ Avg Packing Time: <b>{ds.avg_packing_time_min} mins</b></p>
                  <p>🎯 Delivery Radius: <b>{ds.service_radius_km} km</b></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Customer Orders */}
        {orders.map(order => {
          const isDelivered = allCompletedOrderIds.has(order.id);
          return (
            <Marker
              key={order.id}
              position={[order.latitude, order.longitude]}
              icon={createCustomerIcon(order, isDelivered)}
            >
              <Popup>
                <div className="p-2 text-slate-900 font-sans min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-950">{order.customer_name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.priority === 'VIP_10_MIN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.priority === 'VIP_10_MIN' ? '⚡ 10-Min SLA' : '20-Min SLA'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{order.address}</p>

                  <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700 space-y-1 mb-2">
                    <p className="font-semibold text-slate-900">Items Ordered:</p>
                    <ul className="list-disc list-inside text-[10px] text-slate-600">
                      {order.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-600 border-t pt-2">
                    <span>Weight: <b>{order.weight_kg} kg</b></span>
                    <span>Value: <b>₹{order.order_value_inr}</b></span>
                  </div>

                  {order.estimated_arrival_min && (
                    <div className={`mt-2 p-1.5 rounded text-[11px] font-semibold text-center ${
                      order.is_on_time ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.is_on_time ? '✓ On-Time Arrival' : '⚠️ Late Delivery Risk'}: {order.estimated_arrival_min} mins
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Animated Rider Scooters 🛵 */}
        {riderPositions.map((rp, idx) => (
          <Marker
            key={idx}
            position={rp.pos}
            icon={createRiderScooterIcon(rp.rider, rp.heading)}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {rp.rider.avatar}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs">{rp.rider.rider_name}</h4>
                    <span className="text-[10px] text-amber-600 font-bold">
                      ⭐ {rp.rider.rating} Rating
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 mt-2 border-t pt-2">
                  <p>🛵 Vehicle: <b>{rp.rider.vehicle_model}</b></p>
                  <p>🎒 Bag Load: <b>{rp.rider.total_load_kg} / {rp.rider.bag_max_weight_kg} kg</b> ({rp.rider.bag_utilization_percent}%)</p>
                  <p>📦 Orders: <b>{rp.rider.orders_count} stops</b></p>
                  <p>🛣️ Trip Distance: <b>{rp.rider.route_distance_km} km</b></p>
                  <p>⏱️ Est. Trip Time: <b>{rp.rider.estimated_trip_min} mins</b></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
