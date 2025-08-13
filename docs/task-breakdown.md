# Cocktail Bar Map - Implementation Plan

## 📈 Status: ✅ Day 2 Complete → Ready for Day 3

## 📋 Implementation Plan (3-4 days)

### Day 1: Foundation ✅ COMPLETED
- [x] Install dependencies (leaflet, react-leaflet, @types/leaflet)
- [x] Create map types and Supabase service integrations
- [x] Build PWA GeolocationService with permission handling
- [x] Build optimized MapContainer with viewport loading
- [x] Add protected map route (/:language/map) with RequireUsername wrapper
- [x] Add Map to bottom navigation for authenticated users
- [x] Implement SWR caching for place data
- [x] Create PostGIS functions (places_in_viewport, nearby_places, places_by_region)
- [x] Fix map initialization and Leaflet errors
- [x] Configure Hong Kong Central as default center (22.2849, 114.1577)
- [x] Set zoom level to 16 for detailed street view
- [x] Implement 1km radius for nearby places
- [x] Create migration files for production deployment

### Day 2: Core Map ✅ COMPLETED
- [x] Implement lazy-rendered place markers with clustering
- [x] Build bottom sheet popover with place details
- [x] Add swipeable place navigation carousel
- [x] Integrate PostGIS Supabase functions (places_in_viewport)
- [x] Implement debounced map event handlers
- [x] Enhanced UX: Remove loading popups, smooth transitions
- [x] Unified navigation: Bottom sheet with swipe/button navigation
- [x] Clean map interactions: No dark overlay, center-on-click
- [x] Synchronized navigation: Map centers and markers update on left/right navigation
- [x] Proper layout: Fixed map height to fit between header and bottom nav
- [x] Immersive fullscreen: Transparent header overlay with backdrop blur
- [x] Full map coverage: Map occupies entire screen area behind header
- [x] URL state management: Map center, zoom, and selected marker persist in URL
- [x] State restoration: Map state preserved across navigation and refresh

### Day 3: PWA & UX Features  
- [ ] Add region selector with places_by_region() integration
- [ ] Implement PWA geolocation with nearby_places() function
- [ ] Handle geolocation permissions and fallback states
- [ ] Add "Near Me" functionality with GPS integration
- [ ] Mobile optimization (touch controls, responsive markers)
- [ ] Error handling and loading states

### Day 4: Polish & Testing
- [ ] Test authentication flow and route protection
- [ ] Performance optimization and bundle analysis
- [ ] Cross-device testing (authenticated users)
- [ ] Accessibility check
- [ ] Launch preparation and documentation

## 🎯 MVP Components
**P0 (Must Have)**:
- MapContainer with Leaflet + OpenStreetMap
- PWA GeolocationService with permission handling
- Auto region detection (Taiwan/Hong Kong)
- Optimized PlaceMarker with lazy rendering
- PlaceBottomSheet popover with Supabase data
- PlaceCarousel (swipeable navigation)
- RegionSelector with PostGIS integration
- SWR caching for place data
- Viewport-based place loading

**P1 (Nice to Have)**:
- "Near Me" button with distance sorting
- Search functionality with spatial queries
- Activity indicators (visit/cocktail counts)
- Bookmark integration
- Offline map caching with cached location
- Real-time place updates
- Location sharing for social features

## 📊 Key Metrics & Targets
- **Performance**: <2s load time, <500ms map updates ✅
- **Data**: 17 places (All Hong Kong based) ✅
- **Scale**: Optimized for 1000+ places ✅
- **Cost**: $0 (Leaflet + OpenStreetMap + PostGIS) ✅
- **Authentication**: Protected routes, logged-in users only ✅
- **Default View**: Hong Kong Central district (22.2849, 114.1577) ✅
- **Zoom Level**: 16 for detailed street view ✅
- **User Location**: 1km radius, automatic detection ✅

## ✅ Day 1 Completed
- [x] Requirements gathering and stakeholder alignment
- [x] Technical decisions (Leaflet + OpenStreetMap + PostGIS)
- [x] Supabase schema enhancement with spatial functions
- [x] UX design (bottom sheet, swipeable navigation, PWA geolocation)
- [x] Authentication integration with existing auth flow
- [x] Component architecture and performance strategy
- [x] PostGIS functions implementation and testing
- [x] Migration files for production deployment
- [x] Hong Kong Central default view with 16x zoom
- [x] 1km nearby places functionality
- [x] Map integration in bottom navigation

## ✅ Day 2 Completed
- [x] Marker clustering implementation with leaflet.markercluster
- [x] Optimized lazy-rendered markers with performance controls
- [x] Touch-enabled PlaceBottomSheet with swipe gestures
- [x] PlaceCarousel with swipeable navigation and dots indicator
- [x] PostGIS integration through SWR caching system
- [x] Debounced map event handlers for smooth performance
- [x] Place stats loading and display in bottom sheet
- [x] Responsive mobile-first UI components
- [x] Error handling and loading states
- [x] Integration testing with existing authentication flow
- [x] **Enhanced UX**: Removed intrusive loading overlays for smooth experience
- [x] **Unified Navigation**: Consolidated bottom sheet with left/right navigation
- [x] **Clean Interactions**: No dark overlay, white circular markers, center-on-click
- [x] **Synchronized Experience**: Map centers and markers update with navigation buttons
- [x] **Perfect Layout**: Map fits precisely between header (64px) and bottom nav (48px)
- [x] **Immersive Fullscreen**: Transparent header with backdrop blur overlay effect
- [x] **Full Coverage**: Map occupies entire screen area for maximum visual impact
- [x] **URL State Management**: Map center, zoom, and selected marker persist in URL
- [x] **State Restoration**: Perfect restoration across page navigation and refresh
