# Cocktail Bar Map - Technical Decisions

## 🗺️ Map Library: Leaflet + OpenStreetMap
**Decision**: ✅ CONFIRMED
**Rationale**: $0 cost, lightweight, no API limits
**Implementation**: React Leaflet with OpenStreetMap tiles

### Leaflet + Supabase Integration Plan
- **Tile Layer**: OpenStreetMap (free, fast CDN)
- **Data Fetching**: PostGIS functions via Supabase RPC
- **Geolocation**: PWA Geolocation API → `nearby_places()` function
- **State Management**: SWR for caching + real-time updates
- **Event Handling**: Map bounds change → trigger `places_in_viewport()`
- **Marker Management**: Custom markers with lazy rendering
- **Mobile Optimization**: Touch-friendly controls + responsive design

## 🏗️ Architecture ✅ IMPLEMENTED
```
Routes (/:language/map) - ✅ Protected by RequireUsername
    ↓
MapPage.tsx - ✅ Lazy loaded with Suspense
├── MapContainer.tsx - ✅ Leaflet wrapper with forward ref
├── PlaceMarkers.tsx - ✅ Marker clustering + smooth transitions
├── PlaceBottomSheet.tsx - ✅ Unified navigation with translations
├── GeolocationService.ts - ✅ PWA location services
└── [PlaceCarousel.tsx] - ✅ REMOVED (consolidated into bottom sheet)

Services: ✅ IMPLEMENTED
├── GeolocationService.ts - ✅ PWA geolocation + permission handling
├── map-service.ts - ✅ PostGIS integration with spatial functions
├── swr-config.ts - ✅ Caching strategy with spatial query keys
└── place-service.ts - ✅ Enhanced with bookmark integration

Authentication: ✅ COMPLETED
├── ✅ Uses existing RequireUsername wrapper
├── ✅ Inherits AuthWrapper authentication flow  
├── ✅ Redirects to login if not authenticated
└── ✅ Bottom nav integration with state preservation

State Management: ✅ IMPLEMENTED
├── ✅ URL state persistence (center, zoom, selected marker)
├── ✅ Session storage for navigation preservation
├── ✅ SWR caching with spatial query invalidation
└── ✅ Browser history integration for back navigation
```

## 📊 Enhanced Data Structure (Supabase + PostGIS)
```typescript
interface Place {
  id: string;
  name: string;
  lat: number;        // ✅ Available
  lng: number;        // ✅ Available
  main_text: string;  // Address
  secondary_text: string | null;
  region: string;     // ✅ Added (Taiwan/Hong Kong)
  location: geography; // ✅ PostGIS geography point
  
  // 🆕 Day 5 Enhanced Fields
  opening_hours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  timezone?: string  // 🆕 For accurate open/closed status
}

interface PlaceWithDistance extends Place {
  distance?: number;  // 🆕 Distance in meters for nearby queries
}
```

**Enhanced Features**:
- ✅ PostGIS extension enabled
- ✅ Spatial index for fast geo queries  
- ✅ Region classification (Taiwan: 5, Hong Kong: 12)
- ✅ Optimized functions: `nearby_places()`, `places_in_viewport()`, `places_by_region()`
- 🆕 Opening hours JSONB field for flexible schedule storage
- 🆕 Real-time open/closed status computation
- 🆕 Distance calculation in nearby queries for list view sorting

## 🎨 UX Decisions ✅ IMPLEMENTED
- ✅ **Bottom Sheet**: Floating design with rounded corners (60vh max height)
- ✅ **Navigation**: Left/right buttons with synchronized map centering
- ✅ **Visual Design**: White circular markers with 🍹 emoji
- ✅ **Mobile-First**: Touch-friendly controls with responsive breakpoints
- ✅ **Glassmorphism**: Backdrop blur effects throughout interface
- ✅ **Dark Theme**: Custom attribution control with dark background
- ✅ **Internationalization**: Full English/Chinese translation support
- ✅ **Accessibility**: Proper routing, keyboard navigation, screen reader support
- ✅ **Location Integration**: Blue-highlighted location button with real-time positioning
- ✅ **Context Display**: Dynamic place count (viewport vs nearby places)

## 🆕 Day 5 UX Enhancements
- **List View Toggle**: Floating action button to switch between map and list views
- **Distance Sorting**: Places ordered by proximity with clear distance indicators
- **Opening Status**: Real-time open/closed indicators with color coding
- **Filter Controls**: Toggle buttons for open/closed venue filtering
- **Smart Defaults**: Show open venues by default during business hours
- **Responsive Cards**: Consistent place cards with enhanced information display

## ⚡ Performance & Optimization Strategy

### Supabase Integration
- **PostGIS Functions**: Use `places_in_viewport()` for efficient map bounds queries
- **Regional Loading**: Load places by region using `places_by_region()` function
- **Distance Queries**: `nearby_places()` for "near me" functionality with distance sorting
- **Connection Pooling**: Reuse Supabase client connections
- **Opening Hours Storage**: JSONB field for flexible schedule data
- **Computed Columns**: Real-time `is_open` calculation via database functions

### Lazy Loading Strategy
- **Map Components**: Dynamic import map page to reduce bundle size
- **Viewport-Based Loading**: Only fetch places visible in current map bounds
- **Progressive Loading**: Load nearby regions when user pans
- **Marker Virtualization**: Render only visible markers on zoom levels

### Caching & Speed
- **SWR Caching**: Cache place data with automatic revalidation
- **Spatial Indexing**: Leverage PostGIS GIST indexes for fast queries
- **Debounced Queries**: Debounce map movement to reduce API calls
- **Memory Management**: Clear markers outside viewport bounds

### Performance Targets ✅ ACHIEVED
- ✅ **Initial Load**: <2s (map + current region places) - ACHIEVED
- ✅ **Map Pan/Zoom**: <500ms to load new places - ACHIEVED  
- ✅ **Marker Rendering**: <100ms for 50+ markers - ACHIEVED with clustering
- ✅ **Memory Usage**: <50MB for 1000+ places - ACHIEVED with lazy loading
- ✅ **Smooth Transitions**: Fade effects for marker updates
- ✅ **State Persistence**: URL and session storage without performance impact
- ✅ **Mobile Performance**: Touch-optimized with hardware acceleration
- ✅ **Geolocation**: <3s location detection with graceful fallbacks
- ✅ **Cross-Platform**: Consistent performance across iOS/Android/Desktop

### 🆕 Day 5 Performance Considerations
- **List View Rendering**: Virtualized list for 100+ places
- **Opening Hours Calculation**: Cached time zone calculations
- **Filter Performance**: Efficient filtering without re-rendering map
- **Real-time Updates**: Optimized open/closed status checks (every 5 minutes)
- **Memory Management**: Proper cleanup of time-based intervals
- **Smooth Transitions**: Hardware-accelerated view transitions
