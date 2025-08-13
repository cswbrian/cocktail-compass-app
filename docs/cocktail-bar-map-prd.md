# Cocktail Bar Map - PRD

## 🎯 Vision
Interactive map for discovering cocktail places with region-based filtering and swipeable place details.

## 🔧 Core Features
- Interactive map with place markers
- Bottom sheet popover (<50% screen) with place details
- Swipeable navigation between places
- Region selection (auto-detect + manual)
- Integration with existing place detail data

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
- **UX**: Bottom sheet popover with swipeable place navigation (Day 2)
- **Geolocation**: PWA geolocation API implemented ✅
- **PostGIS**: Spatial functions for viewport and nearby queries ✅
- **Navigation**: Map added to bottom navigation ✅
- **Authentication**: Protected routes with RequireUsername ✅
- **Caching**: SWR integration for optimized data loading ✅
- **Migration**: Production-ready SQL migrations created ✅

## ✅ Day 2 Completed
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

## ❓ Future Considerations
- Search functionality scope
- Filters (venue type, activity level)
- Bookmark integration
- Activity indicators (visit/cocktail counts)
- Analytics tracking requirements
- Offline map caching

## 📈 Current Status
**Day 1**: ✅ **COMPLETED** - Foundation, geolocation, PostGIS, authentication, routing
**Day 2**: ✅ **COMPLETED** - Core features, enhanced UX, state management, internationalization
**Day 3**: 🔄 **NEXT** - PWA & UX features (region selector, "Near Me", search functionality)
**Day 4**: ⏳ Polish, testing, performance optimization, accessibility audit

## 🎨 Latest Design Improvements ✅ COMPLETED
- ✅ **Floating Bottom Sheet**: Modern design with rounded corners and margins
- ✅ **Dark Theme Integration**: Attribution control with dark background and white text
- ✅ **Glassmorphism Effects**: Backdrop blur and semi-transparent overlays throughout
- ✅ **Translation Support**: Full i18n integration with English/Chinese support
- ✅ **Smart Navigation**: Back button uses browser history, proper Link routing
- ✅ **Design System**: Consistent button variants and styling patterns
