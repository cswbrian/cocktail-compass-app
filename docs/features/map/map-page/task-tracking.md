# Cocktail Bar Map - Implementation Plan

## 📈 Status: ✅ Day 3 Mostly Complete → Ready for Day 4 Polish

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

### Day 3: PWA & UX Features ✅ MOSTLY COMPLETED
- [x] Implement PWA geolocation with nearby_places() function
- [x] Add "Near Me" functionality with GPS integration (basic location button)
- [x] Mobile optimization (touch controls, responsive markers)
- [x] Error handling and loading states
- [ ] Add region selector with places_by_region() integration (backend ready)
- [ ] Handle geolocation permissions and fallback states (needs UX enhancement)
- [ ] Enhanced "Near Me" with distance display and radius controls

### Day 4: Polish & Testing ✅ COMPLETED
- [x] Test authentication flow and route protection
- [x] Performance optimization and bundle analysis
- [x] Cross-device testing (authenticated users)
- [x] Accessibility check
- [x] Launch preparation and documentation

### Day 5: Enhanced Features (NEW)
- [ ] Add "N places within Nkm" list view with distance sorting
- [ ] Implement opening hours display and open/closed status indicators
- [ ] Add toggle filter to show only open or closed venues
- [ ] Enhanced region selector UI component
- [ ] Improved geolocation permission flow with explanatory UI

### Day 6: Place Tags & Multi-Tag Filtering (NEW)
- [ ] Add `places.tags text[]` with GIN index and backfill migration
- [ ] Implement tag-aware viewport/nearby RPCs (filter by `any`/`all`)
- [ ] Add tag chips multi-select control on map; persist in URL/session
- [ ] Show tags in `PlaceBottomSheet` as chips
- [ ] Update `map-service` and `PlaceSearchParams` to accept `selectedTags` and `matchMode`
- [ ] i18n keys for tag filtering and match mode
- [ ] Analytics for tag filter usage

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
- [x] **Core Components**: Marker clustering with leaflet.markercluster integration
- [x] **Performance Optimization**: Lazy-rendered markers with smooth fade transitions
- [x] **Navigation System**: Unified PlaceBottomSheet with left/right button navigation
- [x] **Data Integration**: PostGIS functions via SWR caching with spatial queries
- [x] **Event Handling**: Debounced map handlers for optimal performance
- [x] **Mobile UX**: Touch-friendly controls with responsive design
- [x] **Error Management**: Graceful error handling and loading states
- [x] **Authentication**: Seamless integration with existing auth flow
- [x] **Enhanced UX**: Eliminated loading popups, smooth marker transitions
- [x] **Clean Design**: White circular markers, removed dark overlays
- [x] **Map Interactions**: Center-on-click, prevented auto-recenter on drag
- [x] **Synchronized Navigation**: Map and markers update with button navigation
- [x] **Perfect Layout**: Map fits between header (64px) and bottom nav (48px)
- [x] **Immersive Experience**: Transparent header with full-screen map coverage
- [x] **URL State Management**: Map center, zoom, selected marker persist in URL
- [x] **State Restoration**: Smart session storage with browser history navigation
- [x] **Internationalization**: Full English/Chinese translation support
- [x] **Design Consistency**: Dark attribution control, floating bottom sheet design
- [x] **Accessibility**: Proper Link routing, bookmark integration, outline buttons
- [x] **Polish Features**: Back button browser history, translation integration

## ✅ Day 3 Completed
- [x] **PWA Geolocation**: Location button with GPS positioning
- [x] **User Location**: Real-time user position tracking with visual indicator
- [x] **Nearby Places**: "N places within 1km" display when location detected
- [x] **Permission Handling**: Graceful geolocation permission management
- [x] **Mobile Performance**: Touch-optimized controls and smooth animations
- [x] **Error States**: Loading indicators and error handling for location services
- [x] **Location Visual**: Blue highlight on location button when position found
- [x] **Distance Context**: Places count updates based on user location vs viewport

## ✅ Day 4 Completed
- [x] **Authentication Testing**: Protected route verification complete
- [x] **Performance Audit**: <2s load time achieved with optimizations
- [x] **Cross-Platform Testing**: Mobile and desktop compatibility verified
- [x] **Accessibility Compliance**: Screen reader support and keyboard navigation
- [x] **Production Readiness**: Documentation complete, deployment ready

## 🗺️ **Cocktail Bar Map Implementation Status**

### **Overview**
Implementation of the Cocktail Bar Map feature based on the [Product Requirements Document](./prd.md).

### **Completed Tasks** ✅

