import { LatLngBounds, LatLng } from 'leaflet';

/**
 * Map configuration options
 * 
 * To disable clustering: Set enableClustering to false
 * To customize clustering: Modify the clustering options below
 */
export const MAP_CONFIG = {
  // Debounce delay for map viewport changes (in milliseconds)
  // Reduced for better responsiveness
  viewportDebounceDelay: 200,
  
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
    // Zoom level when a marker is clicked/focused
    markerFocusZoom: 16,
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

// Smart default viewport configuration (fallback when regions are removed)
export const SMART_DEFAULT_VIEWPORT = {
  // Default center (Hong Kong Central)
  center: new LatLng(22.2843556, 114.1527621),
  // Default zoom level for detailed street view
  defaultZoom: 16,
  // Default bounds covering Hong Kong area
  defaultBounds: new LatLngBounds([22.15, 113.8], [22.58, 114.5]),
  // Fallback viewport for initial data loading
  fallbackViewport: {
    min_lat: 22.15,
    max_lat: 22.58,
    min_lng: 113.8,
    max_lng: 114.5,
  },
  // Minimum viewport size for data loading (in degrees)
  minViewportSize: {
    lat: 0.01, // ~1km
    lng: 0.01,
  },
} as const;

export type MapConfig = typeof MAP_CONFIG;

// City-based quick zoom configuration
export const CITY_QUICK_ZOOM = {
  cities: [
    { name: 'Hong Kong', lat: 22.2933, lng: 114.1628, zoom: 14, country: 'HK' },
    { name: 'Taipei', lat: 25.0435, lng: 121.5354, zoom: 13, country: 'TW' },
    { name: 'Tainan', lat: 22.9938, lng: 120.2028, zoom: 15, country: 'TW' },
    { name: 'Kaohsiung', lat: 22.6281, lng: 120.3052, zoom: 14, country: 'TW' },
    // { name: 'Tokyo', lat: 35.6762, lng: 139.6503, zoom: 14, country: 'JP' },
    // { name: 'Bangkok', lat: 13.7563, lng: 100.5018, zoom: 14, country: 'TH' },
    // { name: 'Chiang Mai', lat: 18.7883, lng: 98.9853, zoom: 15, country: 'TH' }
  ]
} as const;

export type CityQuickZoom = typeof CITY_QUICK_ZOOM;
export type City = CityQuickZoom['cities'][0];
