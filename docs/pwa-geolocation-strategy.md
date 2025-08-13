# PWA Geolocation Strategy for Cocktail Bar Map

## 🎯 PWA Geolocation Requirements

### Core Functionality
- **Auto Region Detection**: Determine user's region (Taiwan/Hong Kong) on app load
- **"Near Me" Feature**: Find closest cocktail places using PostGIS `nearby_places()`
- **Permission Management**: Handle geolocation permissions gracefully
- **Fallback Strategy**: Manual region selection if location denied

## 🔧 Implementation Strategy

### 1. Geolocation Service Architecture
```typescript
interface GeolocationService {
  getCurrentPosition(): Promise<GeolocationPosition | null>
  watchPosition(): void
  detectRegion(lat: number, lng: number): 'Taiwan' | 'Hong Kong' | 'Other'
  requestPermission(): Promise<PermissionState>
  hasPermission(): boolean
}
```

### 2. PWA-Specific Considerations
- **Service Worker**: Cache location permissions status
- **Background Updates**: Update location when app becomes active
- **Battery Optimization**: Reduce GPS polling frequency
- **Offline Handling**: Use cached location when offline

### 3. Permission Flow
```
App Launch
    ↓
Check Geolocation Permission
    ↓
[Granted] → Get Location → Detect Region → Load Places
    ↓
[Denied] → Show Region Selector → Manual Selection
    ↓
[Prompt] → Request Permission → Handle Response
```

## 📱 User Experience Flow

### Initial App Load
1. **Check Permission**: Verify geolocation permission status
2. **Auto-Detect**: If granted, get user location
3. **Region Classification**: Determine Taiwan/Hong Kong/Other
4. **Load Places**: Call `places_by_region()` for detected region
5. **Center Map**: Focus map on user's region

### "Near Me" Feature
1. **Permission Check**: Ensure location access
2. **Get Current Location**: Fresh GPS coordinates
3. **Supabase Query**: Call `nearby_places(lat, lng, radius)`
4. **Display Results**: Show sorted by distance
5. **Map Update**: Center on user location with nearby places

### Permission Denied Flow
1. **Show Region Selector**: Manual Taiwan/Hong Kong choice
2. **Explain Benefits**: "Allow location for nearby places"
3. **Retry Option**: "Enable location services" button
4. **Fallback**: Continue with manual region selection

## ⚡ Performance Optimizations

### Efficient Location Usage
- **Cache Location**: Store last known position (5 min expiry)
- **Debounce Requests**: Prevent excessive GPS calls
- **Smart Updates**: Only refresh when user moves significantly
- **Background Handling**: Pause location updates when app backgrounded

### Battery Conservation
```typescript
const geolocationOptions = {
  enableHighAccuracy: false,    // Use network location when possible
  timeout: 10000,              // 10 second timeout
  maximumAge: 300000          // Use cached location up to 5 minutes
};
```

### Network Efficiency
- **Regional Caching**: Cache places by region for offline use
- **Predictive Loading**: Preload nearby regions based on location
- **Smart Queries**: Use appropriate radius based on place density

## 🔒 Privacy & Security

### Permission Handling
- **Clear Explanation**: "Find nearby cocktail bars and places"
- **Optional Feature**: App works without location access
- **User Control**: Easy way to disable location sharing
- **Data Minimization**: Only store region, not exact coordinates

### Data Security
- **No Persistent Storage**: Don't save user coordinates
- **Encrypted Transit**: HTTPS for all location API calls
- **Regional Only**: Store only region classification
- **User Transparency**: Clear privacy policy

## 🌐 Cross-Platform Compatibility

### Browser Support
- **Modern Browsers**: Native Geolocation API
- **iOS Safari**: PWA geolocation support
- **Android Chrome**: Full PWA location features
- **Desktop**: Optional location for map centering

### Fallback Strategies
```typescript
// Progressive enhancement approach
if (navigator.geolocation) {
  // Use native geolocation
} else if (isIOSPWA()) {
  // iOS PWA specific handling
} else {
  // IP-based region detection (fallback)
}
```

## 📊 Integration with PostGIS Functions

### Region Detection Integration
```typescript
function detectRegion(lat: number, lng: number): string {
  // Taiwan coordinates: 22-25.3°N, 120-122°E
  if (lat >= 21.9 && lat <= 25.3 && lng >= 120.0 && lng <= 122.0) {
    return 'Taiwan';
  }
  // Hong Kong coordinates: 22-22.6°N, 113.8-114.5°E  
  if (lat >= 22.0 && lat <= 22.6 && lng >= 113.8 && lng <= 114.5) {
    return 'Hong Kong';
  }
  return 'Other';
}
```

### Nearby Places Integration
```typescript
const { data: nearbyPlaces } = useSWR(
  userLocation ? ['nearby-places', userLocation.lat, userLocation.lng] : null,
  () => supabase.rpc('nearby_places', {
    user_lat: userLocation.lat,
    user_lng: userLocation.lng,
    max_distance_meters: 10000 // 10km radius
  })
);
```

## 🧪 Testing Strategy

### Location Simulation
- **Development**: Mock GPS coordinates for testing
- **Staging**: Test with real devices in Taiwan/Hong Kong
- **CI/CD**: Automated tests with simulated locations

### Permission Testing
- **Granted State**: Test full functionality
- **Denied State**: Verify fallback behavior
- **Prompt State**: Test permission request flow
- **Revoked State**: Handle permission changes

### Performance Testing
- **GPS Accuracy**: Test with different accuracy settings
- **Battery Impact**: Monitor power consumption
- **Network Usage**: Measure data usage for location features
- **Offline Behavior**: Test cached location scenarios

---
*Optimized for PWA performance, user privacy, and seamless experience*
