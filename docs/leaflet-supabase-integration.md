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

## 🔧 Implementation Checklist

### Core Integration
- [ ] Supabase client with PostGIS functions
- [ ] SWR setup with spatial query keys
- [ ] Debounced map event handlers
- [ ] Viewport bounds calculation

### Performance
- [ ] Marker clustering for dense areas
- [ ] Lazy rendering of off-screen markers
- [ ] Memory cleanup on component unmount
- [ ] Progressive loading with preloading

### Mobile Experience
- [ ] Touch-optimized controls
- [ ] Responsive marker sizing
- [ ] Smooth animations
- [ ] Offline fallback

### Monitoring
- [ ] Performance metrics tracking
- [ ] Error boundary for map failures
- [ ] Load time monitoring
- [ ] Memory usage tracking

---
*Optimized for speed, efficiency, and user experience*
