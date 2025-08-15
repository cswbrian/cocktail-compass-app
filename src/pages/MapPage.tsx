import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { MapContainer } from '@/components/map/MapContainer';
import { PlaceBottomSheet } from '@/components/map/PlaceBottomSheet';
import { PlaceMarkers } from '@/components/map/PlaceMarkers';
import { PlaceMarker } from '@/types/map';
import { MAP_CONFIG, SMART_DEFAULT_VIEWPORT } from '@/config/map-config';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';
import { useAuth } from '@/context/AuthContext';
import { sendGAEvent } from '@/lib/ga';
import { LatLngBounds } from 'leaflet';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedPlaceId: string | null;
  hasUrlCoordinates: boolean;
}

export default function MapPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const mapRef = useRef<any>(null);
  
  // Map state management
  const [mapState, setMapState] = useState<MapState>(() => {
    // Initialize from URL or use smart defaults
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    const place = searchParams.get('place');
    
    if (lat && lng) {
      return {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        zoom: zoom ? parseInt(zoom) : SMART_DEFAULT_VIEWPORT.defaultZoom,
        selectedPlaceId: place,
        hasUrlCoordinates: true,
      };
    }
    
    // Smart defaults when no URL coordinates are present
    const defaultCenter = { lat: SMART_DEFAULT_VIEWPORT.center.lat, lng: SMART_DEFAULT_VIEWPORT.center.lng };
    
    return {
      center: defaultCenter,
      zoom: zoom ? parseInt(zoom) : SMART_DEFAULT_VIEWPORT.defaultZoom,
      selectedPlaceId: place,
      hasUrlCoordinates: false,
    };
  });

  // Places data state
  const [displayPlaces, setDisplayPlaces] = useState<PlaceMarker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMarker | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(() => searchParams.get('open') === '1');
  const [asias50Only, setAsias50Only] = useState<boolean>(() => searchParams.get('a50') === '1');
  
  // Map interaction state
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [userDraggedMap, setUserDraggedMap] = useState(false);

  // Update URL when map state changes
  const updateURL = useCallback((newState: MapState) => {
    const params = new URLSearchParams(searchParams);
    
    if (newState.hasUrlCoordinates) {
      params.set('lat', newState.center.lat.toString());
      params.set('lng', newState.center.lng.toString());
      params.set('zoom', newState.zoom.toString());
    } else {
      params.delete('lat');
      params.delete('lng');
      params.delete('zoom');
    }
    
    if (newState.selectedPlaceId) {
      params.set('place', newState.selectedPlaceId);
    } else {
      params.delete('place');
    }
    
    // Persist filters
    if (openNowOnly) {
      params.set('open', '1');
    } else {
      params.delete('open');
    }
    if (asias50Only) {
      params.set('a50', '1');
    } else {
      params.delete('a50');
    }
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, openNowOnly, asias50Only]);

  // Smart data loading strategy: use viewport when available, fallback to smart defaults
  const shouldUseViewport = userInteracted && currentBounds !== null;
  
  const swrKey = shouldUseViewport
    ? CACHE_KEYS.PLACES_IN_VIEWPORT(currentBounds!.toBBoxString()) 
    : CACHE_KEYS.PLACES_SMART_FALLBACK;
    
  const swrFetcher = shouldUseViewport
    ? () => fetchers.getPlacesInViewport(currentBounds!.toBBoxString())
    : () => fetchers.getPlacesWithSmartFallback();
  
  const { data: places = [], error, isLoading } = useSWR(
    swrKey,
    swrFetcher,
    MAP_CONFIG.cache
  );

  // Derived, filtered places for rendering
  const renderPlaces = useMemo(() => {
    let filtered = displayPlaces;
    if (openNowOnly) {
      filtered = filtered.filter((p) => (p as any).is_open === true);
    }
    if (asias50Only) {
      filtered = filtered.filter((p: any) => Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase() === "asia's 50 best"));
    }
    return filtered;
  }, [displayPlaces, openNowOnly, asias50Only]);

  // Update selected place when filters change to ensure it's still in filtered results
  useEffect(() => {
    if (selectedPlace && !renderPlaces.find(p => p.id === selectedPlace.id)) {
      // Selected place is no longer in filtered results, select the first available place
      if (renderPlaces.length > 0) {
        setSelectedPlace(renderPlaces[0]);
        setShowBottomSheet(true);
        // Update URL with new selected place
        const newMapState = {
          ...mapState,
          selectedPlaceId: renderPlaces[0].id,
        };
        setMapState(newMapState);
        updateURL(newMapState);
      } else {
        // No places match the filter, close bottom sheet
        setSelectedPlace(null);
        setShowBottomSheet(false);
        // Clear selected place from URL
        const newMapState = {
          ...mapState,
          selectedPlaceId: null,
        };
        setMapState(newMapState);
        updateURL(newMapState);
      }
    }
  }, [renderPlaces, selectedPlace, mapState, updateURL]);

  // Smooth place updates - keep previous places visible while loading new ones
  useEffect(() => {
    if (!isLoading && places.length > 0) {
      setDisplayPlaces(places);
      setIsInitialLoad(false);
    }
  }, [places, isLoading]);

  // Initialize displayPlaces on first load
  useEffect(() => {
    if (isInitialLoad && places.length > 0) {
      setDisplayPlaces(places);
      setIsInitialLoad(false);
    }
  }, [places, isInitialLoad]);

  // Restore selected place from URL and center map
  useEffect(() => {
    // If navigation state contains a place, prioritize it on first render
    if (!selectedPlace && (location.state as any)?.place) {
      const statePlace = (location.state as any).place as PlaceMarker;
      setSelectedPlace(statePlace);
      setShowBottomSheet(true);
      const newMapState = {
        center: { lat: statePlace.lat, lng: statePlace.lng },
        zoom: MAP_CONFIG.interactions.markerFocusZoom,
        selectedPlaceId: statePlace.id,
        hasUrlCoordinates: true,
      };
      setMapState(newMapState);
      updateURL(newMapState);
    }
    if (mapState.selectedPlaceId && displayPlaces.length > 0) {
      const place = displayPlaces.find(p => p.id === mapState.selectedPlaceId);
      if (place) {
        // Only set if not already selected
        if (!selectedPlace || selectedPlace.id !== place.id) {
          setSelectedPlace(place);
          setShowBottomSheet(true);
        }
        
        // Only auto-center map if this is initial load or user hasn't manually moved the map
        if (mapRef.current && !userDraggedMap) {
          const currentCenter = mapRef.current.getCenter();
          const placeDistance = Math.abs(currentCenter.lat - place.lat) + Math.abs(currentCenter.lng - place.lng);
          
          // Center if place is not in current view (threshold: 0.001 degrees ≈ 100m)
          // or if this is the initial load with a place ID
          if (placeDistance > 0.001 || isInitialLoad) {
            mapRef.current.setView([place.lat, place.lng], MAP_CONFIG.interactions.markerFocusZoom, {
              animate: !isInitialLoad, // No animation on initial load for faster UX
              duration: MAP_CONFIG.interactions.centerDuration
            });
            
            // Update the URL to match the actual place coordinates
            const newMapState = {
              center: { lat: place.lat, lng: place.lng },
              zoom: MAP_CONFIG.interactions.markerFocusZoom,
              selectedPlaceId: place.id,
              hasUrlCoordinates: true, // Now has coordinates from place selection
            };
            setMapState(newMapState);
            updateURL(newMapState);
          }
        }
      }
    }
  }, [mapState.selectedPlaceId, displayPlaces, selectedPlace, isInitialLoad, userDraggedMap, updateURL, location.state]);

  // Save map state to sessionStorage for bottom nav persistence
  useEffect(() => {
    if (location.search && !isInitialLoad) {
      try {
        sessionStorage.setItem('lastMapState', location.search);
      } catch (error) {
        // Ignore sessionStorage errors (e.g., in private mode)
      }
    }
  }, [location.search, isInitialLoad]);
  
  const handleViewportChange = useCallback((viewport: any) => {
    
    setCurrentBounds(viewport.bounds);
    setUserInteracted(true); // Mark that user has interacted with the map
    setUserDraggedMap(true); // Mark that user has manually moved the map
    
    // Track map interaction
    sendGAEvent('Map', 'viewport_change', `zoom_${viewport.zoom}`);
    
    // Update map state and URL
    const newMapState = {
      center: { lat: viewport.center.lat, lng: viewport.center.lng },
      zoom: viewport.zoom,
      selectedPlaceId: mapState.selectedPlaceId, // Keep current selection
      hasUrlCoordinates: true, // Now has coordinates from user interaction
    };
    setMapState(newMapState);
    updateURL(newMapState);
  }, [userInteracted, mapState.selectedPlaceId, updateURL]);

  const handlePlaceSelect = useCallback((place: PlaceMarker) => {
    setSelectedPlace(place);
    setShowBottomSheet(true);
    setUserDraggedMap(false); // Reset drag flag when user selects a place
    
    // Track place selection
    sendGAEvent('Map', 'place_select', `${place.name} - ${place.id}`);
    
    // Update URL with selected place
    const newMapState = {
      ...mapState,
      selectedPlaceId: place.id,
    };
    setMapState(newMapState);
    updateURL(newMapState);
  }, [mapState, updateURL]);

  const handlePlaceChange = useCallback((place: PlaceMarker) => {
    setSelectedPlace(place);
    setUserDraggedMap(false); // Reset drag flag when navigating between places
    // Center map on the new place
    if (mapRef.current) {
      mapRef.current.setView([place.lat, place.lng], MAP_CONFIG.interactions.markerFocusZoom, {
        animate: true,
        duration: MAP_CONFIG.interactions.centerDuration
      });
    }
    
    // Track place navigation
    sendGAEvent('Map', 'place_navigate', `${place.name} - ${place.id}`);
    
    // Update URL with new selected place and center
    const newMapState = {
      center: { lat: place.lat, lng: place.lng },
      zoom: MAP_CONFIG.interactions.markerFocusZoom,
      selectedPlaceId: place.id,
      hasUrlCoordinates: true, // Now has coordinates from place navigation
    };
    setMapState(newMapState);
    updateURL(newMapState);
    // Note: Bottom sheet remains open, just changes content
  }, [mapState, updateURL]);

  const handleBottomSheetClose = useCallback(() => {
    setShowBottomSheet(false);
    
    // Track bottom sheet close
    sendGAEvent('Map', 'bottom_sheet_close', selectedPlace?.name || 'unknown');
    
    // Clear selected place from URL
    const newMapState = {
      ...mapState,
      selectedPlaceId: null,
    };
    setMapState(newMapState);
    updateURL(newMapState);
  }, [mapState, updateURL, selectedPlace]);

  const handleNavigateToPlace = useCallback((placeId: string) => {
    // This function is not directly used in the new smart fallback logic,
    // but keeping it for potential future use or if it's re-introduced.
    // For now, it will just navigate to the place ID.
    // If you want to navigate to a specific place page, you'd need a more sophisticated routing.
    // For now, it's a placeholder.
    // If you want to navigate to a specific place page, you'd need a more sophisticated routing.
    // For now, it's a placeholder.
  }, []);

  // Enhanced error handling with smart fallback information
  if (error) {
    
    // If we have fallback data, show a warning instead of full error
    if (displayPlaces.length > 0) {
      return (
        <div className="map-page-container-fullscreen relative w-full">
          <MapContainer
            ref={mapRef}
            onViewportChange={handleViewportChange}
            onPlaceSelect={handlePlaceSelect}
            initialCenter={mapState.center}
            initialZoom={mapState.zoom}
            shouldCenterOnUserLocation={!mapState.hasUrlCoordinates && isInitialLoad}
            className="h-full w-full"
            places={renderPlaces}
            isLoading={false}
            error={null}
            openNowEnabled={openNowOnly}
            onToggleOpenNow={() => {
              setOpenNowOnly((prev) => {
                const next = !prev;
                const params = new URLSearchParams(searchParams);
                if (next) params.set('open', '1'); else params.delete('open');
                setSearchParams(params, { replace: true });
                sendGAEvent('Map', next ? 'filter_open_now_on' : 'filter_open_now_off');
                return next;
              });
            }}
          >
            <PlaceMarkers
              places={renderPlaces}
              onPlaceClick={handlePlaceSelect}
              selectedPlaceId={selectedPlace?.id}
              enableClustering={MAP_CONFIG.enableClustering}
            />
          </MapContainer>

          {/* Warning banner for fallback data */}
          <div className="absolute top-20 left-4 right-4 z-20 bg-yellow-500/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-3 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-yellow-900">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Using fallback data
                </p>
                <p className="text-xs text-yellow-800">
                  Showing {displayPlaces.length} places from default area. Move the map to load more.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-yellow-900 hover:text-yellow-700 underline"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Bottom Sheet */}
          <PlaceBottomSheet
            place={selectedPlace}
            places={renderPlaces}
            isOpen={showBottomSheet}
            onClose={handleBottomSheetClose}
            onNavigateToPlace={handleNavigateToPlace}
            onPlaceChange={handlePlaceChange}
          />
        </div>
      );
    }

    // Full error state when no fallback data is available
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load map
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the map data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container-fullscreen relative w-full">
      <MapContainer
        ref={mapRef}
        onViewportChange={handleViewportChange}
        onPlaceSelect={handlePlaceSelect}
        initialCenter={mapState.center}
        initialZoom={mapState.zoom}
        shouldCenterOnUserLocation={!mapState.hasUrlCoordinates && isInitialLoad}
        className="h-full w-full"
        places={renderPlaces}
        isLoading={isInitialLoad && isLoading}
        error={error}
        openNowEnabled={openNowOnly}
        onToggleOpenNow={() => {
          setOpenNowOnly((prev) => {
            const next = !prev;
            const params = new URLSearchParams(searchParams);
            if (next) params.set('open', '1'); else params.delete('open');
            setSearchParams(params, { replace: true });
            sendGAEvent('Map', next ? 'filter_open_now_on' : 'filter_open_now_off');
            return next;
          });
        }}
        asias50Enabled={asias50Only}
        onToggleAsias50={() => {
          setAsias50Only((prev) => {
            const next = !prev;
            const params = new URLSearchParams(searchParams);
            if (next) params.set('a50', '1'); else params.delete('a50');
            setSearchParams(params, { replace: true });
            sendGAEvent('Map', next ? 'filter_a50_on' : 'filter_a50_off');
            return next;
          });
        }}
      >
        {/* Add PlaceMarkers as children with configurable clustering */}
        <PlaceMarkers
          places={renderPlaces}
          onPlaceClick={handlePlaceSelect}
          selectedPlaceId={selectedPlace?.id}
          enableClustering={MAP_CONFIG.enableClustering}
        />
      </MapContainer>

      {/* Subtle loading indicator in corner - positioned below transparent header */}

      {/* Enhanced Bottom Sheet with Navigation */}
      <PlaceBottomSheet
        place={selectedPlace}
        places={renderPlaces}
        isOpen={showBottomSheet}
        onClose={handleBottomSheetClose}
        onNavigateToPlace={handleNavigateToPlace}
        onPlaceChange={handlePlaceChange}
      />

    </div>
  );
}
