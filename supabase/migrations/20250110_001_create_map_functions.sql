-- Migration: Create Map PostGIS Functions
-- Created: 2025-01-10
-- Description: Creates PostGIS functions for map functionality including viewport-based place queries,
--              nearby place searches, and region-based filtering

-- Function 1: Get places within a viewport (bounding box)
-- Usage: SELECT * FROM places_in_viewport(min_lat, max_lat, min_lng, max_lng, limit);
CREATE OR REPLACE FUNCTION places_in_viewport(
  min_lat double precision,
  max_lat double precision,
  min_lng double precision,
  max_lng double precision,
  result_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  place_id text,
  name text,
  main_text text,
  secondary_text text,
  lat double precision,
  lng double precision,
  created_at timestamptz,
  updated_at timestamptz,
  is_verified boolean,
  region text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.place_id,
    p.name,
    p.main_text,
    p.secondary_text,
    p.lat,
    p.lng,
    p.created_at,
    p.updated_at,
    p.is_verified,
    p.region
  FROM places p
  WHERE p.lat BETWEEN min_lat AND max_lat
    AND p.lng BETWEEN min_lng AND max_lng
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Function 2: Get places near a specific location using PostGIS distance calculations
-- Usage: SELECT * FROM nearby_places(user_lat, user_lng, radius_km, limit);
CREATE OR REPLACE FUNCTION nearby_places(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5,
  result_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  place_id text,
  name text,
  main_text text,
  secondary_text text,
  lat double precision,
  lng double precision,
  created_at timestamptz,
  updated_at timestamptz,
  is_verified boolean,
  region text,
  distance double precision
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_location geography;
BEGIN
  -- Create geography point from lat/lng
  user_location := ST_MakePoint(user_lng, user_lat)::geography;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.place_id,
    p.name,
    p.main_text,
    p.secondary_text,
    p.lat,
    p.lng,
    p.created_at,
    p.updated_at,
    p.is_verified,
    p.region,
    ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 2)::double precision as distance
  FROM places p
  WHERE ST_DWithin(p.location, user_location, radius_km * 1000) -- Convert km to meters
  ORDER BY ST_Distance(p.location, user_location)
  LIMIT result_limit;
END;
$$;

-- Function 3: Get places by region with flexible region matching
-- Usage: SELECT * FROM places_by_region('hongkong', limit);
CREATE OR REPLACE FUNCTION places_by_region(
  region_name text,
  result_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  place_id text,
  name text,
  main_text text,
  secondary_text text,
  lat double precision,
  lng double precision,
  created_at timestamptz,
  updated_at timestamptz,
  is_verified boolean,
  region text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.place_id,
    p.name,
    p.main_text,
    p.secondary_text,
    p.lat,
    p.lng,
    p.created_at,
    p.updated_at,
    p.is_verified,
    p.region
  FROM places p
  WHERE p.region = region_name
    OR (region_name = 'hongkong' AND p.region = 'hong_kong')
    OR (region_name = 'taiwan' AND p.region = 'taiwan')
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Note: These functions require the PostGIS extension to be enabled
-- and assume the places table has a 'location' column of type geography.
-- 
-- Prerequisites:
-- 1. PostGIS extension must be enabled: CREATE EXTENSION IF NOT EXISTS postgis;
-- 2. Places table should have a generated location column:
--    ALTER TABLE places ADD COLUMN location geography GENERATED ALWAYS AS (ST_Point(lng, lat)::geography) STORED;
