# Task Tracking - Places Data Ingestion Pipeline

## 🎯 Project Overview

**Goal**: Build an offline workflow for ingesting and updating place information in Supabase using Google Places API data.

**Timeline**: 3 days implementation  
**Environment**: Staging (primary), Production (secondary)  
**Key Feature**: Interactive CLI confirmation for place details before database upsert

## 📋 Implementation Phases

### Phase 1: Foundation & Setup (Day 1)

#### 1.1 Project Structure & Configuration
- [x] **Create `scripts/places/` directory structure**
- [x] **Initialize TypeScript configuration and package.json**
- [x] **Setup environment configuration (staging/production switching)**
- [x] **Configure Google Places API key and Supabase connection**

#### 1.2 Database Schema Enhancement
- [x] **Design enhanced places table schema**
  - Contact info: phone, website, formatted_address
  - Ratings: rating, user_ratings_total, price_level
  - Features: accessibility, services, amenities
  - Business hours and timezone support
  - Metadata tracking fields
- [x] **Create migration files with indexes and constraints**
- [x] **Test schema changes in staging environment**

#### 1.3 Type Definitions & Validation
- [x] **Extend src/types/place.ts with comprehensive interfaces**
  - Enhanced Place interface with Google Places API fields
  - GooglePlaceDetails, UpsertResult, BatchUpsertResult types
  - CLI interaction types
- [ ] **Implement Zod validation schemas**
  - Input validation, API response validation, database operations

**Expected Output**: Complete foundation ready for development

### Phase 2: Core Services (Day 2)

#### 2.1 Google Places Service
- [x] **Create GooglePlacesService class**
  - Place search by text query
  - Place details fetching by place_id
  - API response parsing and mapping
- [x] **Add rate limiting and retry logic**
  - Sliding window rate limiter (100 req/sec)
  - Exponential backoff for retries
  - API error handling and usage logging

#### 2.2 Supabase Place Service
- [x] **Create SupabasePlaceService class**
  - Individual and batch upsert operations
  - Duplicate detection by place_id
  - Conflict resolution strategies
- [x] **Add audit trail and metadata tracking**
  - Creation/update timestamps
  - Data source attribution
  - Verification status tracking

#### 2.3 Manual Tags Support (NEW)
- [ ] Update `scripts/places/src/types/types.ts` `PlaceInput` to accept `tags?: string[]`
- [ ] Update JSON input parsing in `readInputFile` to pass through `item.tags`
- [ ] Display manual tags in CLI preview (e.g., `Tags: speakeasy, rooftop`)

#### 2.4 Data Validation Layer
- [ ] **Implement comprehensive validation**
  - Coordinate boundaries and format validation
  - Phone numbers and website URL validation
  - Data completeness scoring
  - Opening hours format validation

**Expected Output**: Complete service layer with robust data handling

### Phase 3: CLI Interface & Processing (Day 3)

#### 3.1 Main Ingestion Script
- [x] **Implement ingest-places.ts with command-line parsing**
  - Support JSON and TXT input formats
  - Batch processing logic
  - Dry-run functionality
- [x] **File input processing**
  - Multiple format support (JSON array, line-separated text)
  - Large file handling
  - Clear error messages for invalid input

#### 3.2 Interactive CLI Confirmation System ⭐
- [x] **Create interactive place review CLI**
  - Display place details in readable format
  - Show insert vs. update actions
  - Individual place confirmation (y/N)
  - Batch confirmation with summary

**Place Details Display Format:**
```
📍 New Place: The Old Man
• Address: 2/F, 32 Aberdeen St, Central, Hong Kong
• Phone: +852 2234 5678 | Website: https://theoldman.hk
• Rating: 4.5/5 (120 reviews) | Price: $$$
• Hours: Mon-Sun 5PM-2AM | Features: Cocktails, Outdoor Seating
• Data Completeness: 95%

Confirm insert? (y/N/s=show more/q=quit): 
```

#### 3.3 Progress Tracking & Reporting
- [ ] **Implement progress indicators and logging**
  - Real-time progress bar with ETA
  - Structured JSON logs for debugging
  - API usage and performance tracking
- [ ] **Generate comprehensive reports**
  - Processing summary with success rates
  - Data quality analysis
  - Performance metrics

#### 3.4 Testing & Validation
- [ ] **Test with sample Hong Kong place data**
- [ ] **Integration testing (Google Places API + Supabase)**
- [ ] **CLI confirmation flow validation**
- [ ] **Performance testing with larger datasets**

### Phase 4: Manual Tags in Ingestion (NEW)

#### 4.1 Database Migration
- [ ] Add `tags text[]` to `places` and `idx_places_tags` (GIN)
- [ ] (Optional) One-time backfill not required; tags are manual

#### 4.2 Ingestion Pipeline
- [ ] Accept manual `tags` from input JSON (`my-bars.json`)
- [ ] Pass `tags` into upsert payload so they persist to `places.tags`
- [ ] Ensure both insert and update flows carry `tags`

#### 4.3 CLI Confirmation
- [ ] Show `Tags: ...` in both summary and details views

#### 4.4 Tests
- [ ] Schema test: `tags` column exists; GIN index present
- [ ] Ingestion test: input `tags` persist to database on insert/update

**Expected Output**: Production-ready CLI tool with comprehensive features

