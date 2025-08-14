# Enhanced Places Table Schema

## 🎯 Overview

This document describes the enhanced `places` table schema that supports comprehensive Google Places API integration for the Cocktail Compass app.

## 📊 Schema Changes

### New Columns Added

#### Contact Information
| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `phone_number` | `text` | Contact phone number | `NULL` |
| `website` | `text` | Official website URL | `NULL` |
| `formatted_address` | `text` | Full formatted address | `NULL` |
| `international_phone_number` | `text` | International format phone | `NULL` |

#### Ratings and Reviews
| Column | Type | Description | Default | Constraints |
|--------|------|-------------|---------|-------------|
| `rating` | `numeric(3,2)` | Google rating (0-5) | `NULL` | `CHECK (rating >= 0 AND rating <= 5)` |
| `user_ratings_total` | `integer` | Total number of reviews | `NULL` | `CHECK (user_ratings_total >= 0)` |
| `price_level` | `integer` | Price range (0-4) | `NULL` | `CHECK (price_level >= 0 AND price_level <= 4)` |

#### Categories and Features
| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `place_types` | `text[]` | Array of place categories | `NULL` |
| `business_status` | `text` | Operational status | `'OPERATIONAL'` |



#### Business Hours and Location
| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `opening_hours` | `jsonb` | Business hours (Google format) | `NULL` |
| `timezone` | `text` | Business timezone | `'Asia/Hong_Kong'` |
| `google_url` | `text` | Google Maps URL | `NULL` |

#### Metadata and Tracking
| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `last_updated` | `timestamptz` | Last data update | `now()` |
| `data_source` | `text` | Data source identifier | `'google_places'` |
| `verification_date` | `timestamptz` | Verification timestamp | `NULL` |
| `verified_by` | `uuid` | User who verified | `NULL` |

#### Google Places Integration
| Column | Type | Description | Default |
|--------|------|-------------|---------|
| `google_photos` | `jsonb` | Google Places photos data | `NULL` |
| `google_reviews` | `jsonb` | Google Places reviews data | `NULL` |

### Computed Columns

#### `is_open` (Generated)
- **Type**: `boolean`
- **Generation**: `STORED` (computed at insert/update time)
- **Logic**: 
  ```sql
  calculate_venue_open_status(opening_hours, timezone)
  ```
  This function calculates real-time open/closed status based on venue timezone and opening hours.

## 🗂️ Database Indexes

### Performance Indexes
```sql
-- Rating and price queries
CREATE INDEX idx_places_rating ON places (rating);
CREATE INDEX idx_places_price_level ON places (price_level);

-- Array field queries
CREATE INDEX idx_places_place_types ON places USING GIN (place_types);
CREATE INDEX idx_places_opening_hours ON places USING GIN (opening_hours);

-- Status and metadata queries
CREATE INDEX idx_places_business_status ON places (business_status);
CREATE INDEX idx_places_data_source ON places (data_source);
CREATE INDEX idx_places_is_verified ON places (is_verified);
CREATE INDEX idx_places_last_updated ON places (last_updated);

-- Contact information queries
CREATE INDEX idx_places_phone_number ON places (phone_number);
CREATE INDEX idx_places_website ON places (website);
```

### Composite Indexes
```sql
-- Region-based queries with other filters
CREATE INDEX idx_places_region_rating ON places (region, rating);
CREATE INDEX idx_places_region_price ON places (region, price_level);
CREATE INDEX idx_places_region_types ON places (region, place_types);
CREATE INDEX idx_places_region_verified ON places (region, is_verified);
```

## 🔧 Database Functions

### Enhanced Existing Functions

#### `places_in_viewport()`
- **Purpose**: Get places within a geographic bounding box
- **New Fields**: `rating`, `price_level`, `place_types`, `is_open`, `phone_number`, `website`, `formatted_address`

#### `nearby_places()`
- **Purpose**: Find places near a specific location
- **New Fields**: `rating`, `price_level`, `place_types`, `is_open`
- **Returns**: Distance in kilometers

