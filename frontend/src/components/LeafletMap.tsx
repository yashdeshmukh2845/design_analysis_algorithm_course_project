import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';

interface LeafletMapProps {
  locations: Location[];
  route?: number[];
  vehiclePosition?: [number, number];
  currentStopIndex?: number;
}

const depotIcon = L.divIcon({
  className: 'custom-depot-icon',
  html: `<div style="background:#059669; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid #10B981; box-shadow:0 0 12px rgba(16,185,129,0.8);">🏭</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const createStopIcon = (num: number, isCurrent: boolean) => L.divIcon({
  className: 'custom-stop-icon',
  html: `<div style="background:${isCurrent ? '#06B6D4' : '#1E293B'}; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid ${isCurrent ? '#38BDF8' : '#64748B'}; box-shadow:${isCurrent ? '0 0 10px #06B6D4' : 'none'};">${num}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const truckIcon = L.divIcon({
  className: 'custom-truck-icon',
  html: `<div style="background:#F59E0B; color:black; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; border:3px solid #FCD34D; box-shadow:0 0 15px rgba(245,158,11,0.9);">🚚</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
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
  currentStopIndex = 0
}) => {
  const centerLat = locations.length > 0 ? locations[0].latitude : 18.5204;
  const centerLng = locations.length > 0 ? locations[0].longitude : 73.8567;

  const polylineCoords: [number, number][] = route.map(idx => {
    const loc = locations[idx];
    return loc ? [loc.latitude, loc.longitude] : [centerLat, centerLng];
  });

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

        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#F59E0B',
              weight: 4,
              opacity: 0.9,
              dashArray: '8, 6'
            }}
          />
        )}

        {locations.map((loc, idx) => {
          const isDepot = loc.is_depot;
          const sequenceNum = route.indexOf(idx);
          const isCurrent = currentStopIndex === sequenceNum;

          return (
            <Marker
              key={idx}
              position={[loc.latitude, loc.longitude]}
              icon={isDepot ? depotIcon : createStopIcon(sequenceNum >= 0 ? sequenceNum : idx, isCurrent)}
            >
              <Popup>
                <div className="p-2 text-slate-900 font-sans">
                  <h4 className="font-bold text-sm">{loc.name}</h4>
                  <p className="text-xs text-slate-600">Weight: {loc.package_weight_kg} kg | Priority: {loc.priority}</p>
                  <p className="text-xs text-slate-600">Time Window: {Math.floor(loc.earliest_time_min/60)}:00 - {Math.floor(loc.latest_time_min/60)}:00</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {vehiclePosition && (
          <Marker position={vehiclePosition} icon={truckIcon} />
        )}
      </MapContainer>
    </div>
  );
};