**✅ Phase 3.1 Completed**: Main ingestion script implemented with:
- Command-line argument parsing (all options from specification)
- JSON and TXT file format support
- Batch processing with configurable sizes and delays
- Dry-run functionality for safe testing
- Progress tracking with ETA calculations
- Comprehensive error handling and reporting
- Sample files and documentation included

**✅ Phase 3.2 Completed**: Interactive CLI confirmation system implemented with:
- Beautiful place details display with emojis and formatting
- Data completeness scoring (0-100%)
- Individual place confirmation (y/N/s=show more/q=quit)
- Batch confirmation with summary and action icons
- Detailed place information display
- Opening hours, ratings, contact info, and place types
- Graceful exit and user control options

## 📊 File Structure & Usage

### Directory Structure
```
scripts/places/
├── ingest-places.ts              # Main CLI script
├── config.ts                     # Environment configuration
├── google-places-service.ts      # Google Places API wrapper
├── supabase-place-service.ts     # Supabase operations
├── validation.ts                 # Data validation logic
├── cli-confirmation.ts           # Interactive confirmation
├── progress-tracker.ts           # Progress tracking
├── rate-limiter.ts               # API rate limiting
├── utils.ts                      # Utility functions
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

### Command Line Usage
```bash
# Basic usage with interactive confirmation
pnpm tsx scripts/places/ingest-places.ts --input places.json

# Staging environment with batch processing
pnpm tsx scripts/places/ingest-places.ts \
  --input hong-kong-bars.json \
  --environment staging \
  --region hongkong

# Dry run to preview changes
pnpm tsx scripts/places/ingest-places.ts \
  --input places.txt \
  --dry-run \
  --verbose

# Advanced options
pnpm tsx scripts/places/ingest-places.ts \
  --input large-dataset.json \
  --batch-size 5 \
  --delay 2000 \
  --update-existing \
  --output report.json
```

### CLI Options
```
-i, --input <file>           Input file (JSON or TXT format)
-e, --environment <env>      Supabase environment (staging/production)
-r, --region <region>        Default region (hongkong/taiwan)
-b, --batch-size <number>    Process places in batches (default: 10)
-d, --delay <ms>             Delay between API calls (default: 1000ms)
--confirm                    Skip individual confirmations
--dry-run                    Preview changes without database updates
--update-existing            Update existing places (default: skip)
--verbose                    Enable detailed logging
--output <file>              Save report to file
--help                       Show help information
```

## 🎯 Success Criteria

### Technical Metrics
- [ ] **Processing Performance**: <2 seconds per place
- [ ] **Success Rate**: >95% successful upserts
- [ ] **API Efficiency**: Respects 100 requests/second limit
- [ ] **Error Rate**: <5% failed operations

### User Experience
- [ ] **CLI Usability**: Clear, intuitive confirmation flow
- [ ] **Data Quality**: >90% places have complete information
- [ ] **Error Handling**: Graceful failures with helpful messages
- [ ] **Documentation**: Complete usage guide and examples

### Operational
- [ ] **Environment Safety**: Staging-first development
- [ ] **Reusability**: Can be re-run with new place lists
- [ ] **Audit Trail**: Complete record of all operations
- [ ] **Maintenance**: <1 hour per week operational overhead

## 🚨 Risk Mitigation

### Technical Risks
- [ ] **Google API Changes**: Monitor documentation updates
- [ ] **Rate Limiting**: Robust retry and backoff strategies
- [ ] **Data Quality**: Comprehensive validation checks
- [ ] **Schema Changes**: Backward-compatible migrations

### Operational Risks
- [ ] **Environment Confusion**: Clear staging/production separation
- [ ] **Data Loss**: Backup and rollback capabilities
- [ ] **User Errors**: Interactive confirmation and dry-run options
- [ ] **API Costs**: Monitor Google Places API usage

## 🔧 Implementation Details

### Enhanced Places Table Schema
```sql
-- Migration: 20250113_001_enhance_places_table.sql
ALTER TABLE places ADD COLUMN IF NOT EXISTS:
  -- Contact Information
  phone_number text,
  website text,
  formatted_address text,
  
  -- Ratings & Reviews
  rating numeric(3,2) CHECK (rating >= 0 AND rating <= 5),
  user_ratings_total integer CHECK (user_ratings_total >= 0),
  price_level integer CHECK (price_level >= 0 AND price_level <= 4),
  
  -- Categories & Features
  place_types text[],
  wheelchair_accessible_entrance boolean DEFAULT false,
  delivery boolean DEFAULT false,
  dine_in boolean DEFAULT true,
  takeout boolean DEFAULT false,
  outdoor_seating boolean DEFAULT false,
  live_music boolean DEFAULT false,
  happy_hour boolean DEFAULT false,
  
  -- Business Hours
  opening_hours jsonb,
  timezone text DEFAULT 'Asia/Hong_Kong',
  
  -- Metadata
  last_updated timestamptz DEFAULT now(),
  data_source text DEFAULT 'google_places',
  is_verified boolean DEFAULT false;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_places_rating ON places (rating);
CREATE INDEX IF NOT EXISTS idx_places_place_types ON places USING GIN (place_types);
CREATE INDEX IF NOT EXISTS idx_places_last_updated ON places (last_updated);
```

### Rate Limiting Strategy
```typescript
class GooglePlacesRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100;  // Google's limit per second
  private readonly windowMs = 1000;    // 1 second sliding window
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

---

*Task Tracking - Places Data Ingestion Pipeline*  
*Part of Cocktail Compass App*  
*Last Updated: January 13, 2025*
