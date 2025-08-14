# Places Data Ingestion Pipeline

## 🎯 Overview

Offline workflow for ingesting and updating place information in Supabase using Google Places API data. This pipeline supports batch processing of bar names and provides interactive confirmation before database updates.

## 📄 Documentation Index

### Core Documents
- **[Offline Data Ingestion](./offline-data-ingestion.md)** - Complete workflow overview and user guide
- **[Task Tracking](./task-tracking.md)** - Implementation progress tracking and checklist
- **[Technical Specification](./technical-specification.md)** - Technical requirements and implementation details
- **[CLI Confirmation Spec](./cli-confirmation-spec.md)** - Interactive confirmation system specification

## 🔄 Workflow Overview

```
Bar Names List → Google Places API → Data Validation → Supabase Upsert
     ↓              ↓              ↓           ↓
  Input File   Fetch Details   Confirm Data   Database Update
```

## 🛠️ Technical Architecture

### Technology Stack
- **Language**: Node.js/TypeScript (leverages existing project dependencies)
- **Google Places API**: Comprehensive place information including opening hours and contact details
- **Supabase**: Enhanced places table with rich metadata
- **Interactive CLI**: User confirmation workflows with detailed place review

### Project Location
- **Directory**: `scripts/places/` (to be created)
- **Environment**: Staging-first development approach
- **Reusability**: Can be re-run anytime with new place lists

## 🚀 Key Features

### ⭐ Interactive CLI Confirmation
- Review each place before database insertion
- Display comprehensive place details (address, phone, hours, etc.)
- Support for batch confirmation with summaries
- Dry-run mode for previewing changes

### 📊 Data Quality
- Comprehensive validation using Zod schemas
- Data completeness scoring
- Coordinate and contact information validation
- Conflict resolution for existing places

### 🔄 Batch Processing
- Rate-limited Google Places API integration (100 req/sec)
- Progress tracking with visual indicators
- Error recovery and resumability
- Detailed reporting and logging

## 💻 Usage Examples

```bash
# Interactive confirmation (recommended)
pnpm tsx scripts/places/ingest-places.ts --input places.json

# With staging environment and batch processing
pnpm tsx scripts/places/ingest-places.ts \
  --input hong-kong-bars.json \
  --environment staging \
  --region hongkong

# Dry run to preview changes
pnpm tsx scripts/places/ingest-places.ts \
  --input places.txt \
  --dry-run \
  --verbose
```

## 📋 Implementation Status

**Timeline**: 3 days implementation  
**Current Phase**: Planning and Documentation Complete  
**Next Steps**: Begin Phase 1 - Foundation & Setup

### Phase 1: Foundation & Setup (Day 1)
- [ ] Create `scripts/places/` directory structure
- [ ] Design enhanced places table schema
- [ ] Create TypeScript interfaces and validation schemas

### Phase 2: Core Services (Day 2)
- [ ] Implement Google Places Service
- [ ] Create Supabase Place Service
- [ ] Build data validation layer

### Phase 3: CLI & Processing (Day 3)
- [ ] Build main ingestion script
- [ ] Create interactive CLI confirmation system
- [ ] Add progress tracking and reporting

## 🔗 Related Projects

- **[Map Page Feature](../map-page/)** - User-facing map interface that displays the places

---

*Places Data Ingestion Pipeline Documentation*  
*Part of the Cocktail Compass App*  
*Last Updated: January 13, 2025*
