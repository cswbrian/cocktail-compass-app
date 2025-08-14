# Offline Data Ingestion Flow - Place Management

## 🎯 Overview

Offline workflow for ingesting and updating place information in the Supabase `places` table using Google Places API data. This pipeline supports batch processing of bar names and can be re-run anytime with new data.

## 🔄 Workflow Overview

```
Bar Names List → Google Places API → Data Validation → Supabase Upsert
     ↓              ↓              ↓           ↓
  Input File   Fetch Details   Confirm Data   Database Update
```

## 🛠 Technical Architecture

### Technology Stack
- **Language**: **Node.js/TypeScript** (recommended)
  - Leverages existing project dependencies (`@supabase/supabase-js`, `tsx`)
  - Consistent with existing scripts (`fetch-cocktails.ts`, `generate-summary.ts`)
  - Easy environment variable management
  - Type safety for Google Places API responses

### Alternative Options
- **Python**: Good for data processing but requires additional setup
- **Shell**: Limited data manipulation capabilities
- **Node.js**: ✅ **RECOMMENDED** - Best fit for project

### Project Location
- **Directory**: `scripts/places/` (new subdirectory)
- **Files**: 
  - `ingest-places.ts` - Main ingestion script
  - `google-places-service.ts` - Google Places API wrapper
  - `supabase-place-service.ts` - Supabase operations
  - `config.ts` - Environment configuration
- **Shared Types**: Uses `src/types/place.ts` for all Place interfaces and data ingestion types

## 📊 Data Flow

### 1. Input Processing
- **Format**: JSON array of bar names or text file with one name per line
- **Example**:
```json
[
  "The Old Man",
  "Quinary",
  "COA",
  "Penicillin"
]
```

### 2. Google Places API Integration
- **Endpoint**: `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
- **Current Fields**: `name`, `place_id`, `lat`, `lng`, `main_text`, `secondary_text`
- **Additional Fields Needed**:
  - `opening_hours` - Business hours and schedule
  - `formatted_phone_number` - Contact information
  - `website` - Official website URL
  - `rating` - Google rating
  - `user_ratings_total` - Number of reviews
  - `price_level` - Price range indicator
  - `types` - Place categories (bar, restaurant, etc.)

### 3. Data Validation & Confirmation
- **Duplicate Detection**: Check existing `place_id` in Supabase
- **Data Quality**: Validate coordinates, required fields
- **Manual Review**: Interactive confirmation before upsert
- **Conflict Resolution**: Handle updates vs. new records

### 4. Supabase Upsert
- **Table**: `places` table with enhanced schema
- **Strategy**: Upsert by `place_id` (Google's unique identifier)
- **Fields**: All Google Places data + computed fields
- **Audit**: Track creation/update timestamps

## 🗄 Database Schema Updates

### Enhanced Places Table
```sql
-- Add new fields for comprehensive place information
ALTER TABLE places ADD COLUMN IF NOT EXISTS:
  phone_number text,
  website text,
  rating numeric(3,2),
  user_ratings_total integer,
  price_level integer,
  place_types text[],
  formatted_address text,
  international_phone_number text,
  url text, -- Google Maps URL
  utc_offset_minutes integer,

  last_updated timestamptz DEFAULT now()
```

### Indexes for Performance
```sql
-- Add indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_places_rating ON places (rating);
CREATE INDEX IF NOT EXISTS idx_places_price_level ON places (price_level);
CREATE INDEX IF NOT EXISTS idx_places_place_types ON places USING GIN (place_types);
CREATE INDEX IF NOT EXISTS idx_places_last_updated ON places (last_updated);
```

## 🔧 Implementation Details

### Environment Configuration
```typescript
// config.ts
export const config = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    environment: process.env.SUPABASE_ENV || 'staging'
  },
  google: {
    apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  },
  venues: {
    batchSize: 10, // Process venues in batches
    delayMs: 1000, // Delay between API calls to respect rate limits
    maxRetries: 3
  }
}
```

### Google Places Service
```typescript
// google-places-service.ts
export class GooglePlacesService {
  private client: google.maps.places.PlacesService;
  
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    // Fetch comprehensive place information
    // Handle rate limiting and retries
    // Return structured data matching our schema
  }
  
  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    // Search for places by name
    // Return candidates for manual selection
  }
}
```

### Supabase Place Service
```typescript
// supabase-place-service.ts
export class SupabasePlaceService {
  async upsertPlace(place: PlaceData): Promise<UpsertResult> {
    // Check for existing place_id
    // Insert new or update existing
    // Handle conflicts and validation
  }
  
