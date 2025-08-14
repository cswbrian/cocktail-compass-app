import React, { useMemo, useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { PlaceMarker } from '@/types/map';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MAP_CONFIG } from '@/config/map-config';
import { useMarkerClick } from './MapContainer';

interface PlaceMarkersProps {
  places: PlaceMarker[];
  onPlaceClick?: (place: PlaceMarker) => void;
  selectedPlaceId?: string;
  enableClustering?: boolean;
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

export function PlaceMarkers({ places, onPlaceClick, selectedPlaceId, enableClustering = true }: PlaceMarkersProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const handleMarkerClick = useMarkerClick();
  

  // Initialize cluster group
  useEffect(() => {
    if (enableClustering && !clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: MAP_CONFIG.clustering.maxClusterRadius,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: MAP_CONFIG.clustering.showCoverageOnHover,
        animateAddingMarkers: MAP_CONFIG.clustering.animateAddingMarkers,
        disableClusteringAtZoom: MAP_CONFIG.clustering.disableClusteringAtZoom,
        zoomToBoundsOnClick: true,
        animate: true,
        removeOutsideVisibleBounds: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let c = ' marker-cluster-';
          if (count < 10) {
            c += 'small';
          } else if (count < 100) {
            c += 'medium';
          } else {
            c += 'large';
          }
          c += '';

          return new L.DivIcon({
            html: `<div><span>${count}</span></div>`,
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40)
          });
        }
      });
      map.addLayer(clusterGroupRef.current);
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, enableClustering]);

  // Update markers when places change
  useEffect(() => {
    
    
    if (!clusterGroupRef.current && !enableClustering) {
      return;
    }
    
    const currentMarkers = markersRef.current;
    const newMarkerIds = new Set(places.map(p => p.id));
    
    // Add smooth fade-out transition for markers being removed
    const markersToRemove: Array<[string, L.Marker]> = [];
    for (const [markerId, marker] of currentMarkers) {
      if (!newMarkerIds.has(markerId)) {
        markersToRemove.push([markerId, marker]);
        
        // Add fade-out class
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.classList.add('marker-fade-out');
        }
      }
    }
    
    // Remove markers after animation delay
    if (markersToRemove.length > 0) {
      setTimeout(() => {
        markersToRemove.forEach(([markerId, marker]) => {
          if (enableClustering && clusterGroupRef.current) {
            clusterGroupRef.current.removeLayer(marker);
          } else {
            map.removeLayer(marker);
          }
          currentMarkers.delete(markerId);
        });
      }, 300); // Match the CSS animation duration
    }

    // Add or update markers
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const place of places) {
      const isSelected = selectedPlaceId === place.id;
      const icon = createMarkerIcon(isSelected);
      
      let marker = currentMarkers.get(place.id);
      
      if (marker) {
        // Update existing marker
        marker.setIcon(icon);
        marker.setLatLng([place.lat, place.lng]);
        updatedCount++;
      } else {
        // Create new marker
        marker = L.marker([place.lat, place.lng], { icon });
        addedCount++;
        
        // Add click handler with map centering
        marker.on('click', () => {
          // Use the MapContainer's marker click handler for smooth zoom and center
          handleMarkerClick(place);
          // Also call the original onPlaceClick for backward compatibility
          onPlaceClick?.(place);
        });
        
        currentMarkers.set(place.id, marker);
        
        // Add to cluster group or map first
        if (enableClustering && clusterGroupRef.current) {
          clusterGroupRef.current.addLayer(marker);
        } else {
          map.addLayer(marker);
        }
        
        // Add smooth fade-in transition for new markers
        setTimeout(() => {
          const markerElement = marker?.getElement();
          if (markerElement) {
            markerElement.classList.add('marker-fade-in');
          }
        }, 50); // Small delay to ensure DOM element exists
        
        // Skip the general add-to-map logic below for new markers
        continue;
      }
      
      // Add to cluster group or map (for existing markers)
      if (enableClustering && clusterGroupRef.current) {
        if (!clusterGroupRef.current.hasLayer(marker)) {
          clusterGroupRef.current.addLayer(marker);
        }
      } else {
        if (!map.hasLayer(marker)) {
          map.addLayer(marker);
        }
      }
    }
    
    
  }, [places, selectedPlaceId, onPlaceClick, map, enableClustering]);

  // Global function removed since popups are no longer used

  // For non-clustering mode, render React components
  if (!enableClustering) {
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

  // For clustering mode, markers are handled in useEffect
  return null;
}
