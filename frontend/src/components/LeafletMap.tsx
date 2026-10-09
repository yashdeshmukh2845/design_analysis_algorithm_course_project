import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';

interface LeafletMapProps {
  locations: Location[];
  route?: number[];
  vehiclePosition?: [number, number];
  vehicleHeading?: number;
  currentStopIndex?: number;
  completedStops?: number[];
}

const depotIcon = L.divIcon({
  className: 'custom-depot-icon',
  html: `<div style="background:#059669; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid #10B981; box-shadow:0 0 16px rgba(16,185,129,0.9);">🏭</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

const createStopIcon = (num: number, isCurrent: boolean, isCompleted: boolean) => L.divIcon({
  className: 'custom-stop-icon',
  html: `<div style="
    background:${isCurrent ? '#06B6D4' : isCompleted ? '#10B981' : '#1E293B'};
    color:white;
    width:${isCurrent ? '34px' : '28px'};
    height:${isCurrent ? '34px' : '28px'};
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    font-size:${isCurrent ? '14px' : '12px'};
    border:2px solid ${isCurrent ? '#38BDF8' : isCompleted ? '#34D399' : '#64748B'};
    box-shadow:${isCurrent ? '0 0 15px #06B6D4' : isCompleted ? '0 0 8px rgba(16,185,129,0.6)' : 'none'};
    transition: all 0.3s ease;
  ">
    ${isCompleted && !isCurrent ? '✓' : num}
  </div>`,
  iconSize: [isCurrent ? 34 : 28, isCurrent ? 34 : 28],
  iconAnchor: [isCurrent ? 17 : 14, isCurrent ? 17 : 14]
});

const createTruckIcon = (heading: number = 0) => L.divIcon({
  className: 'custom-truck-icon',
  html: `<div style="
    background: #0B0F19;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid #F59E0B;
    box-shadow: 0 0 20px rgba(245,158,11,0.95);
    transform: rotate(${heading}deg);
    transition: transform 0.15s ease-out;
  ">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

function MapRecenter({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  locations,
  route = [],
  vehiclePosition,
  vehicleHeading = 0,
  currentStopIndex = 0,
  completedStops = []
}) => {
  const centerLat = locations.length > 0 ? locations[0].latitude : 18.5204;
  const centerLng = locations.length > 0 ? locations[0].longitude : 73.8567;

  const allPolylineCoords: [number, number][] = route.map(idx => {
    const loc = locations[idx];
    return loc ? [loc.latitude, loc.longitude] : [centerLat, centerLng];
  });

  // Split route into traversed (completed) and remaining paths
  const traversedCoords: [number, number][] = [];
  if (currentStopIndex > 0) {
    for (let i = 0; i <= currentStopIndex && i < allPolylineCoords.length; i++) {
      traversedCoords.push(allPolylineCoords[i]);
    }
    if (vehiclePosition) {
      traversedCoords.push(vehiclePosition);
    }
  }

  const remainingCoords: [number, number][] = [];
  if (vehiclePosition) {
    remainingCoords.push(vehiclePosition);
  }
  for (let i = currentStopIndex; i < allPolylineCoords.length; i++) {
    remainingCoords.push(allPolylineCoords[i]);
  }

  const bounds: L.LatLngBoundsExpression | null = locations.length > 0
    ? locations.map(l => [l.latitude, l.longitude])
    : null;

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds && <MapRecenter bounds={bounds} />}

        {/* Traversed Path (Solid Glowing Cyan) */}
        {traversedCoords.length > 1 && (
          <Polyline
            positions={traversedCoords}
            pathOptions={{
              color: '#06B6D4',
              weight: 5,
              opacity: 0.95
            }}
          />
        )}

        {/* Remaining Path (Dashed Amber) */}
        {remainingCoords.length > 1 && (
          <Polyline
            positions={remainingCoords}
            pathOptions={{
              color: '#F59E0B',
              weight: 3,
              opacity: 0.7,
              dashArray: '8, 6'
            }}
          />
        )}

        {locations.map((loc, idx) => {
          const isDepot = loc.is_depot;
          const sequenceNum = route.indexOf(idx);
          const isCurrent = currentStopIndex === sequenceNum;
          const isCompleted = completedStops.includes(idx);

          return (
            <Marker
              key={idx}
              position={[loc.latitude, loc.longitude]}
              icon={isDepot ? depotIcon : createStopIcon(sequenceNum >= 0 ? sequenceNum : idx, isCurrent, isCompleted)}
            >
              <Popup>
                <div className="p-2 text-slate-900 font-sans">
                  <h4 className="font-bold text-sm">{loc.name} {isDepot ? '🏭' : ''}</h4>
                  <p className="text-xs text-slate-600">Weight: {loc.package_weight_kg} kg | Priority: {loc.priority}</p>
                  <p className="text-xs text-slate-600">Time Window: {Math.floor(loc.earliest_time_min / 60)}:00 - {Math.floor(loc.latest_time_min / 60)}:00</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {vehiclePosition && (
          <Marker position={vehiclePosition} icon={createTruckIcon(vehicleHeading)} />
        )}
      </MapContainer>
    </div>
  );
};

