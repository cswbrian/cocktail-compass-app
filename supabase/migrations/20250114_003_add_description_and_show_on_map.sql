-- Add description and show_on_map to places
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS show_on_map boolean DEFAULT true;

-- Ensure existing rows have a non-null value for show_on_map
UPDATE places SET show_on_map = true WHERE show_on_map IS NULL;

-- Optional: index for show_on_map filters
CREATE INDEX IF NOT EXISTS idx_places_show_on_map ON places (show_on_map);

