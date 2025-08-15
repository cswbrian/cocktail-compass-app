import React, { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { PlaceMarker } from '@/types/map';
import L from 'leaflet';
import { MAP_CONFIG } from '@/config/map-config';
import { offsetOverlappingCoordinates } from '@/lib/utils';

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
  const markersRef = useRef<L.Marker[]>([]);

  // Process places to offset overlapping coordinates
  const processedPlaces = useMemo(() => {
    if (places.length === 0) return [];
    
    // Only apply offset if enabled and we have overlapping coordinates
    if (MAP_CONFIG.markers.enableCoordinateOffset) {
      const hasOverlaps = places.some((place, i) => 
        places.slice(i + 1).some(other => 
          Math.abs(place.lat - other.lat) < MAP_CONFIG.markers.minMarkerDistance && 
          Math.abs(place.lng - other.lng) < MAP_CONFIG.markers.minMarkerDistance
        )
      );

      if (hasOverlaps) {
        console.log('🔧 Detected overlapping coordinates, applying automatic offset');
        return offsetOverlappingCoordinates(places, MAP_CONFIG.markers.minMarkerDistance);
      }
    }
    
    return places;
  }, [places]);

  // Function to clear all markers
  const clearAllMarkers = () => {
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];
  };

  // Function to add markers
  const addMarkers = () => {
    processedPlaces.forEach((place) => {
      const isSelected = selectedPlaceId === place.id;
      const icon = createMarkerIcon(isSelected);
      
      const marker = L.marker([place.lat, place.lng], { icon });
      
      marker.on('click', () => {
        const currentZoom = map.getZoom();
        const targetZoom = MAP_CONFIG.interactions.markerFocusZoom;
        
        // Only zoom in if current zoom is lower than target zoom
        const finalZoom = currentZoom < targetZoom ? targetZoom : currentZoom;
        
        map.setView([place.lat, place.lng], finalZoom, {
          animate: true,
          duration: MAP_CONFIG.interactions.centerDuration
        });
        onPlaceClick?.(place);
      });
      
      map.addLayer(marker);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    // Clear existing markers
    clearAllMarkers();
    
    // Add markers
    addMarkers();

    // Cleanup function
    return () => {
      clearAllMarkers();
    };
  }, [processedPlaces, selectedPlaceId, map, onPlaceClick]);

  // Don't render individual markers - they're handled by the markers array
  return null;
}
