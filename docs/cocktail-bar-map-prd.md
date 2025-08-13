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
- ✅ Bottom sheet popover implementation
- ✅ Swipeable place navigation carousel  
- ✅ Place marker clustering for performance
- ✅ Lazy loading optimization
- ✅ **Enhanced UX**: Smooth transitions, no loading popups
- ✅ **Unified Navigation**: Single bottom sheet with left/right buttons
- ✅ **Clean Design**: White circular markers, no dark overlay
- ✅ **Place Markers**: 🍹 emoji with white background circle
- ✅ **Synchronized Navigation**: Map centers and markers update with button navigation
- ✅ **Perfect Layout**: Map fits between header and bottom nav without overlap
- ✅ **Immersive Fullscreen**: Transparent header with backdrop blur for full coverage
- ✅ **Professional Polish**: Map occupies entire screen like modern map apps

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
**Day 1**: ✅ **COMPLETED** - Foundation, geolocation, PostGIS, authentication
**Day 2**: ✅ **COMPLETED** - Core map features, enhanced UX, unified navigation
**Day 3**: 🔄 **NEXT** - PWA & UX features (region selector, "Near Me")
**Day 4**: ⏳ Polish & testing
