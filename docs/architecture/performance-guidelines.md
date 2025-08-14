# Performance Guidelines

## 🚀 Overview

Performance standards and optimization strategies that apply across all features in the Cocktail Compass app.

## 🎯 Performance Targets

### Core Metrics
- **Initial Load Time**: <2 seconds for core features
- **Feature Navigation**: <500ms between pages
- **Database Queries**: <200ms for standard queries
- **Spatial Queries**: <300ms for geographic operations
- **Bundle Size**: <500KB initial JavaScript bundle
- **Memory Usage**: <50MB for mobile devices

### Mobile Performance
- **60 FPS**: Smooth animations and interactions
- **Touch Responsiveness**: <16ms touch to visual feedback
- **Network Efficiency**: Minimize data usage on mobile networks
- **Battery Optimization**: Reduce GPS and background processing

## 🏗️ Frontend Optimization Strategies

### Code Splitting
```typescript
// Lazy load feature components
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Wrap with Suspense for loading states
<Suspense fallback={<Loading />}>
  <MapPage />
</Suspense>
```

### Bundle Optimization
- **Tree Shaking**: Remove unused code from dependencies
- **Dynamic Imports**: Load features on demand
- **Asset Optimization**: Compress images and use WebP format
- **CDN Usage**: Serve static assets from CDN

### Caching Strategy
```typescript
// SWR configuration for optimal caching
const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  refreshInterval: 0, // Disable automatic refresh
};
```

### Memory Management
- **Component Cleanup**: Remove event listeners and timers
- **Image Optimization**: Use appropriate image sizes
- **State Management**: Avoid storing large objects in state
- **List Virtualization**: Render only visible items in long lists

## 🗄️ Database Optimization

### Query Optimization
```sql
-- Use appropriate indexes for all queries
CREATE INDEX idx_places_location ON places USING GIST (location);
CREATE INDEX idx_cocktail_logs_user_created ON cocktail_logs (user_id, created_at);

-- Limit result sets
SELECT * FROM places_in_viewport(lat1, lat2, lng1, lng2, 100);
```

### Spatial Query Performance
- **Bounding Box First**: Use simple lat/lng bounds before complex spatial operations
- **Appropriate Radius**: Limit nearby queries to reasonable distances (5km max)
- **Result Limits**: Always include LIMIT clauses in spatial functions
- **Index Usage**: Ensure PostGIS GIST indexes are used

### Connection Management
- **Connection Pooling**: Reuse Supabase client instances
- **Query Batching**: Combine related queries when possible
- **Prepared Statements**: Use parameterized queries for security and performance

## 🌐 Network Optimization

### Data Fetching
```typescript
// Parallel data fetching
const [places, user, bookmarks] = await Promise.all([
  getPlaces(viewport),
  getUserProfile(),
  getBookmarks()
]);

// Request deduplication with SWR
const { data: places } = useSWR(cacheKey, fetcher);
```

### Request Optimization
- **Debouncing**: Debounce user input (300ms for search, map movement)
- **Request Deduplication**: Use SWR to prevent duplicate requests
- **Compression**: Enable gzip compression for API responses
- **HTTP/2**: Utilize HTTP/2 multiplexing for multiple requests

### Offline Strategy
- **Service Worker**: Cache critical resources for offline use
- **Background Sync**: Queue actions when offline, sync when online
- **Graceful Degradation**: Show cached data when network is unavailable

## 📱 Mobile-Specific Optimizations

### Touch Performance
```typescript
// Hardware acceleration for smooth animations
.map-marker {
  transform: translateZ(0);
  transition: transform 0.2s ease-out;
}

// Optimize touch events
const handleTouch = useMemo(() => 
  debounce(onTouch, 16), // 60fps
  [onTouch]
);
```

### Battery Conservation
- **GPS Optimization**: Use cached location for 5 minutes
- **Background Processing**: Minimize work when app is backgrounded
- **Network Efficiency**: Batch network requests
- **Animation Reduction**: Respect user's motion preferences

### Memory Management
- **Image Loading**: Lazy load images outside viewport
- **Component Unmounting**: Clean up resources when components unmount
- **Event Listeners**: Remove listeners to prevent memory leaks

## 🧪 Performance Monitoring

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: <2.5s
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1

### Custom Metrics
```typescript
// Performance tracking
const trackPerformance = (feature: string, duration: number) => {
  sendGAEvent('Performance', feature, Math.round(duration));
};

// Database query timing
const start = performance.now();
const result = await query();
trackPerformance('db_query', performance.now() - start);
```

### Monitoring Tools
- **Google Analytics**: User experience metrics
- **Lighthouse**: Automated performance audits
- **React DevTools Profiler**: Component performance analysis
- **Browser DevTools**: Network and memory profiling

## 🔧 Feature-Specific Guidelines

### Map Feature
- **Marker Clustering**: Group markers at low zoom levels
- **Viewport Loading**: Only load places in visible area
- **Tile Caching**: Cache map tiles for offline use
- **Smooth Transitions**: Hardware-accelerated marker animations

### Search Feature
- **Debounced Input**: Wait 300ms after user stops typing
- **Result Limiting**: Show maximum 50 results initially
- **Incremental Loading**: Load more results on scroll
- **Index Optimization**: Use full-text search indexes

### Social Features
- **Feed Pagination**: Load posts in batches of 20
- **Image Optimization**: Compress and resize user photos
- **Real-time Updates**: Use WebSocket connections efficiently
- **Background Sync**: Update feeds when app becomes active

---

*Performance guidelines for optimal user experience across all features*  
*Last Updated: January 13, 2025*
