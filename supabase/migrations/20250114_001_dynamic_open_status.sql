-- Migration: Dynamic Open Status (compute at query-time) and drop STORED is_open
-- Created: 2025-01-14

-- 1) Create a timezone-aware function to compute whether a place is open now
create or replace function is_open_now(
  opening_hours jsonb,
  tz text default 'Asia/Hong_Kong'
) returns boolean
language sql
stable
as $$
  select case
    when opening_hours is null then null
    when opening_hours ? 'periods' = false then null
    else exists (
      with local_now as (
        select (now() at time zone tz) as ts
      ),
      ctx as (
        select
          extract(dow from ts)::int as dow,
          (extract(hour from ts)::int * 100 + extract(minute from ts)::int) as hhmm
        from local_now
      ),
      periods as (
        select
          (p->'open'->>'day')::int   as o_day,
          (p->'open'->>'time')::int  as o_time,
          (p->'close'->>'day')::int  as c_day,
          (p->'close'->>'time')::int as c_time
        from jsonb_array_elements(opening_hours->'periods') p
        where p ? 'open' and p ? 'close'
      )
      select 1
      from periods, ctx
      where
        -- same-day window
        (o_day = c_day and o_day = ctx.dow and o_time <= ctx.hhmm and ctx.hhmm < c_time)
        or
        -- overnight window (closes next day)
        (o_day <> c_day and (
          (ctx.dow = o_day and ctx.hhmm >= o_time) or
          (ctx.dow = c_day and ctx.hhmm < c_time)
        ))
    )
  end;
$$;

comment on function is_open_now(jsonb, text) is 'Returns whether a place is open now based on opening_hours.periods and timezone. Returns null when hours are unknown.';

-- 2) Update functions to compute is_open dynamically

-- Drop existing functions to allow return type changes across environments
drop function if exists places_in_viewport(double precision,double precision,double precision,double precision, integer);
drop function if exists nearby_places(double precision,double precision,double precision, integer);
drop function if exists places_by_region(text, integer);

-- places_in_viewport
create or replace function places_in_viewport(
  min_lat double precision,
  max_lat double precision,
  min_lng double precision,
  max_lng double precision,
  result_limit integer default 100
)
returns table (
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
language plpgsql
as $$
begin
  return query
  select 
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
    is_open_now(p.opening_hours, p.timezone) as is_open,
    p.phone_number,
    p.website,
    p.formatted_address
  from places p
  where p.lat between min_lat and max_lat
    and p.lng between min_lng and max_lng
  order by p.name
  limit result_limit;
end;
$$;

-- nearby_places
create or replace function nearby_places(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 5,
  result_limit integer default 50
)
returns table (
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
language plpgsql
as $$
declare
  user_location geography;
begin
  user_location := ST_MakePoint(user_lng, user_lat)::geography;
  return query
  select 
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
    is_open_now(p.opening_hours, p.timezone) as is_open,
    round((ST_Distance(p.location, user_location) / 1000)::numeric, 2)::double precision as distance
  from places p
  where ST_DWithin(p.location, user_location, radius_km * 1000)
  order by ST_Distance(p.location, user_location)
  limit result_limit;
end;
$$;

-- places_by_region (for consistency)
create or replace function places_by_region(
  region_name text,
  result_limit integer default 100
)
returns table (
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
language plpgsql
as $$
begin
  return query
  select 
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
    is_open_now(p.opening_hours, p.timezone) as is_open,
    p.phone_number,
    p.website,
    p.formatted_address
  from places p
  where p.region = region_name
     or (region_name = 'hongkong' and p.region = 'hong_kong')
     or (region_name = 'taiwan' and p.region = 'taiwan')
  order by p.name
  limit result_limit;
end;
$$;

-- 3) Drop the legacy STORED column; status is dynamic
alter table places drop column if exists is_open;


