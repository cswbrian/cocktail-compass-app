import React, { useCallback, useMemo, useRef, useState, useEffect, createContext, useContext } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { Map, LatLng, LatLngBounds } from 'leaflet';
import { PlaceMarker, MapViewport } from '@/types/map';
import { geolocationService } from '@/services/geolocation-service';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MAP_CONFIG, SMART_DEFAULT_VIEWPORT, CITY_QUICK_ZOOM, City, CityArea } from '@/config/map-config';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CitySelector } from './CitySelector';
import { sendGAEvent } from '@/lib/ga';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { detectBrowser, getBrowserTutorial, detectPWAStatus } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Context for marker click handler
const MarkerClickContext = createContext<((place: PlaceMarker) => void) | null>(null);

// Hook to use marker click handler
export const useMarkerClick = () => {
  const context = useContext(MarkerClickContext);
  if (!context) {
    throw new Error('useMarkerClick must be used within a MapContainer');
  }
  return context;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapContainerProps {
  onPlaceSelect?: (place: PlaceMarker) => void;
  onViewportChange?: (viewport: MapViewport) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  shouldCenterOnUserLocation?: boolean;
  className?: string;
  height?: string;
  children?: React.ReactNode;
  places?: PlaceMarker[];
  isLoading?: boolean;
  error?: Error | null;
  onMarkerClick?: (place: PlaceMarker) => void;
  openNowEnabled?: boolean;
  onToggleOpenNow?: () => void;
  asias50Enabled?: boolean;
  onToggleAsias50?: () => void;
  onMapInteraction?: () => void; // Callback to close bottom sheet
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
  onBoundsChange,
  onMapInteraction
}: { 
  onViewportChange?: (viewport: MapViewport) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
  onMapInteraction?: () => void;
}) {
  const map = useMap();
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isProgrammaticMovement, setIsProgrammaticMovement] = useState(false);
  
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
    
    // Reset programmatic movement flag after movement completes
    if (isProgrammaticMovement) {
      setTimeout(() => {
        setIsProgrammaticMovement(false);
        // Also reset user interaction state when programmatic movement completes
        setIsUserInteracting(false);
      }, 100);
    }
  }, [map, isProgrammaticMovement]);

  // Handle zoom changes immediately for better UX
  const handleZoomChange = useCallback(() => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    
    const newViewport: MapViewport = {
      center,
      zoom,
      bounds,
    };
    
    // For zoom changes, call immediately without debouncing
    onViewportChange?.(newViewport);
    onBoundsChange?.(bounds);
    
    // Also update the debounced viewport for move events
    setViewport(newViewport);
    
    // Reset interaction state
    setIsUserInteracting(false);
  }, [map, onViewportChange, onBoundsChange]);

  // Handle immediate map interactions (drag start, zoom start)
  const handleMapInteraction = useCallback(() => {
    // Only trigger onMapInteraction if it's a user interaction, not programmatic
    if (!isProgrammaticMovement) {
      setIsUserInteracting(true);
      onMapInteraction?.();
    }
  }, [onMapInteraction, isProgrammaticMovement]);

  // Handle when user interaction ends
  const handleMapInteractionEnd = useCallback(() => {
    // Only reset if it was a user interaction, not programmatic
    if (!isProgrammaticMovement) {
      setIsUserInteracting(false);
    }
  }, [isProgrammaticMovement]);

  // Override the map's setView method to track programmatic movements
  useEffect(() => {
    const originalSetView = map.setView.bind(map);
    
    map.setView = function(center: any, zoom?: any, options?: any) {
      // Check if this is a programmatic movement (has animate: true)
      if (options && options.animate) {
        // Set flag immediately and synchronously
        setIsProgrammaticMovement(true);
        setIsUserInteracting(false);
      }
      return originalSetView(center, zoom, options);
    };
    
    // Also override flyTo and panTo methods
    const originalFlyTo = map.flyTo.bind(map);
    map.flyTo = function(bounds: any, options?: any) {
      // Set flag immediately and synchronously
      setIsProgrammaticMovement(true);
      setIsUserInteracting(false);
      return originalFlyTo(bounds, options);
    };
    
    const originalPanTo = map.panTo.bind(map);
    map.panTo = function(center: any, options?: any) {
      // Set flag immediately and synchronously
      setIsProgrammaticMovement(true);
      setIsUserInteracting(false);
      return originalPanTo(center, options);
    };
    
    return () => {
      // Restore original methods
      map.setView = originalSetView;
      map.flyTo = originalFlyTo;
      map.panTo = originalPanTo;
    };
  }, [map]);

  useMapEvents({
    moveend: handleMapChange,
    zoomend: handleZoomChange,
    movestart: handleMapInteraction, // Close bottom sheet when dragging starts
    zoomstart: handleMapInteraction, // Close bottom sheet when zooming starts
    dragend: handleMapInteractionEnd, // Reset interaction state
    // Removed click event - it was interfering with marker clicks
  });

  // Call callbacks when debounced viewport changes (for move events only)
  useEffect(() => {
    if (debouncedViewport) {
      // Only call onViewportChange for move events, not zoom events
      // Zoom events are handled immediately above
      onViewportChange?.(debouncedViewport);
      onBoundsChange?.(debouncedViewport.bounds);
    }
  }, [debouncedViewport, onViewportChange, onBoundsChange]);

  // Cleanup effect to reset states when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      setIsUserInteracting(false);
      setIsProgrammaticMovement(false);
    };
  }, []);

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
  initialCenter,
  initialZoom,
  shouldCenterOnUserLocation = true,
  className = '',
  height = 'calc(100vh - 80px)', // Account for bottom nav height
  children,
  places = [],
  isLoading = false,
  error = null,
  onMarkerClick,
  openNowEnabled = false,
  onToggleOpenNow,
  asias50Enabled = false,
  onToggleAsias50,
  onMapInteraction
}, ref) => {
  const mapRef = useRef<Map | null>(null);
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showPlacesCount, setShowPlacesCount] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const pwaStatus = detectPWAStatus();
  const detectedBrowser = detectBrowser();
  const { toast } = useToast();
  
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
  
  // Get user location - automatically get if permission already granted
  const { position: userPosition, getCurrentPosition, requestPermission } = useGeolocation({
    immediate: false, // We'll handle immediate location manually based on permission status
  });

  // Check if we should get location immediately (if permission already granted)
  useEffect(() => {
    const checkAndGetLocation = async () => {
      const permissionStatus = geolocationService.getPermissionStatus();
      
      if (permissionStatus === 'granted') {
        await getCurrentPosition();
      }
    };
    
    checkAndGetLocation();
  }, [getCurrentPosition]);

  // Handle places count display with auto-dismiss
  useEffect(() => {
    if (places.length > 0) {
      setShowPlacesCount(true);
      
      // Auto-dismiss after 1 second
      const timer = setTimeout(() => {
        setShowPlacesCount(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [places.length]);

  // Use URL state if available, otherwise fall back to smart defaults
  const mapCenter = useMemo(() => {
    if (initialCenter) {
      return [initialCenter.lat, initialCenter.lng] as [number, number];
    }
    return [SMART_DEFAULT_VIEWPORT.center.lat, SMART_DEFAULT_VIEWPORT.center.lng] as [number, number];
  }, [initialCenter]);

  const mapZoom = useMemo(() => {
    return initialZoom || SMART_DEFAULT_VIEWPORT.defaultZoom;
  }, [initialZoom]);

  // Places data will be passed from parent component
  // Remove local place fetching to avoid duplication

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setCurrentBounds(bounds);
    
    // Notify parent about viewport changes
    if (onViewportChange) {
      const center = bounds.getCenter();
      const zoom = mapRef.current?.getZoom() || SMART_DEFAULT_VIEWPORT.defaultZoom;
      const viewport: MapViewport = {
        center,
        zoom,
        bounds,
      };
      onViewportChange(viewport);
    }
  }, [onViewportChange]);

  const handleLocationRequest = useCallback(async () => {
    try {
      sendGAEvent('Map', 'geolocation_request', 'user_location_button');

      // Check current permission status first
      const currentPermission = geolocationService.getPermissionStatus();

      if (currentPermission === 'granted') {
        const position = await getCurrentPosition();
        
        // Center map on user location with smooth transition (following existing marker zoom pattern)
        if (mapRef.current && position) {
          const userLatLng = new LatLng(position.latitude, position.longitude);
          mapRef.current.setView(userLatLng, MAP_CONFIG.interactions.markerFocusZoom, {
            animate: true,
            duration: 0.8, // 800ms transition
            easeLinearity: 0.25,
            noMoveStart: false
          });
        }
        
        sendGAEvent('Map', 'geolocation_success', 'user_location_found');
        return;
      }

      // Request permission if not already granted
      const permission = await requestPermission();

      if (permission === 'granted') {
        const position = await getCurrentPosition();
        
        // Center map on user location with smooth transition (following existing marker zoom pattern)
        if (mapRef.current && position) {
          const userLatLng = new LatLng(position.latitude, position.longitude);
          mapRef.current.setView(userLatLng, MAP_CONFIG.interactions.markerFocusZoom, {
            animate: true,
            duration: 0.8, // 800ms transition
            easeLinearity: 0.25,
            noMoveStart: false
          });
        }
        
        sendGAEvent('Map', 'geolocation_success', 'user_location_found');
        return;
      }

      // permission === 'denied'
      sendGAEvent('Map', 'geolocation_denied', 'permission_denied');
      toast({
        title: 'Location access denied',
        description: 'Please enable location access in your browser settings to find nearby places.',
      });
    } catch (error) {
      console.error('Location request failed:', error);
      sendGAEvent('Map', 'geolocation_error', 'request_failed');
      toast({
        title: 'Location error',
        description: 'Unable to get your location. Please try again.',
      });
    } finally {
      setIsLocationLoading(false);
    }
  }, [requestPermission, toast, getCurrentPosition]);

  // Handle marker click with smooth zoom and center
  const handleMarkerClick = useCallback((place: PlaceMarker) => {
    if (mapRef.current) {
      const latLng = new LatLng(place.lat, place.lng);
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = MAP_CONFIG.interactions.markerFocusZoom;
      
      // Only zoom in if current zoom is lower than target zoom
      const finalZoom = currentZoom < targetZoom ? targetZoom : currentZoom;
      
      // Center and zoom to the marker with smooth transition
      mapRef.current.setView(latLng, finalZoom, {
        animate: true,
        duration: 0.5, // 500ms transition
        easeLinearity: 0.25,
        noMoveStart: false
      });
      // Call the onMarkerClick callback if provided
      onMarkerClick?.(place);
      
      // Also call onPlaceSelect for backward compatibility
      onPlaceSelect?.(place);
      
      // Track marker click
      sendGAEvent('Map', 'marker_click', place.name || 'unknown_place');
    }
  }, [onMarkerClick, onPlaceSelect]);

  // Handle city jump with instant navigation (no animation)
  const handleCityJump = useCallback((city: City | CityArea) => {
    if (mapRef.current) {
      const cityLatLng = new LatLng(city.lat, city.lng);
      
      // Jump to city/area instantly without animation
      mapRef.current.setView(cityLatLng, city.zoom, {
        animate: false
      });
      
      // Update current city state - if it's an area, find the parent city
      if ('areas' in city) {
        // This is a city
        setCurrentCity(city);
      } else {
        // This is an area, find the parent city
        const parentCity = CITY_QUICK_ZOOM.cities.find(c => 
          'areas' in c && c.areas && c.areas.some(area => area.key === city.key)
        );
        if (parentCity) {
          setCurrentCity(parentCity as City);
        }
      }
      
      // Track city/area jump event
      const eventLabel = city.key.toLowerCase().replace(/\s+/g, '_');
      sendGAEvent('Map', 'city_jump', eventLabel);
    }
  }, []);

  // Determine current city based on map center
  const determineCurrentCity = useCallback((center: LatLng): City | null => {
    const cities = CITY_QUICK_ZOOM.cities;
    let closestCity: City | null = null;
    let minDistance = Infinity;
    
    for (const city of cities) {
      const cityLatLng = new LatLng(city.lat, city.lng);
      const distance = center.distanceTo(cityLatLng);
      
      // If we're within 10km of a city center, consider it the current city
      if (distance < 10000 && distance < minDistance) {
        minDistance = distance;
        closestCity = city as City;
      }
    }
    
    return closestCity;
  }, []);

  // Refresh map function
  const refreshMap = useCallback(() => {
    if (mapRef.current) {
      // Refresh map tiles
      mapRef.current.invalidateSize();
      
      // Force a redraw of all layers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.redraw();
        }
      });
      
      // Trigger a viewport change to refresh data
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      const bounds = mapRef.current.getBounds();
      
      const viewport: MapViewport = {
        center,
        zoom,
        bounds,
      };
      
      onViewportChange?.(viewport);
      
      // Track map refresh
      sendGAEvent('Map', 'map_refresh', 'try_again_clicked');
    }
  }, [onViewportChange]);

  // Center map on user location when detected (only if no URL coordinates provided)
  useEffect(() => {
    if (userPosition && mapRef.current && shouldCenterOnUserLocation) {
      const userLatLng = new LatLng(userPosition.latitude, userPosition.longitude);
      // Center map on user location with zoom level 16
      mapRef.current.setView(userLatLng, MAP_CONFIG.interactions.markerFocusZoom);
    }
  }, [userPosition, shouldCenterOnUserLocation]);

  // Update current city when map center changes
  useEffect(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const newCurrentCity = determineCurrentCity(center);
      if (newCurrentCity !== currentCity) {
        setCurrentCity(newCurrentCity);
      }
    }
  }, [currentBounds, determineCurrentCity, currentCity]);

  if (error) {
    console.error('Error loading map places:', error);
  }

  return (
    <div className={`relative ${className}`} style={{ height, overflow: 'hidden' }}>
      <LeafletMapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={true}
        style={{ height: '100%', overflow: 'hidden' }}
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
          onMapInteraction={onMapInteraction}
        />

        {/* User location marker */}
        {userPosition && (
          <UserLocationMarker 
            position={new LatLng(userPosition.latitude, userPosition.longitude)} 
          />
        )}

        {/* Render children (Place markers) */}
        <MarkerClickContext.Provider value={handleMarkerClick}>
          {children}
        </MarkerClickContext.Provider>
      </LeafletMapContainer>

      {/* Zoom controls removed per design */}

      {/* Floating controls - positioned on right side */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
        
        {/* Location button */}
        {geolocationService.getPermissionStatus() === 'denied' ? (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isLocationLoading}
                  title={t.locationAccessBlocked}
                >
                  {isLocationLoading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
                  ) : (
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
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {t.enableLocationAccess}
                    </h3>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-4">
                      {t.locationHelpDescription}
                    </p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-black mb-2">
                        {getBrowserTutorial(detectedBrowser, t, pwaStatus).title}
                      </div>
                      <ol className="text-sm text-black space-y-2">
                        {getBrowserTutorial(detectedBrowser, t, pwaStatus).steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className=" font-boldrounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsPopoverOpen(false)}
                    >
                      {t.gotIt}
                    </Button>
                    <Button
                      onClick={() => {
                        handleLocationRequest();
                        refreshMap();
                        setIsPopoverOpen(false);
                      }}
                      className="flex-1"
                    >
                      {t.tryAgain}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-center">
                    {t.locationHelpTip}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                handleLocationRequest();
              }}
              disabled={isLocationLoading}
              className={userPosition ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" : ""}
              title={userPosition ? "Location found - showing nearby places" : "Find my location"}
            >
              {isLocationLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
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
              )}
            </Button>
          )}
        </div>

        {/* Horizontal filter chips bar - top full width, scrollable */}
        <div className="absolute top-16 left-0 right-20 z-10 px-4 pointer-events-none">
          <div className="w-full overflow-x-auto no-scrollbar pointer-events-auto">
            <div className="flex gap-2 min-w-full pr-4">
              {/* City selector - positioned to the left of open now button */}
              <CitySelector
                onCitySelect={handleCityJump}
                currentCity={currentCity}
                userPosition={userPosition}
              />
              {/* Open Now chip */}
              <Button
                variant={openNowEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleOpenNow?.()}
                title={t.openNow}
              >
                {t.openNow}
              </Button>
              {/* Asia's 50 Best chip */}
              <Button
                variant={asias50Enabled ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleAsias50?.()}
                title={"Asia's 50 Best"}
              >
                {"Asia's 50 Best"}
              </Button>
              {/* Future chips can be added here */}
            </div>
            
            {/* Area navigation buttons - shown when a city with areas is selected */}
            {currentCity && 'areas' in currentCity && currentCity.areas && currentCity.areas.length > 0 && (
              <div className="mt-2 flex gap-2 min-w-full pr-4">
                {currentCity.areas.map((area) => (
                  <Button
                    key={`area-${area.key}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCityJump(area)}
                    className="text-xs whitespace-nowrap"
                    title={String(t[area.key as keyof typeof t] || area.key)}
                  >
                    {t[area.key as keyof typeof t] || area.key}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Places count indicator - below chips */}
        {places.length > 0 && (
          <div 
            className={`absolute top-28 px-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full py-2 transition-all duration-300 ease-in-out ${
              showPlacesCount 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <span className="text-sm text-gray-600">
              {t.foundPlacesInArea.replace('{count}', String(places.length))}
            </span>
          </div>
        )}
        
        {/* Map updating indicator */}
        {isLoading && (
          <div className="absolute top-36 px-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600/90 backdrop-blur-sm shadow-lg rounded-full py-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Updating map...
            </div>
          </div>
        )}
      </div>
  );
});

MapContainer.displayName = 'MapContainer';
