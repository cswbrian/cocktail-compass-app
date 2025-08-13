import { LatLngBounds, LatLng } from 'leaflet';
import { MapRegion } from '@/types/map';

/**
 * Map configuration options
 * 
 * To disable clustering: Set enableClustering to false
 * To customize clustering: Modify the clustering options below
 */
export const MAP_CONFIG = {
  // Enable/disable marker clustering
  enableClustering: false, // Set to false to disable clustering, true to enable
  
  // Clustering options (only used when enableClustering is true)
  clustering: {
    // Disable clustering at this zoom level and higher
    disableClusteringAtZoom: 15,
    // Maximum radius that a cluster will cover
    maxClusterRadius: 80,
    // Show coverage on hover
    showCoverageOnHover: true,
    // Animate adding markers to the map
    animateAddingMarkers: true,
  },
  
  // Debounce delay for map viewport changes (in milliseconds)
  viewportDebounceDelay: 500,
  
  // Smooth transitions for markers
  smoothTransitions: {
    // Enable smooth marker transitions
    enabled: true,
    // Duration for marker fade in/out animations (in milliseconds)
    fadeDuration: 300,
    // Keep old markers visible while loading new ones
    keepOldMarkersWhileLoading: true,
  },
  
  // Map interactions
  interactions: {
    // Duration for map centering animation when marker is clicked (in seconds)
    centerDuration: 0.5,
    // Whether to show popups on marker click (false = use bottom sheet instead)
    showPopups: false,
  },
  
  // SWR cache settings
  cache: {
    // Don't revalidate on window focus
    revalidateOnFocus: false,
    // Dedupe requests within this interval (in milliseconds)
    dedupingInterval: 30000,
    // Number of retries on error
    errorRetryCount: 3,
  }
} as const;

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
    center: new LatLng(22.2843556, 114.1527621), // Central district, Hong Kong
    defaultZoom: 16,
  },
};

export type MapConfig = typeof MAP_CONFIG;
