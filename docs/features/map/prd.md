# Cocktail Bar Map - PRD

## 🎯 Vision
Interactive map for discovering cocktail places with region-based filtering and swipeable place details.

## 🔧 Core Features
- Interactive map with place markers
- Bottom sheet popover (<50% screen) with place details
- Swipeable navigation between places
- Region selection (auto-detect + manual)
- Integration with existing place detail data
- **List view for nearby places with distance sorting**
- **Opening hours display with open/closed status indicators**
- **Toggle filter for open/closed venues only**

## 🛠 Technical Requirements
- **Performance**: <2s load time
- **Cost**: $0 (Leaflet + OpenStreetMap)
- **Scale**: Handle 1000+ places
- **Mobile**: Mobile-first responsive design

## ✅ Confirmed Decisions
- **Data**: 17 places in Supabase (Hong Kong focused) with lat/lng ✅
- **Map**: Leaflet + OpenStreetMap (free) ✅
- **Default View**: Hong Kong Central district (22.2849, 114.1577) at zoom 16 ✅
- **User Location**: 1km radius nearby places with automatic detection ✅
- **UX**: Bottom sheet popover with swipeable place navigation ✅
- **Geolocation**: PWA geolocation API implemented ✅
- **PostGIS**: Spatial functions for viewport and nearby queries ✅
- **Navigation**: Map added to bottom navigation ✅
- **Authentication**: Protected routes with RequireUsername ✅
- **Caching**: SWR integration for optimized data loading ✅
- **Migration**: Production-ready SQL migrations created ✅
- **Opening Hours**: Business hours display with real-time status 🆕
- **List View**: Distance-sorted place cards view 🆕
- **Filter Toggle**: Show only open or closed venues 🆕

## ✅ Day 2-4 Completed
- ✅ **Core Components**: Bottom sheet popover + unified navigation system
- ✅ **Performance**: Place marker clustering + lazy loading optimization
- ✅ **Enhanced UX**: Smooth marker transitions, eliminated loading popups
- ✅ **Navigation System**: Consolidated bottom sheet with left/right button navigation
- ✅ **Visual Design**: White circular markers (🍹 emoji), removed dark overlays
- ✅ **Map Interactions**: Center-on-click, remove Leaflet popups, prevent auto-recenter on drag
- ✅ **Synchronized Experience**: Map centers and markers update with navigation buttons
- ✅ **Perfect Layout**: Map fits precisely between header (64px) and bottom nav (48px)
- ✅ **Immersive Fullscreen**: Transparent header with backdrop blur + glassmorphism
- ✅ **Professional Polish**: Full-screen map coverage like modern map applications
- ✅ **URL State Management**: Map center, zoom, selected marker persist across navigation
- ✅ **State Restoration**: Smart session storage + browser history preservation
- ✅ **Internationalization**: Full translation support (English/Chinese)
- ✅ **Design Consistency**: Dark attribution control, floating bottom sheet design
- ✅ **Accessibility**: Proper routing, bookmark integration, outline button variants
- ✅ **PWA Geolocation**: Location button with real-time user positioning
- ✅ **Nearby Places**: Distance-based place detection and display
- ✅ **Production Ready**: Authentication, performance, cross-platform testing complete

## 🎨 Design Decisions
### Place Markers Strategy
**Phase 1 (MVP)**: 🍹 Emoji markers
- ✅ Simple implementation, zero assets
- ✅ Theme-appropriate cocktail glass
- ✅ Fast rendering, cross-platform

**Phase 2 (Polish)**: Custom SVG markers  
- 🎯 Better visual states (selected/unselected)
- 🎯 Consistent cross-platform appearance
- 🎯 Professional branding alignment

## 🆕 Day 5 Enhanced Features

### List View for Nearby Places 🆕
- **"N places within Nkm" button**: Click to switch to list view
- **Distance sorting**: Places ordered from nearest to furthest
- **Card layout**: Consistent with existing place cards
- **Distance display**: Show exact distance in meters/kilometers
- **Quick access**: Easy toggle between map and list views

### Opening Hours Integration 🆕
- **Business hours display**: Show operating hours for each venue
- **Real-time status**: "Open" / "Closed" indicators
- **Current time awareness**: Automatically update status
- **Visual indicators**: Color-coded status (green=open, red=closed)
- **Timezone handling**: Proper local time calculations

### Open/Closed Filter Toggle 🆕
- **Filter controls**: Toggle buttons for "Show Open Only" / "Show Closed Only"
- **Real-time filtering**: Immediately update map markers and list
- **Clear indicators**: Visual distinction between open/closed venues
- **Persistent state**: Remember filter preferences across sessions
- **Smart defaults**: Default to "Show Open Only" during business hours

## ❓ Future Considerations
- Search functionality scope
- Advanced filters (venue type, activity level, price range)
- Bookmark integration enhancement
- Activity indicators (visit/cocktail counts)
- Analytics tracking requirements
- Offline map caching
- Social features (reviews, photos)
- Reservation integration

## 📈 Current Status
**Day 1**: ✅ **COMPLETED** - Foundation, geolocation, PostGIS, authentication, routing
**Day 2**: ✅ **COMPLETED** - Core features, enhanced UX, state management, internationalization
**Day 3**: ✅ **COMPLETED** - PWA geolocation, user positioning, nearby places display
**Day 4**: ✅ **COMPLETED** - Polish, testing, performance optimization, accessibility audit
**Day 5**: 🔄 **NEXT** - Enhanced features (list view, opening hours, filter toggles)

## 🎨 Latest Design Improvements ✅ COMPLETED
- ✅ **Floating Bottom Sheet**: Modern design with rounded corners and margins
- ✅ **Dark Theme Integration**: Attribution control with dark background and white text
- ✅ **Glassmorphism Effects**: Backdrop blur and semi-transparent overlays throughout
- ✅ **Translation Support**: Full i18n integration with English/Chinese support
- ✅ **Smart Navigation**: Back button uses browser history, proper Link routing
- ✅ **Design System**: Consistent button variants and styling patterns
- ✅ **Location Integration**: Blue-highlighted location button with position tracking
- ✅ **Context Awareness**: Dynamic place count display (viewport vs nearby)
- ✅ **Production Polish**: Cross-platform testing and accessibility compliance

## 🎨 Day 5 Design Specifications

### List View Design
- **Toggle Button**: Floating action button with list/map icon toggle
- **Card Layout**: Consistent with existing PlaceCard components
- **Distance Badge**: Prominent distance display with appropriate units
- **Sorting Indicator**: Clear "Sorted by distance" header
- **Smooth Transitions**: Animated transitions between map and list views

### Opening Hours Design
- **Status Badge**: Small colored indicator (🟢 Open / 🔴 Closed)
- **Hours Display**: "Mon-Fri 5PM-12AM, Sat-Sun 3PM-1AM" format
- **Current Time**: Highlight current day/time period
- **Compact Layout**: Minimal space usage in place cards
- **Responsive**: Adapt to mobile and desktop layouts

### Filter Toggle Design
- **Control Bar**: Floating control bar with toggle buttons
- **Visual States**: Active/inactive states with clear indicators
- **Quick Access**: Easily accessible but not intrusive
- **Status Display**: Show filter count "5 open venues" / "12 closed venues"
- **Clear All**: Quick option to remove all filters
