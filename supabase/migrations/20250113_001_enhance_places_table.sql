-- Migration: Enhance Places Table for Google Places API Integration
-- Created: 2025-01-13
-- Description: Adds comprehensive fields to the places table to support Google Places API data
--              including contact information, ratings, features, business hours, and metadata

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add new columns for comprehensive place information
ALTER TABLE places ADD COLUMN IF NOT EXISTS
  -- Contact Information
  phone_number text,
  website text,
  formatted_address text,
  international_phone_number text,
  
  -- Ratings and Reviews
  rating numeric(3,2) CHECK (rating >= 0 AND rating <= 5),
  user_ratings_total integer CHECK (user_ratings_total >= 0),
  price_level integer CHECK (price_level >= 0 AND price_level <= 4),
  
  -- Categories and Features
  place_types text[],
  business_status text DEFAULT 'OPERATIONAL',
  
  -- Accessibility and Services
  wheelchair_accessible_entrance boolean DEFAULT false,
  delivery boolean DEFAULT false,
  dine_in boolean DEFAULT true,
  takeout boolean DEFAULT false,
  reservable boolean DEFAULT false,
  
  -- Food and Beverage Services
  serves_beer boolean DEFAULT false,
  serves_cocktails boolean DEFAULT false,
  serves_wine boolean DEFAULT false,
  serves_breakfast boolean DEFAULT false,
  serves_lunch boolean DEFAULT false,
  serves_dinner boolean DEFAULT false,
  serves_brunch boolean DEFAULT false,
  
  -- Venue Features
  outdoor_seating boolean DEFAULT false,
  live_music boolean DEFAULT false,
  happy_hour boolean DEFAULT false,
  
  -- Business Hours and Location
  opening_hours jsonb,
  timezone text DEFAULT 'Asia/Hong_Kong',
  google_url text, -- Google Maps URL
  
  -- Metadata and Tracking
  last_updated timestamptz DEFAULT now(),
  data_source text DEFAULT 'google_places',
  verification_date timestamptz,
  verified_by uuid REFERENCES users(id);

-- Add computed column for real-time open/closed status
ALTER TABLE places ADD COLUMN IF NOT EXISTS
  is_open boolean GENERATED ALWAYS AS (
    CASE 
      WHEN opening_hours IS NULL THEN NULL
      WHEN (opening_hours->>'open_now')::boolean THEN true
      ELSE false
    END
  ) STORED;

-- Add Google Places specific fields
ALTER TABLE places ADD COLUMN IF NOT EXISTS
  google_photos jsonb,          -- Stored photo references
  google_reviews jsonb;         -- Stored review data

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_places_rating ON places (rating);
CREATE INDEX IF NOT EXISTS idx_places_price_level ON places (price_level);
CREATE INDEX IF NOT EXISTS idx_places_place_types ON places USING GIN (place_types);
CREATE INDEX IF NOT EXISTS idx_places_business_status ON places (business_status);
CREATE INDEX IF NOT EXISTS idx_places_last_updated ON places (last_updated);
CREATE INDEX IF NOT EXISTS idx_places_data_source ON places (data_source);
CREATE INDEX IF NOT EXISTS idx_places_is_verified ON places (is_verified);
CREATE INDEX IF NOT EXISTS idx_places_phone_number ON places (phone_number);
CREATE INDEX IF NOT EXISTS idx_places_website ON places (website);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_places_region_rating ON places (region, rating);
CREATE INDEX IF NOT EXISTS idx_places_region_price ON places (region, price_level);
CREATE INDEX IF NOT EXISTS idx_places_region_types ON places (region, place_types);
CREATE INDEX IF NOT EXISTS idx_places_region_verified ON places (region, is_verified);

-- Index for opening hours queries
CREATE INDEX IF NOT EXISTS idx_places_opening_hours ON places USING GIN (opening_hours);

-- Add constraints for data integrity
ALTER TABLE places ADD CONSTRAINT IF NOT EXISTS 
  check_rating_range CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE places ADD CONSTRAINT IF NOT EXISTS 
  check_price_level_range CHECK (price_level >= 0 AND price_level <= 4);

ALTER TABLE places ADD CONSTRAINT IF NOT EXISTS 
  check_user_ratings_total CHECK (user_ratings_total >= 0);

