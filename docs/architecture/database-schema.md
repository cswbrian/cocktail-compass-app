# Database Schema Documentation

## 🗄️ Overview

Complete database schema for the Cocktail Compass app, including all tables, relationships, and PostGIS spatial functions.

## 📊 Core Tables

### Users Table
```sql
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Places Table
```sql
places (
  id uuid PRIMARY KEY,
  place_id text UNIQUE,
  name text NOT NULL,
  main_text text, -- Address
  secondary_text text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  region text, -- 'hongkong' or 'taiwan'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_verified boolean DEFAULT false,
  
  -- PostGIS spatial column
  location geography GENERATED ALWAYS AS (ST_Point(lng, lat)::geography) STORED,
  
  -- Day 5 Enhanced Fields
  opening_hours jsonb, -- Flexible schedule storage
  timezone text DEFAULT 'Asia/Hong_Kong'
)
```

### Cocktail Logs Table
```sql
cocktail_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  place_id uuid REFERENCES places(id),
  cocktail_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Bookmarks Table
```sql
bookmarks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  place_id uuid REFERENCES places(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
)
```

### Visits Table
```sql
visits (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  place_id uuid REFERENCES places(id),
  visited_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

## 🌍 PostGIS Spatial Functions

### places_in_viewport()
```sql
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
  region text,
  opening_hours jsonb
)
```

### nearby_places()
```sql
CREATE OR REPLACE FUNCTION nearby_places(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5,
  result_limit integer DEFAULT 50
)
RETURNS TABLE (
  -- Same fields as places table
  distance double precision -- Distance in kilometers
)
```

### places_by_region()
```sql
CREATE OR REPLACE FUNCTION places_by_region(
  region_name text,
  result_limit integer DEFAULT 100
)
RETURNS TABLE (
  -- Same fields as places table
)
```

## 📈 Indexes

### Spatial Indexes
```sql
-- PostGIS spatial index for fast geographic queries
CREATE INDEX idx_places_location ON places USING GIST (location);

-- Standard geographic indexes
CREATE INDEX idx_places_lat_lng ON places (lat, lng);
CREATE INDEX idx_places_region ON places (region);
```

### Performance Indexes
```sql
-- User-related queries
CREATE INDEX idx_cocktail_logs_user_id ON cocktail_logs (user_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX idx_visits_user_id ON visits (user_id);

-- Place-related queries
CREATE INDEX idx_cocktail_logs_place_id ON cocktail_logs (place_id);
CREATE INDEX idx_places_verified ON places (is_verified);
CREATE INDEX idx_places_name ON places (name);

-- Time-based queries
CREATE INDEX idx_cocktail_logs_created_at ON cocktail_logs (created_at);
CREATE INDEX idx_visits_visited_at ON visits (visited_at);
```

## 🔒 Row Level Security (RLS)

### Users Table
```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Bookmarks Table
```sql
-- Users can only access their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### Cocktail Logs Table
```sql
-- Users can view public logs or their own logs
CREATE POLICY "View cocktail logs" ON cocktail_logs FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Users can only modify their own logs
CREATE POLICY "Manage own cocktail logs" ON cocktail_logs
  FOR ALL USING (auth.uid() = user_id);
```

## 🚀 Future Schema Enhancements

### Social Features
```sql
-- User following relationships
follows (
  follower_id uuid REFERENCES users(id),
  following_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
)

-- Place reviews
reviews (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  place_id uuid REFERENCES places(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now()
)
```

### Analytics
```sql
-- User activity tracking
user_events (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  event_type text,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
)
```

---

*Database schema documentation for Cocktail Compass App*  
*Last Updated: January 13, 2025*
