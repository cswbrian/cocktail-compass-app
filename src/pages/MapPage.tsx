import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer } from '@/components/map/MapContainer';
import { PlaceMarkers } from '@/components/map/PlaceMarkers';
import { PlaceBottomSheet } from '@/components/map/PlaceBottomSheet';

import { PlaceMarker, MapViewport } from '@/types/map';
import { mapService } from '@/services/map-service';
import useSWR from 'swr';
import { LatLngBounds } from 'leaflet';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { MAP_CONFIG } from '@/config/map-config';

export function MapPage() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceMarker | null>(null);
  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [displayPlaces, setDisplayPlaces] = useState<PlaceMarker[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userDraggedMap, setUserDraggedMap] = useState(false);
  const mapRef = useRef<any>(null); // Reference to the map instance
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Initialize map state from URL parameters immediately
  const initializeMapState = useCallback(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    const selectedPlaceId = searchParams.get('place');

    return {
      center: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { lat: 22.2849, lng: 114.1577 },
      zoom: zoom ? parseInt(zoom) : 16,
      selectedPlaceId: selectedPlaceId,
    };
  }, [searchParams]);

  // Map state from URL parameters - initialize immediately with URL state
  const [mapState, setMapState] = useState(() => initializeMapState());

  // Update map state when URL changes
  useEffect(() => {
    const newState = initializeMapState();
    setMapState(newState);
  }, [initializeMapState, location.search]);

  // Function to update URL with current map state
  const updateURL = useCallback((newState: Partial<typeof mapState>) => {
    const params = new URLSearchParams(searchParams);
    
    if (newState.center) {
      params.set('lat', newState.center.lat.toFixed(4));
      params.set('lng', newState.center.lng.toFixed(4));
    }
    if (newState.zoom !== undefined) {
      params.set('zoom', newState.zoom.toString());
    }
    if (newState.selectedPlaceId) {
      params.set('place', newState.selectedPlaceId);
    } else if (newState.selectedPlaceId === null) {
      params.delete('place');
    }
    
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Use viewport-based loading only after user interaction, otherwise use region
  const shouldUseViewport = userInteracted && currentBounds !== null;
  
  const swrKey = shouldUseViewport
    ? CACHE_KEYS.PLACES_IN_VIEWPORT(currentBounds!.toBBoxString()) 
    : CACHE_KEYS.PLACES_BY_REGION('hongkong');
    
  const swrFetcher = shouldUseViewport
    ? () => fetchers.getPlacesInViewport(currentBounds!.toBBoxString())
    : () => fetchers.getPlacesByRegion('hongkong');
  
  // Debug logging before SWR call (comment out for production)
  // console.log('🔍 SWR Setup:', {
  //   shouldUseViewport,
  //   userInteracted,
  //   currentBounds: currentBounds?.toBBoxString(),
  //   swrKey,
  //   timestamp: new Date().toISOString()
  // });
  
  const { data: places = [], error, isLoading } = useSWR(
    swrKey,
    swrFetcher,
    MAP_CONFIG.cache
  );

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
            mapRef.current.setView([place.lat, place.lng], mapRef.current.getZoom(), {
              animate: !isInitialLoad, // No animation on initial load for faster UX
              duration: MAP_CONFIG.interactions.centerDuration
            });
            
            // Update the URL to match the actual place coordinates
            const newMapState = {
              center: { lat: place.lat, lng: place.lng },
              zoom: mapRef.current.getZoom(),
              selectedPlaceId: place.id,
            };
            setMapState(newMapState);
            updateURL(newMapState);
          }
        }
      }
    }
  }, [mapState.selectedPlaceId, displayPlaces, selectedPlace, isInitialLoad, userDraggedMap, updateURL]);

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
  
  // Debug logging after SWR call (comment out for production)
  // console.log('📊 SWR Result:', {
  //   placesCount: places.length,
  //   displayPlacesCount: displayPlaces.length,
  //   isLoading,
  //   isInitialLoad,
  //   error: error?.message,
  //   firstPlace: places[0]?.name,
  //   timestamp: new Date().toISOString()
  // });

  const handleViewportChange = useCallback((viewport: MapViewport) => {
    // console.log('🗺️ Viewport Changed:', {
    //   bounds: viewport.bounds.toBBoxString(),
    //   center: `${viewport.center.lat.toFixed(4)}, ${viewport.center.lng.toFixed(4)}`,
    //   zoom: viewport.zoom,
    //   userInteracted: userInteracted,
    //   timestamp: new Date().toISOString()
    // });
    
    setCurrentBounds(viewport.bounds);
    setUserInteracted(true); // Mark that user has interacted with the map
    setUserDraggedMap(true); // Mark that user has manually moved the map
    
    // Update map state and URL
    const newMapState = {
      center: { lat: viewport.center.lat, lng: viewport.center.lng },
      zoom: viewport.zoom,
      selectedPlaceId: mapState.selectedPlaceId, // Keep current selection
    };
    setMapState(newMapState);
    updateURL(newMapState);
  }, [userInteracted, mapState.selectedPlaceId, updateURL]);

  const handlePlaceSelect = useCallback((place: PlaceMarker) => {
    setSelectedPlace(place);
    setShowBottomSheet(true);
    setUserDraggedMap(false); // Reset drag flag when user selects a place
    
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
      mapRef.current.setView([place.lat, place.lng], mapRef.current.getZoom(), {
        animate: true,
        duration: MAP_CONFIG.interactions.centerDuration
      });
    }
    
    // Update URL with new selected place and center
    const newMapState = {
      center: { lat: place.lat, lng: place.lng },
      zoom: mapRef.current?.getZoom() || mapState.zoom,
      selectedPlaceId: place.id,
    };
    setMapState(newMapState);
    updateURL(newMapState);
    // Note: Bottom sheet remains open, just changes content
  }, [mapState, updateURL]);

  const handleBottomSheetClose = useCallback(() => {
    setShowBottomSheet(false);
    
    // Clear selected place from URL
    const newMapState = {
      ...mapState,
      selectedPlaceId: null,
    };
    setMapState(newMapState);
    updateURL(newMapState);
  }, [mapState, updateURL]);

  const handleNavigateToPlace = useCallback((placeId: string) => {
    navigate(`/en/place/${placeId}`);
  }, [navigate]);

  if (error) {
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
        initialRegion="hongkong"
        initialCenter={mapState.center}
        initialZoom={mapState.zoom}
        className="h-full w-full"
        places={displayPlaces}
        isLoading={isInitialLoad && isLoading}
        error={error}
      >
        {/* Add PlaceMarkers as children with configurable clustering */}
        <PlaceMarkers
          places={displayPlaces}
          onPlaceClick={handlePlaceSelect}
          selectedPlaceId={selectedPlace?.id}
          enableClustering={MAP_CONFIG.enableClustering}
        />
      </MapContainer>

      {/* Subtle loading indicator in corner - positioned below transparent header */}
      {isLoading && !isInitialLoad && userInteracted && (
        <div className="absolute top-20 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-gray-600">Updating...</span>
          </div>
        </div>
      )}

      {/* Enhanced Bottom Sheet with Navigation */}
      <PlaceBottomSheet
        place={selectedPlace}
        places={displayPlaces}
        isOpen={showBottomSheet}
        onClose={handleBottomSheetClose}
        onNavigateToPlace={handleNavigateToPlace}
        onPlaceChange={handlePlaceChange}
      />

    </div>
  );
}