-- Add comments for documentation
COMMENT ON COLUMN places.phone_number IS 'Contact phone number for the venue';
COMMENT ON COLUMN places.website IS 'Official website URL for the venue';
COMMENT ON COLUMN places.formatted_address IS 'Full formatted address from Google Places API';
COMMENT ON COLUMN places.rating IS 'Google rating from 0-5 scale';
COMMENT ON COLUMN places.price_level IS 'Price level indicator from 0-4 (0=Free, 4=Very Expensive)';
COMMENT ON COLUMN places.place_types IS 'Array of place categories from Google Places API';
COMMENT ON COLUMN places.opening_hours IS 'Business hours in JSON format from Google Places API';
COMMENT ON COLUMN places.is_open IS 'Computed real-time open/closed status';
COMMENT ON COLUMN places.data_source IS 'Source of the place data (google_places, manual, etc.)';
COMMENT ON COLUMN places.place_id IS 'Google Places API unique identifier (equivalent to google_place_id)';

-- Update existing functions to include new fields
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
  region text,
  rating numeric(3,2),
  price_level integer,
  place_types text[],
  is_open boolean,
  phone_number text,
  website text,
  formatted_address text
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
    p.region,
    p.rating,
    p.price_level,
    p.place_types,
    p.is_open,
    p.phone_number,
    p.website,
    p.formatted_address
  FROM places p
  WHERE p.lat BETWEEN min_lat AND max_lat
    AND p.lng BETWEEN min_lng AND max_lng
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Update nearby_places function
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
  rating numeric(3,2),
  price_level integer,
  place_types text[],
  is_open boolean,
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
    p.rating,
    p.price_level,
    p.place_types,
    p.is_open,
    ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 2)::double precision as distance
  FROM places p
  WHERE ST_DWithin(p.location, user_location, radius_km * 1000) -- Convert km to meters
  ORDER BY ST_Distance(p.location, user_location)
  LIMIT result_limit;
END;
$$;

-- Update places_by_region function
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
  region text,
  rating numeric(3,2),
  price_level integer,
  place_types text[],
  is_open boolean,
  phone_number text,
  website text,
  formatted_address text
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
    p.region,
    p.rating,
    p.price_level,
    p.place_types,
    p.is_open,
    p.phone_number,
    p.website,
    p.formatted_address
  FROM places p
  WHERE p.region = region_name
    OR (region_name = 'hongkong' AND p.region = 'hong_kong')
    OR (region_name = 'taiwan' AND p.region = 'taiwan')
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Create a function to get places by rating range
CREATE OR REPLACE FUNCTION places_by_rating(
  min_rating numeric(3,2),
  max_rating numeric(3,2) DEFAULT 5,
  region_name text DEFAULT NULL,
  result_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  place_id text,
  name text,
  rating numeric(3,2),
  price_level integer,
  place_types text[],
  region text,
  formatted_address text,
  is_open boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.place_id,
    p.name,
    p.rating,
    p.price_level,
    p.place_types,
    p.region,
    p.formatted_address,
    p.is_open
  FROM places p
  WHERE p.rating >= min_rating 
    AND p.rating <= max_rating
    AND (region_name IS NULL OR p.region = region_name)
    AND p.rating IS NOT NULL
  ORDER BY p.rating DESC, p.name
  LIMIT result_limit;
END;
$$;

-- Create a function to get places by type
CREATE OR REPLACE FUNCTION places_by_type(
  place_type text,
  region_name text DEFAULT NULL,
  result_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  place_id text,
  name text,
  place_types text[],
  rating numeric(3,2),
  price_level integer,
  region text,
  formatted_address text,
  is_open boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.place_id,
    p.name,
    p.place_types,
    p.rating,
    p.price_level,
    p.region,
    p.formatted_address,
    p.is_open
  FROM places p
  WHERE p.place_types @> ARRAY[place_type]
    AND (region_name IS NULL OR p.region = region_name)
  ORDER BY p.rating DESC NULLS LAST, p.name
  LIMIT result_limit;
END;
$$;

-- Add comments for the new functions
COMMENT ON FUNCTION places_by_rating IS 'Get places within a rating range, optionally filtered by region';
COMMENT ON FUNCTION places_by_type IS 'Get places by specific type (e.g., bar, restaurant), optionally filtered by region';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION places_by_rating TO authenticated;
GRANT EXECUTE ON FUNCTION places_by_type TO authenticated;
