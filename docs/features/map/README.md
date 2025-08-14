# Map Feature Documentation Hub

## 🗺️ Overview

This directory contains documentation for two related but separate projects within the Cocktail Compass app's map functionality:

1. **Map Page Feature** - The user-facing interactive map interface
2. **Places Data Ingestion Pipeline** - Offline tools for managing place data

## 📁 Project Structure

### 🗺️ [Map Page Feature](./map-page/)
**Interactive map for discovering cocktail places**

The user-facing map page with region-based filtering, swipeable place details, and real-time geolocation features.

- **Status**: ✅ Production Ready (Day 4 Complete)
- **Technology**: Leaflet + OpenStreetMap + Supabase PostGIS
- **Features**: Interactive markers, geolocation, place details, URL state management

[📖 View Map Page Documentation →](./map-page/)

---

### 🔄 [Places Data Ingestion Pipeline](./data-ingestion/)
**Offline workflow for managing place data**

Command-line tools for ingesting and updating place information from Google Places API with interactive confirmation workflows.

- **Status**: 📋 Planning Complete → Ready for Implementation
- **Technology**: Node.js/TypeScript + Google Places API + Supabase
- **Features**: Interactive CLI, batch processing, data validation, rate limiting

[📖 View Data Ingestion Documentation →](./data-ingestion/)

---

## 🔗 Relationship Between Projects

```
┌─────────────────────┐    ┌─────────────────────┐
│  Data Ingestion     │    │     Map Page        │
│     Pipeline        │───▶│     Feature         │
│                     │    │                     │
│ • Google Places API │    │ • Leaflet Maps      │
│ • CLI Tools         │    │ • Place Display     │
│ • Data Validation   │    │ • User Interface    │
└─────────────────────┘    └─────────────────────┘
           │                          │
           ▼                          ▼
    ┌────────────────────────────────────┐
    │        Supabase Database           │
    │         (places table)             │
    └────────────────────────────────────┘
```

The **Data Ingestion Pipeline** populates and maintains the place data that the **Map Page Feature** displays to users.

## 🚀 Getting Started

### For Map Page Development
If you're working on the user-facing map interface:
→ **[Start with Map Page Documentation](./map-page/)**

### For Place Data Management
If you need to add/update place information:
→ **[Start with Data Ingestion Documentation](./data-ingestion/)**

## 📊 Combined Metrics

- **Places Supported**: 1000+ (with clustering)
- **Data Sources**: Google Places API + manual curation
- **Performance**: <2s map load time, <2s per place ingestion
- **Cost**: $0 (free map tiles + Google Places API within limits)

---

*Map Feature Documentation Hub*  
*Part of the Cocktail Compass App*  
*Last Updated: January 13, 2025*