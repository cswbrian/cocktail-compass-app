# Supabase Migrations

This directory contains SQL migration files for the Cocktail Compass app's map functionality.

## Migration Files

### `20250110_001_create_map_functions.sql`
Creates PostGIS functions for map functionality:

- **`places_in_viewport()`** - Get places within a bounding box (map viewport)
- **`nearby_places()`** - Get places within a radius of user location with distance calculation
- **`places_by_region()`** - Get places filtered by region (Hong Kong/Taiwan)

## Prerequisites

Before applying these migrations, ensure:

1. **PostGIS Extension** is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Places table** has the required structure:
   ```sql
   -- The places table should have these columns:
   id uuid PRIMARY KEY
   place_id text UNIQUE
   name text
   main_text text
   secondary_text text
   lat double precision
   lng double precision
   created_at timestamptz
   updated_at timestamptz
   is_verified boolean
   region text
   location geography GENERATED ALWAYS AS (ST_Point(lng, lat)::geography) STORED
   ```

## Applying Migrations

### Development/Staging
These functions have already been applied to the staging database.

### Production
To apply to production:

1. **Using Supabase Dashboard:**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `20250110_001_create_map_functions.sql`
   - Execute the migration

2. **Using Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Manual Application:**
   ```bash
   psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250110_001_create_map_functions.sql
   ```

## Testing Migrations

After applying, test the functions:

```sql
-- Test viewport function (Central Hong Kong area)
SELECT * FROM places_in_viewport(22.2, 22.3, 114.1, 114.2, 10);

-- Test nearby places function (1km around Central)
SELECT * FROM nearby_places(22.2849, 114.1577, 1, 10);

-- Test region function
SELECT * FROM places_by_region('hongkong', 10);
```

## Function Usage in Application

These functions are used by:
- `src/services/map-service.ts` - MapService class methods
- `src/lib/swr-config.ts` - SWR fetchers for caching
- `src/components/map/MapContainer.tsx` - Map component for place loading

## Performance Notes

- All functions include `LIMIT` parameters to prevent large result sets
- `nearby_places()` uses PostGIS spatial indexing for efficient distance queries
- `places_in_viewport()` uses simple lat/lng bounds for fast viewport queries
- Consider adding database indexes on `lat`, `lng`, and `region` columns for optimal performance

## Rollback

To remove these functions:

```sql
DROP FUNCTION IF EXISTS places_in_viewport(double precision, double precision, double precision, double precision, integer);
DROP FUNCTION IF EXISTS nearby_places(double precision, double precision, double precision, integer);
DROP FUNCTION IF EXISTS places_by_region(text, integer);
```
