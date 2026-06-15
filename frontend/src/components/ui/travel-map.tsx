"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when position changes
function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface TravelMapProps {
  position: [number, number] | null;
  route: [number, number][];
}

export default function TravelMap({ position, route }: TravelMapProps) {
  const defaultCenter: [number, number] = [37.7749, -122.4194]; // Default to SF
  
  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden relative">
      {/* Overlay to give it a dark mode vibe since OpenStreetMap is light */}
      <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply pointer-events-none z-[400]" />
      
      <MapContainer 
        center={position || defaultCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {position && (
          <>
            <Marker position={position} />
            <RecenterAutomatically lat={position[0]} lng={position[1]} />
          </>
        )}
        
        {route.length > 1 && (
          <Polyline 
            positions={route} 
            color="#3b82f6" 
            weight={5} 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}