  async getExistingPlaces(placeIds: string[]): Promise<ExistingPlace[]> {
    // Fetch existing places to detect duplicates
  }
}
```

## 🚀 Usage Workflow

### 1. Setup Environment
```bash
# Copy environment template
cp .env.local .env.venues

# Configure staging environment
SUPABASE_ENV=staging
SUPABASE_URL=your_staging_url
SUPABASE_ANON_KEY=your_staging_key
GOOGLE_MAPS_API_KEY=your_google_key
```

### 2. Prepare Input Data
```bash
# Create places list
echo '["The Old Man", "Quinary", "COA"]' > places-input.json

# Or use text file
echo -e "The Old Man\nQuinary\nCOA" > places-input.txt
```

### 3. Run Ingestion
```bash
# Process places
pnpm tsx scripts/places/ingest-places.ts --input places-input.json --confirm

# Or with different options
pnpm tsx scripts/places/ingest-places.ts \
  --input places-input.txt \
  --environment staging \
  --batch-size 5 \
  --dry-run
```

### 4. Review & Confirm
- **Interactive Mode**: Review each place before upsert
- **Batch Mode**: Confirm entire batch
- **Dry Run**: Preview changes without database updates
- **Conflict Resolution**: Handle duplicates and updates

## 📋 Command Line Options

```bash
pnpm tsx scripts/places/ingest-places.ts [options]

Options:
  --input <file>           Input file (JSON or TXT)
  --environment <env>      Supabase environment (staging/production)
  --batch-size <number>    Process places in batches (default: 10)
  --confirm                Skip confirmation prompts
  --dry-run               Preview changes without updating database
  --update-existing        Update existing places (default: skip)
  --region <region>        Default region (hongkong/taiwan)
  --verbose               Detailed logging
  --help                  Show help information
```

## 🔄 Reusability Features

### 1. Incremental Updates
- **Smart Detection**: Only update changed data
- **Timestamp Tracking**: Track last update time
- **Change Logging**: Log what was modified

### 2. Environment Switching
- **Staging Focus**: Primary development environment
- **Production Ready**: Easy switch to production
- **Config Management**: Environment-specific settings

### 3. Data Validation
- **Schema Validation**: Ensure data matches database schema
- **Quality Checks**: Validate coordinates, required fields
- **Error Handling**: Graceful failure with detailed logging

### 4. Audit Trail
- **Change Tracking**: Log all modifications
- **User Attribution**: Track who made changes
- **Rollback Support**: Ability to revert changes

## 🚨 Error Handling & Recovery

### Rate Limiting
- **Google API**: Respect 100 requests/second limit
- **Exponential Backoff**: Retry with increasing delays
- **Batch Processing**: Process in smaller chunks

### Data Conflicts
- **Duplicate Detection**: Handle same place with different names
- **Coordinate Validation**: Ensure lat/lng are valid
- **Required Fields**: Validate essential data

### Network Issues
- **Retry Logic**: Automatic retry for transient failures
- **Partial Success**: Continue processing on individual failures
- **Resume Capability**: Resume from last successful place

## 📊 Monitoring & Logging

### Progress Tracking
- **Real-time Updates**: Show progress during processing
- **Success/Failure Counts**: Track completion status
- **Performance Metrics**: Processing time and throughput

### Detailed Logging
- **Structured Logs**: JSON format for easy parsing
- **Error Details**: Full error context and stack traces
- **Audit Trail**: Complete record of all operations

### Output Reports
- **Summary Report**: Overview of processing results
- **Error Report**: Details of failed operations
- **Change Report**: What was added/updated

## 🔮 Future Enhancements

### 1. Advanced Features
- **Bulk Operations**: Process thousands of places efficiently
- **Scheduled Updates**: Automatic periodic data refresh
- **Change Detection**: Only update when data has changed

### 2. Integration Options
- **API Endpoints**: REST API for programmatic access
- **Web Interface**: Simple web UI for place management
- **Mobile App**: In-app place management for admins

### 3. Data Sources
- **Multiple APIs**: Support for other place data sources
- **User Contributions**: Allow users to suggest places
- **Partner Data**: Import from business partners

---

*Offline Data Ingestion Flow Documentation*  
*Part of Cocktail Compass App - Map Feature*  
*Last Updated: January 13, 2025*