#### `places_by_region()`
- **Purpose**: Get places by region
- **New Fields**: `rating`, `price_level`, `place_types`, `is_open`, `phone_number`, `website`, `formatted_address`

### New Functions

#### `places_by_rating(min_rating, max_rating, region_name, result_limit)`
- **Purpose**: Find places within a rating range
- **Parameters**:
  - `min_rating`: Minimum rating (0-5)
  - `max_rating`: Maximum rating (0-5)
  - `region_name`: Optional region filter
  - `result_limit`: Maximum results to return
- **Returns**: Places ordered by rating (highest first)

#### `places_by_type(place_type, region_name, result_limit)`
- **Purpose**: Find places by specific type
- **Parameters**:
  - `place_type`: Place category (e.g., 'bar', 'restaurant')
  - `region_name`: Optional region filter
  - `result_limit`: Maximum results to return
- **Returns**: Places ordered by rating, then name

## 📋 Data Constraints

### Check Constraints
```sql
-- Rating validation
ALTER TABLE places ADD CONSTRAINT check_rating_range 
  CHECK (rating >= 0 AND rating <= 5);

-- Price level validation
ALTER TABLE places ADD CONSTRAINT check_price_level_range 
  CHECK (price_level >= 0 AND price_level <= 4);

-- User ratings total validation
ALTER TABLE places ADD CONSTRAINT check_user_ratings_total 
  CHECK (user_ratings_total >= 0);
```

### Foreign Key Constraints
```sql
-- Verification user reference
ALTER TABLE places ADD COLUMN verified_by uuid REFERENCES users(id);
```

## 🔄 Migration Process

### Applying the Migration
1. **Backup**: Create a backup of your production database
2. **Staging**: Test the migration in staging environment first
3. **Apply**: Run the migration SQL file
4. **Verify**: Test all functions and indexes
5. **Production**: Apply to production during maintenance window

### Rollback Plan
- Use the rollback migration: `20250113_001_enhance_places_table_rollback.sql`
- **Warning**: Rollback will permanently remove all data in new columns
- **Recommendation**: Backup new data before rollback

## 🧪 Testing

### Schema Test Script
```bash
cd scripts/places
pnpm test-schema
```

### Test Coverage
- ✅ New columns accessibility
- ✅ Enhanced function availability
- ✅ Index creation verification
- ✅ Data insertion/validation
- ✅ Constraint enforcement

## 📊 Data Quality

### Required Fields
- `name`, `place_id`, `lat`, `lng` (existing)
- `region` (existing)

### Optional Fields
- All new fields are optional with sensible defaults
- `rating` and `price_level` have validation constraints
- `place_types` supports array operations for flexible queries

### Data Source Tracking
- `data_source` field tracks origin of place data
- `last_updated` tracks when data was last refreshed
- `verification_date` and `verified_by` for manual verification

## 🚀 Performance Considerations

### Query Optimization
- **Spatial queries**: Use PostGIS indexes for location-based searches
- **Rating queries**: Composite indexes for region + rating combinations
- **Type queries**: GIN indexes for array field searches
- **Time queries**: Index on `last_updated` for data freshness

### Storage Optimization
- **JSON fields**: Use `jsonb` for efficient JSON storage and querying
- **Array fields**: GIN indexes for fast array containment searches
- **Computed columns**: `STORED` generation for real-time status

## 🔮 Future Enhancements

### Potential Additions
- **Social features**: User reviews and ratings
- **Analytics**: Visit tracking and popularity metrics
- **Integration**: Additional data sources beyond Google Places
- **Caching**: Redis integration for frequently accessed data

### Scalability
- **Partitioning**: Consider table partitioning by region for large datasets
- **Archiving**: Move old/inactive places to archive tables
- **CDN**: Serve static place data through CDN for performance

---

*Enhanced Places Table Schema Documentation*  
*Part of Cocktail Compass App - Map Feature*  
*Last Updated: January 13, 2025*
