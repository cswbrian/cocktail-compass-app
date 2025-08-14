-- Rollback migration for enhanced places table
-- This removes all the new columns added in the enhancement migration

-- Remove Google Places specific fields
ALTER TABLE places DROP COLUMN IF EXISTS google_photos;
ALTER TABLE places DROP COLUMN IF EXISTS google_reviews;

-- Remove computed column
ALTER TABLE places DROP COLUMN IF EXISTS is_open;

-- Remove business hours and location fields
ALTER TABLE places DROP COLUMN IF EXISTS opening_hours;
ALTER TABLE places DROP COLUMN IF EXISTS timezone;
ALTER TABLE places DROP COLUMN IF EXISTS google_url;

-- Remove food and beverage service fields
ALTER TABLE places DROP COLUMN IF EXISTS serves_beer;
ALTER TABLE places DROP COLUMN IF EXISTS serves_cocktails;
ALTER TABLE places DROP COLUMN IF EXISTS serves_wine;
ALTER TABLE places DROP COLUMN IF EXISTS serves_breakfast;
ALTER TABLE places DROP COLUMN IF EXISTS serves_lunch;
ALTER TABLE places DROP COLUMN IF EXISTS serves_dinner;
ALTER TABLE places DROP COLUMN IF EXISTS serves_brunch;

-- Remove venue feature fields
ALTER TABLE places DROP COLUMN IF EXISTS outdoor_seating;
ALTER TABLE places DROP COLUMN IF EXISTS live_music;
ALTER TABLE places DROP COLUMN IF EXISTS happy_hour;

-- Remove accessibility and service fields
ALTER TABLE places DROP COLUMN IF EXISTS wheelchair_accessible_entrance;
ALTER TABLE places DROP COLUMN IF EXISTS delivery;
ALTER TABLE places DROP COLUMN IF EXISTS dine_in;
ALTER TABLE places DROP COLUMN IF EXISTS takeout;
ALTER TABLE places DROP COLUMN IF EXISTS reservable;

-- Remove rating and review fields
ALTER TABLE places DROP COLUMN IF EXISTS rating;
ALTER TABLE places DROP COLUMN IF EXISTS user_ratings_total;
ALTER TABLE places DROP COLUMN IF EXISTS price_level;

-- Remove category and feature fields
ALTER TABLE places DROP COLUMN IF EXISTS place_types;
ALTER TABLE places DROP COLUMN IF EXISTS business_status;

-- Remove contact information fields
ALTER TABLE places DROP COLUMN IF EXISTS phone_number;
ALTER TABLE places DROP COLUMN IF EXISTS website;
ALTER TABLE places DROP COLUMN IF EXISTS formatted_address;
ALTER TABLE places DROP COLUMN IF EXISTS international_phone_number;

-- Remove metadata fields
ALTER TABLE places DROP COLUMN IF EXISTS last_updated;
ALTER TABLE places DROP COLUMN IF EXISTS data_source;
ALTER TABLE places DROP COLUMN IF EXISTS verification_date;
ALTER TABLE places DROP COLUMN IF EXISTS verified_by;

-- Drop indexes
DROP INDEX IF EXISTS idx_places_rating;
DROP INDEX IF EXISTS idx_places_price_level;
DROP INDEX IF EXISTS idx_places_place_types;
DROP INDEX IF EXISTS idx_places_business_status;
DROP INDEX IF EXISTS idx_places_last_updated;
DROP INDEX IF EXISTS idx_places_data_source;
DROP INDEX IF EXISTS idx_places_phone_number;
DROP INDEX IF EXISTS idx_places_website;
DROP INDEX IF EXISTS idx_places_opening_hours;
DROP INDEX IF EXISTS idx_places_region_rating;
DROP INDEX IF EXISTS idx_places_region_price;
DROP INDEX IF EXISTS idx_places_region_types;
DROP INDEX IF EXISTS idx_places_region_verified;

-- Drop constraints
ALTER TABLE places DROP CONSTRAINT IF EXISTS check_rating_range;
ALTER TABLE places DROP CONSTRAINT IF EXISTS check_price_level_range;
ALTER TABLE places DROP CONSTRAINT IF EXISTS check_user_ratings_total;
