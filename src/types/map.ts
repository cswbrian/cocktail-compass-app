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

export interface MapRegion {
  id: string;
  name: string;
  bounds: LatLngBounds;
  center: LatLng;
  defaultZoom: number;
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
  region?: string;
  nearLocation?: LatLng;
  radiusKm?: number;
  limit?: number;
}

export interface PlaceWithStats extends Place {
  cocktail_count?: number;
  visit_count?: number;
  avg_rating?: number;
}

// Pre-defined regions for Taiwan and Hong Kong
export const MAP_REGIONS: Record<string, MapRegion> = {
  taiwan: {
    id: 'taiwan',
    name: 'Taiwan',
    bounds: new LatLngBounds([21.9, 120.0], [25.3, 122.0]),
    center: new LatLng(23.8, 121.0),
    defaultZoom: 8,
  },
  hongkong: {
    id: 'hongkong',
    name: 'Hong Kong',
    bounds: new LatLngBounds([22.15, 113.8], [22.58, 114.5]),
    center: new LatLng(22.2849, 114.1577), // Central district, Hong Kong
    defaultZoom: 16,
  },
};
