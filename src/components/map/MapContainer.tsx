import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { Map, LatLng, LatLngBounds } from 'leaflet';
import { PlaceMarker, MapViewport, MAP_REGIONS } from '@/types/map';
import { mapService } from '@/services/map-service';
import { useGeolocation } from '@/hooks/useGeolocation';
import useSWR from 'swr';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';
import { MAP_CONFIG } from '@/config/map-config';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapContainerProps {
  onPlaceSelect?: (place: PlaceMarker) => void;
  onViewportChange?: (viewport: MapViewport) => void;
  initialRegion?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
  height?: string;
  children?: React.ReactNode;
  places?: PlaceMarker[];
  isLoading?: boolean;
  error?: Error | null;
}

// Debounce hook for viewport changes
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Component to handle map events
function MapEventHandler({ 
  onViewportChange, 
  onBoundsChange 
}: { 
  onViewportChange?: (viewport: MapViewport) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
}) {
  const map = useMap();
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  
  // Debounce viewport changes to avoid too many API calls
  const debouncedViewport = useDebounce(viewport, MAP_CONFIG.viewportDebounceDelay);

  const handleMapChange = useCallback(() => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    
    const newViewport: MapViewport = {
      center,
      zoom,
      bounds,
    };
    
    setViewport(newViewport);
  }, [map]);

  useMapEvents({
    moveend: handleMapChange,
    zoomend: handleMapChange,
  });

  // Call callbacks when debounced viewport changes
  useEffect(() => {
    if (debouncedViewport) {
      onViewportChange?.(debouncedViewport);
      onBoundsChange?.(debouncedViewport.bounds);
    }
  }, [debouncedViewport, onViewportChange, onBoundsChange]);

  return null;
}

// Remove this line as we'll use the fetchers from swr-config

// User location marker component
function UserLocationMarker({ position }: { position: LatLng }) {
  const map = useMap();

  useEffect(() => {
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 16px; 
          height: 16px; 
          background-color: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker(position, { icon: userIcon }).addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position]);

  return null;
}

export const MapContainer = React.forwardRef<Map, MapContainerProps>(({ 
  onPlaceSelect, 
  onViewportChange,
  initialRegion = 'hongkong',
  initialCenter,
  initialZoom,
  className = '',
  height = '100vh',
  children,
  places = [],
  isLoading = false,
  error = null
}, ref) => {
  const mapRef = useRef<Map | null>(null);
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  
  // Expose map instance to parent via ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(mapRef.current);
      } else {
        ref.current = mapRef.current;
      }
    }
  }, [ref, mapRef.current]);
  
  // Get user location with immediate request
  const { position: userPosition, getCurrentPosition, requestPermission } = useGeolocation({
    immediate: true, // Automatically request location on mount
  });

  // Get initial region settings
  const initialMapRegion = useMemo(() => {
    return MAP_REGIONS[initialRegion] || MAP_REGIONS.hongkong;
  }, [initialRegion]);

  // Use URL state if available, otherwise fall back to region defaults
  const mapCenter = useMemo(() => {
    if (initialCenter) {
      return [initialCenter.lat, initialCenter.lng] as [number, number];
    }
    return initialMapRegion.center;
  }, [initialCenter, initialMapRegion.center]);

  const mapZoom = useMemo(() => {
    return initialZoom || initialMapRegion.defaultZoom;
  }, [initialZoom, initialMapRegion.defaultZoom]);

  // Places data will be passed from parent component
  // Remove local place fetching to avoid duplication

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setCurrentBounds(bounds);
    
    // Notify parent about viewport changes
    if (onViewportChange) {
      const center = bounds.getCenter();
      const zoom = mapRef.current?.getZoom() || initialMapRegion.defaultZoom;
      const viewport: MapViewport = {
        center,
        zoom,
        bounds,
      };
      onViewportChange(viewport);
    }
  }, [onViewportChange, initialMapRegion.defaultZoom]);

  const handleLocationRequest = useCallback(async () => {
    try {
      await requestPermission();
      await getCurrentPosition();
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  }, [requestPermission, getCurrentPosition]);

  // Center map on user location when detected
  useEffect(() => {
    if (userPosition && mapRef.current) {
      const userLatLng = new LatLng(userPosition.latitude, userPosition.longitude);
      // Center map on user location with zoom level 16
      mapRef.current.setView(userLatLng, 16);
    }
  }, [userPosition]);

  if (error) {
    console.error('Error loading map places:', error);
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <LeafletMapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
          subdomains="abcd"
        />
        
        <MapEventHandler 
          onViewportChange={onViewportChange}
          onBoundsChange={handleBoundsChange}
        />

        {/* User location marker */}
        {userPosition && (
          <UserLocationMarker 
            position={new LatLng(userPosition.latitude, userPosition.longitude)} 
          />
        )}

        {/* Render children (Place markers) */}
        {children}
      </LeafletMapContainer>

      {/* Zoom controls - positioned below transparent header on left */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => mapRef.current?.zoomIn()}
          title="Zoom in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => mapRef.current?.zoomOut()}
          title="Zoom out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </Button>
      </div>

      {/* Floating controls - positioned on right side */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-2">
        {/* Location button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleLocationRequest}
          className={userPosition ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" : ""}
          title={userPosition ? "Location found - showing nearby places" : "Find my location"}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </Button>
      </div>

      {/* Loading indicator - positioned below zoom controls on left */}
      {isLoading && (
        <div className="absolute top-32 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading places...</span>
          </div>
        </div>
      )}

      {/* Places count indicator - top center */}
      {places.length > 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2">
          <span className="text-sm text-gray-600">
            {places.length} place{places.length !== 1 ? 's' : ''} {userPosition ? 'within 1km' : 'found'}
          </span>
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';
