-- Migration: Backend show_on_map filtering (correct signatures)
-- Created: 2025-01-14

-- Ensure backend RPCs exclude places with show_on_map = FALSE

-- Update places_in_viewport_with_status
CREATE OR REPLACE FUNCTION places_in_viewport_with_status(
  min_lat double precision,
  max_lat double precision,
  min_lng double precision,
  max_lng double precision,
  result_limit integer DEFAULT 100,
  filter_tags text[] DEFAULT NULL,
  match text DEFAULT 'any',
  open_only boolean DEFAULT NULL
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
  tags text[],
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
    AND COALESCE(p.show_on_map, true) = true
    AND (
      filter_tags IS NULL OR
      (
        CASE WHEN lower(coalesce(match, 'any')) = 'all'
          THEN p.tags @> filter_tags
          ELSE coalesce(p.tags, '{}') && filter_tags
        END
      )
    )
    AND (
      open_only IS NULL OR open_only = FALSE OR
      calculate_venue_open_status(p.opening_hours, p.timezone) = TRUE
    )
  ORDER BY p.name
  LIMIT result_limit;
END;
$$;

-- Update nearby_places_with_status
CREATE OR REPLACE FUNCTION nearby_places_with_status(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5.0,
  result_limit integer DEFAULT 50,
  filter_tags text[] DEFAULT NULL,
  match text DEFAULT 'any',
  open_only boolean DEFAULT NULL
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
  tags text[],
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
    AND COALESCE(p.show_on_map, true) = true
    AND (
      filter_tags IS NULL OR
      (
        CASE WHEN lower(coalesce(match, 'any')) = 'all'
          THEN p.tags @> filter_tags
          ELSE coalesce(p.tags, '{}') && filter_tags
        END
      )
    )
    AND (
      open_only IS NULL OR open_only = FALSE OR
      calculate_venue_open_status(p.opening_hours, p.timezone) = TRUE
    )
  ORDER BY distance
  LIMIT result_limit;
END;
$$;

