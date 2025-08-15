import React from 'react';
import { Marker, useMap } from 'react-leaflet';
import { PlaceMarker } from '@/types/map';
import L from 'leaflet';
import { MAP_CONFIG } from '@/config/map-config';

interface PlaceMarkersProps {
  places: PlaceMarker[];
  onPlaceClick?: (place: PlaceMarker) => void;
  selectedPlaceId?: string;
}

// Create emoji marker icons with white background circle
const createMarkerIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 32 : 24;
  const fontSize = isSelected ? 24 : 18;
  const shadow = isSelected ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)';
  
  return L.divIcon({
    className: 'emoji-place-marker',
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        filter: drop-shadow(${shadow});
        background: white;
        border-radius: 50%;
        border: 2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'};
      ">
        <span style="
          font-size: ${fontSize}px;
          line-height: 1;
        ">🍹</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export function PlaceMarkers({ places, onPlaceClick, selectedPlaceId }: PlaceMarkersProps) {
  const map = useMap();

  return (
    <>
      {places.map((place) => {
        const isSelected = selectedPlaceId === place.id;
        const icon = createMarkerIcon(isSelected);
        
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                // Center map on clicked marker with smooth transition
                map.setView([place.lat, place.lng], MAP_CONFIG.interactions.markerFocusZoom, {
                  animate: true,
                  duration: MAP_CONFIG.interactions.centerDuration
                });
                onPlaceClick?.(place);
              },
            }}
          >
            {/* Popup removed - using bottom sheet instead */}
          </Marker>
        );
      })}
    </>
  );
}
