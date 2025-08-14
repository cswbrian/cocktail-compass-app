import { LatLngBounds, LatLng } from 'leaflet';
import { Place } from './place';

// Map-specific types
export interface MapViewport {
  center: LatLng;
  zoom: number;
  bounds: LatLngBounds;
}

export interface PlaceMarker extends Place {
  // Additional marker-specific properties can be added here
  distance?: number; // Distance from user in km
  clusterGroup?: string; // For marker clustering
}


export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  permissionStatus: PermissionState | null;
}

// Map search/filter types
export interface PlaceSearchParams {
  viewport?: LatLngBounds;
  nearLocation?: LatLng;
  radiusKm?: number;
  limit?: number;
}

export interface PlaceWithStats extends Place {
  cocktail_count?: number;
  visit_count?: number;
  avg_rating?: number;
}


