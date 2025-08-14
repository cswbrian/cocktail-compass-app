# Leaflet + Supabase Integration Strategy

## 🎯 Core Integration Plan

### Data Flow Architecture
```
User Interaction (map pan/zoom)
    ↓
Debounced Event Handler (300ms)
    ↓
Calculate Map Bounds
    ↓
Supabase RPC: places_in_viewport(bounds)
    ↓
PostGIS Query (spatial index)
    ↓
SWR Cache + UI Update
    ↓
Lazy Render Visible Markers
```

## ⚡ Performance Optimizations

### 1. Viewport-Based Loading
```typescript
// Only load places visible in current map bounds
const { data: places } = useSWR(
  ['places-viewport', bounds],
  () => supabase.rpc('places_in_viewport', bounds)
);
```

### 2. Debounced Map Events
```typescript
// Prevent excessive API calls during map movement
const debouncedBoundsChange = useMemo(
  () => debounce(handleBoundsChange, 300),
  []
);
```

### 3. Marker Virtualization
```typescript
// Only render markers visible at current zoom level
const visibleMarkers = useMemo(() => 
  places.filter(place => isInViewport(place, bounds))
, [places, bounds]);
```

### 4. SWR Caching Strategy
```typescript
// Cache places by viewport + region for 5 minutes
const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3
};
```

## 🗺️ Leaflet Optimization

### Efficient Tile Loading
- **CDN**: OpenStreetMap tiles from fast CDN
- **Caching**: Browser cache tiles for offline use  
- **Preloading**: Preload adjacent tiles on idle

### Marker Management
- **Clustering**: Group nearby markers at low zoom
- **Icon Reuse**: Single icon instance for all markers
- **Layer Groups**: Organize markers by region/type
- **Memory Cleanup**: Remove markers outside viewport

### Mobile Performance
- **Touch Events**: Optimized touch handlers
- **Gesture Control**: Smooth pinch-to-zoom
- **Battery**: Reduce GPS polling frequency
- **Network**: Compress tile requests

## 📊 PostGIS Function Usage

### 1. Initial Region Load
```sql
-- Load places for user's region
SELECT * FROM places_by_region('Hong Kong');
```

### 2. Viewport Updates
```sql
-- Load places in current map bounds
SELECT * FROM places_in_viewport(min_lat, min_lng, max_lat, max_lng);
```

### 3. Nearby Places
```sql
-- "Near me" functionality
SELECT * FROM nearby_places(user_lat, user_lng, 5000);
```

## 🚀 Progressive Loading Strategy

### Phase 1: Region-Based
1. Detect user location or ask for region
2. Load `places_by_region()` for initial display
3. Center map on region bounds

### Phase 2: Viewport-Based  
1. User pans/zooms map
2. Calculate new bounds
3. Call `places_in_viewport()` for new areas
4. Merge with existing cached places

### Phase 3: Smart Preloading
1. Predict user movement direction
2. Preload adjacent map areas
3. Cache in background for smooth experience

## 📱 Mobile Optimizations

### Touch Performance
- **Debounced Events**: 16ms debounce for smooth scrolling
- **Hardware Acceleration**: CSS transforms for markers
- **Memory Management**: Cleanup invisible markers
- **Battery Optimization**: Reduce update frequency when backgrounded

### Network Efficiency
- **Request Batching**: Combine multiple place requests
- **Compression**: Enable gzip for API responses  
- **Caching**: Aggressive caching with SWR
- **Offline**: Show cached places when offline

## 🔧 Implementation Status ✅ COMPLETED

### Core Integration ✅ COMPLETED
- ✅ **Supabase Client**: PostGIS functions integrated via `map-service.ts`
- ✅ **SWR Caching**: Spatial query keys with viewport-based cache invalidation
- ✅ **Debounced Handlers**: 300ms debounce on map events for smooth performance
- ✅ **Viewport Calculation**: Precise bounds calculation with `LatLngBounds`

### Performance ✅ COMPLETED
- ✅ **Marker Clustering**: `leaflet.markercluster` with configurable zoom thresholds
- ✅ **Lazy Rendering**: Viewport-based marker loading with smooth transitions
- ✅ **Memory Management**: Automatic cleanup with fade-out animations
- ✅ **Progressive Loading**: Smart caching strategy with `displayPlaces` state

### Mobile Experience ✅ COMPLETED
- ✅ **Touch Controls**: Custom zoom controls with `variant="outline"` styling
- ✅ **Responsive Design**: Mobile-first approach with touch-friendly interactions
- ✅ **Smooth Animations**: CSS transitions with `cubic-bezier` easing
- ✅ **Geolocation**: PWA-ready location services with permission handling
- ✅ **Location Button**: Blue-highlighted button with real-time positioning
- ✅ **Context Display**: "N places within 1km" vs "N places found" indicators

### Advanced Features ✅ COMPLETED
- ✅ **URL State Management**: Map state persistence in URL parameters
- ✅ **Session Storage**: State restoration across navigation
- ✅ **Internationalization**: Full translation support for map components
- ✅ **Dark Theme**: Custom Leaflet attribution styling with backdrop blur
- ✅ **Error Handling**: Graceful fallbacks and user-friendly error messages
- ✅ **Production Ready**: Cross-platform testing and accessibility compliance

## 🆕 Day 5 Enhanced Integration

### List View Integration
- **Data Sharing**: Reuse existing PostGIS queries for list view
- **Distance Sorting**: Leverage `nearby_places()` distance calculation
- **Synchronized State**: Map and list view share selected place state
- **Performance**: Virtualized list rendering for large result sets
- **Smooth Transitions**: Animated transitions between map and list views

### Opening Hours Integration
- **Database Schema**: JSONB field for flexible schedule storage
- **Real-time Calculation**: Database functions for current open/closed status
- **Caching Strategy**: 5-minute cache for opening hours calculations
- **Time Zone Support**: Accurate local time handling across regions
- **Visual Indicators**: Color-coded status on markers and place cards

### Filter Integration
- **Efficient Filtering**: Client-side filtering without re-querying database
- **Marker Updates**: Dynamic marker visibility based on open/closed status
- **State Persistence**: Filter preferences saved in session storage
- **Performance**: Minimal re-rendering when toggling filters
- **Combined Filters**: "Near me + open only" filter combinations

---
*Optimized for speed, efficiency, and enhanced user experience with Day 5 features*
