-- Migration: Add manual tags support to places
-- Created: 2025-01-14
-- Description: Adds tags column for manual tagging and a GIN index for fast filtering

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS tags text[];

CREATE INDEX IF NOT EXISTS idx_places_tags
  ON places USING GIN (tags);

COMMENT ON COLUMN places.tags IS 'Manual tags for a place (e.g., speakeasy, rooftop).';


