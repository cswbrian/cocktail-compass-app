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

## 🏗️ Architecture
```
Routes (/:language/map) - Protected by RequireUsername
    ↓
MapPage.tsx (lazy loaded)
├── MapContainer.tsx (Leaflet wrapper)
├── GeolocationProvider.tsx (PWA location services)
├── PlaceBottomSheet.tsx (popover <50% screen)
├── PlaceCarousel.tsx (swipeable navigation)  
├── RegionSelector.tsx (location picker)
└── PlaceMarker.tsx (map markers)

Services:
├── GeolocationService.ts (PWA geolocation + permissions)
├── MapService.ts (PostGIS integration)
└── PlaceService.ts (existing, enhanced)

Authentication:
├── Uses existing RequireUsername wrapper
├── Inherits AuthWrapper authentication flow
└── Redirects to login if not authenticated
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
}
```

**Enhanced Features**:
- ✅ PostGIS extension enabled
- ✅ Spatial index for fast geo queries  
- ✅ Region classification (Taiwan: 5, Hong Kong: 12)
- ✅ Optimized functions: `nearby_places()`, `places_in_viewport()`, `places_by_region()`

## 🎨 UX Decisions
- Bottom sheet popover (<50% screen)
- Swipeable place navigation
- Region auto-detection + manual selection
- Mobile-first responsive design
- Reuse existing PlaceCard components

## ⚡ Performance & Optimization Strategy

### Supabase Integration
- **PostGIS Functions**: Use `places_in_viewport()` for efficient map bounds queries
- **Regional Loading**: Load places by region using `places_by_region()` function
- **Distance Queries**: `nearby_places()` for "near me" functionality
- **Connection Pooling**: Reuse Supabase client connections

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

### Performance Targets
- **Initial Load**: <2s (map + current region places)
- **Map Pan/Zoom**: <500ms to load new places
- **Marker Rendering**: <100ms for 50+ markers
- **Memory Usage**: <50MB for 1000+ places
