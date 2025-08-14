-- Migration: Remove region field from places table
-- This migration removes the deprecated region concept from the database

-- Drop the region-based PostGIS functions first
DROP FUNCTION IF EXISTS places_by_region(text, integer);

-- Remove the region column from the places table
ALTER TABLE places DROP COLUMN IF EXISTS region;

-- Update the places_with_status view to remove region dependency
CREATE OR REPLACE VIEW places_with_status AS
SELECT
  p.*,
  calculate_venue_open_status(p.opening_hours, p.timezone) as is_open
FROM places p;

-- Create new functions that don't rely on region
-- These replace the old region-based functions

-- Function to get places in viewport with status (no region dependency)
CREATE OR REPLACE FUNCTION places_in_viewport_with_status(
  min_lat double precision,
  max_lat double precision,
  min_lng double precision,
  max_lng double precision,
  result_limit integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  place_id text,
  name text,
  main_text text,
  secondary_text text,
  lat double precision,
  lng double precision,
  is_verified boolean,
  phone_number text,
  website text,
  formatted_address text,
  international_phone_number text,
  rating numeric,
  user_ratings_total integer,
  price_level integer,
  place_types text[],
  business_status text,
  opening_hours jsonb,
  timezone text,
  google_url text,
  last_updated timestamptz,
  data_source text,
  verification_date timestamptz,
  verified_by uuid,
  is_open boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    calculate_venue_open_status(p.opening_hours, p.timezone) as is_open
  FROM places p
  WHERE p.lat BETWEEN min_lat AND max_lat
    AND p.lng BETWEEN min_lng AND max_lng
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Function to get nearby places with status (no region dependency)
CREATE OR REPLACE FUNCTION nearby_places_with_status(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5.0,
  result_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  place_id text,
  name text,
  main_text text,
  secondary_text text,
  lat double precision,
  lng double precision,
  is_verified boolean,
  phone_number text,
  website text,
  formatted_address text,
  international_phone_number text,
  rating numeric,
  user_ratings_total integer,
  price_level integer,
  place_types text[],
  business_status text,
  opening_hours jsonb,
  timezone text,
  google_url text,
  last_updated timestamptz,
  data_source text,
  verification_date timestamptz,
  verified_by uuid,
  distance double precision,
  is_open boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000.0 as distance,
    calculate_venue_open_status(p.opening_hours, p.timezone) as is_open
  FROM places p
  WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_km * 1000.0
  )
  ORDER BY distance
  LIMIT result_limit;
END;
$$;

-- Add comments to document the changes
COMMENT ON FUNCTION places_in_viewport_with_status IS 'Get places within viewport bounds with open/closed status (no region dependency)';
COMMENT ON FUNCTION nearby_places_with_status IS 'Get places near coordinates with distance and open/closed status (no region dependency)';
COMMENT ON VIEW places_with_status IS 'Places with computed open/closed status (no region dependency)';