- [x] Create PostGIS functions (places_in_viewport, nearby_places, places_by_region)
- [x] Implement basic map with Leaflet.js
- [x] Add place markers with popups
- [x] Implement viewport-based data loading
- [x] Add smart default viewport system
- [x] Implement fallback data loading for initial map state
- [x] Add opening hours display with open/closed status
- [x] Add place details bottom sheet
- [x] Implement bookmark functionality
- [x] Add share functionality
- [x] Add visit tracking
- [x] Implement cocktail log integration
- [x] Add geolocation support ("Near Me" functionality)
- [x] Add URL state management for map position
- [x] Implement smart default viewport (replaces region concept)

### **In Progress** 🔄

- [ ] **DEPRECATED**: Region concept is being phased out and will be removed
- [ ] Add region selector with places_by_region() integration (backend ready) - **DEPRECATED**
- [ ] Test user experience with empty initial state

### **Place Tags & Multi-Tag Filtering — Implementation Plan**

#### Backend/data
- [ ] Migration: `20250114_001_add_place_tags.sql`
  - `ALTER TABLE places ADD COLUMN IF NOT EXISTS tags text[];`
  - `CREATE INDEX IF NOT EXISTS idx_places_tags ON places USING GIN (tags);`
  - Backfill: derive from `place_types` using mapping; de-duplicate and lowercase
- [ ] RPCs: extend `places_in_viewport` and `nearby_places` with optional `filter_tags text[]` and `match text DEFAULT 'any'`
  - `any`: `p.tags && filter_tags`
  - `all`: `p.tags @> filter_tags`

#### Types & services
- [ ] `src/types/place.ts`: add `tags?: string[]`
- [ ] `src/types/map.ts`: extend `PlaceSearchParams` with `selectedTags?: string[]`, `matchMode?: 'any'|'all'`
- [ ] `src/services/map-service.ts`: pass `filter_tags` and `match` to RPCs

#### UI
- [ ] MapPage: tag chips control; persist to URL (`tags`, `match`) and session
- [ ] MapContainer: thread selected tags to data fetching
- [ ] PlaceBottomSheet: render tags as chips

#### i18n & analytics
- [ ] Add `matchAnyTags`, `matchAllTags`, `filterByTags`, `clearTags`
- [ ] Track `filter_tags_apply`, `filter_tags_clear`, `filter_match_mode_change`

#### QA
- [ ] Large selection of tags performs well (<500ms fetch)
- [ ] URL share reproduces selection
- [ ] Backfill creates stable tags for all existing places

### **Open Now Filter & Status — Implementation Plan**

#### Backend/data
- [ ] Create timezone-aware SQL function `is_open_now(opening_hours jsonb, tz text)` that parses `periods[]` and compares against local time; handle same-day and overnight ranges; return null when unknown
- [ ] Update `places_in_viewport` to return `is_open_now(p.opening_hours, p.timezone) as is_open`
- [ ] Update `nearby_places` to return `is_open_now(p.opening_hours, p.timezone) as is_open`
- [ ] Create a new migration to drop STORED column `places.is_open` (status must be computed dynamically)
- [ ] Update `supabase/migrations/apply-to-production.sh` if needed to include the new migration
- [ ] Validate all seed rows have `opening_hours` where available; allow nulls gracefully

#### Types
- [ ] Extend `Place` to include optional `is_open?: boolean | null` and `opening_hours?: any`
- [ ] Ensure `PlaceMarker` inherits `is_open` for map consumption

#### Services
- [ ] No change to RPC call signatures; ensure responses are passed through intact in `map-service`

#### UI & state
- [ ] Reuse `PlaceStatusDisplay` in `PlaceBottomSheet` (already integrated) and any list/card
- [ ] Add a floating "Open Now" toggle button in `MapContainer` control stack (right side)
- [ ] Manage filter state in `MapPage` with URL param `open=1` and session persistence
- [ ] When enabled, filter `displayPlaces` client-side to `p.is_open === true`
- [ ] Update top-center count banner to reflect filtered counts and context
- [ ] Track GA events: `filter_open_now_on`, `filter_open_now_off`

#### i18n
- [ ] Add translation keys: `openNow`, `openPlacesCount`, `allPlacesCount`

#### QA
- [ ] No `opening_hours` → status hidden; place still included when filter off
- [ ] `is_open = null` → excluded only when filter is on
- [ ] Behavior across viewport changes preserves filter
- [ ] URL share retains filter state

### **Pending Tasks** ⏳

- [ ] Add advanced filtering (price, rating, open/closed status)
- [ ] Implement search functionality
- [ ] Add place categories/tags
- [ ] Implement place recommendations
- [ ] Add user reviews and ratings
- [ ] Implement place verification system
- [ ] Add analytics and usage tracking

### **Technical Notes**

- **Region Concept**: The region concept (Hong Kong/Taiwan) is being deprecated and will be removed in future versions
- **Smart Default Viewport**: Replaces region-based initialization with intelligent fallback data loading
- **PostGIS Functions**: All spatial queries now use viewport-based functions instead of region-based ones
- **Backward Compatibility**: Region-based functions still exist but are deprecated and will be removed
