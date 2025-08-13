import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';
import { PlaceMarker, PlaceSearchParams, PlaceWithStats, MAP_REGIONS } from '@/types/map';
import { LatLngBounds, LatLng } from 'leaflet';

export class MapService {
  /**
   * Get places within a viewport bounds using PostGIS
   */
  async getPlacesInViewport(bounds: LatLngBounds, limit: number = 100): Promise<PlaceMarker[]> {
    const params = {
      min_lat: bounds.getSouth(),
      max_lat: bounds.getNorth(),
      min_lng: bounds.getWest(),
      max_lng: bounds.getEast(),
      result_limit: limit,
    };
    
    console.log('🗄️ PostGIS Query: places_in_viewport', {
      params,
      boundsString: bounds.toBBoxString(),
      timestamp: new Date().toISOString()
    });
    
    const { data, error } = await supabase.rpc('places_in_viewport', params);

    if (error) {
      console.error('❌ PostGIS Error:', error);
      throw error;
    }

    console.log('✅ PostGIS Result:', {
      placesCount: data?.length || 0,
      firstPlace: data?.[0]?.name,
      allPlaceNames: data?.map((p: any) => p.name) || []
    });

    return data || [];
  }

  /**
   * Get places near a specific location using PostGIS
   */
  async getNearbyPlaces(
    center: LatLng,
    radiusKm: number = 5,
    limit: number = 50
  ): Promise<PlaceMarker[]> {
    const { data, error } = await supabase.rpc('nearby_places', {
      user_lat: center.lat,
      user_lng: center.lng,
      radius_km: radiusKm,
      result_limit: limit,
    });

    if (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get places by region (Taiwan/Hong Kong)
   */
  async getPlacesByRegion(regionId: string, limit: number = 100): Promise<PlaceMarker[]> {
    const region = MAP_REGIONS[regionId];
    if (!region) {
      throw new Error(`Unknown region: ${regionId}`);
    }

    // Map region keys to database region names
    const regionNameMap: Record<string, string> = {
      'hongkong': 'Hong Kong',
      'taiwan': 'Taiwan'
    };

    const regionName = regionNameMap[regionId];
    if (!regionName) {
      throw new Error(`No database region mapping for: ${regionId}`);
    }

    const { data, error } = await supabase.rpc('places_by_region', {
      region_name: regionName,
      result_limit: limit,
    });

    if (error) {
      console.error('Error fetching places by region:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get place details with stats (cocktail count, visit count, etc.)
   */
  async getPlaceWithStats(placeId: string): Promise<PlaceWithStats | null> {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        cocktail_logs!inner(count),
        visits!inner(count)
      `)
      .eq('id', placeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching place with stats:', error);
      throw error;
    }

    return data;
  }

  /**
   * Auto-detect user's region based on their location
   */
  detectRegion(position: LatLng): string | null {
    for (const [regionId, region] of Object.entries(MAP_REGIONS)) {
      if (region.bounds.contains(position)) {
        return regionId;
      }
    }
    return null;
  }

  /**
   * Search places by text query with optional spatial filtering
   */
  async searchPlaces(query: string, params?: PlaceSearchParams): Promise<PlaceMarker[]> {
    let queryBuilder = supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${query}%, main_text.ilike.%${query}%, secondary_text.ilike.%${query}%`);

    // Add spatial filtering if viewport is provided
    if (params?.viewport) {
      const bounds = params.viewport;
      queryBuilder = queryBuilder
        .gte('lat', bounds.getSouth())
        .lte('lat', bounds.getNorth())
        .gte('lng', bounds.getWest())
        .lte('lng', bounds.getEast());
    }

    if (params?.limit) {
      queryBuilder = queryBuilder.limit(params.limit);
    }

    const { data, error } = await queryBuilder.order('name');

    if (error) {
      console.error('Error searching places:', error);
      throw error;
    }

    let places = data || [];

    // Add distance calculation if nearLocation is provided
    if (params?.nearLocation && places.length > 0) {
      places = places.map(place => ({
        ...place,
        distance: this.calculateDistance(
          params.nearLocation!,
          new LatLng(place.lat, place.lng)
        )
      }));

      // Filter by radius if specified
      if (params.radiusKm) {
        places = places.filter(place => (place as PlaceMarker).distance! <= params.radiusKm!);
      }

      // Sort by distance
      places.sort((a, b) => ((a as PlaceMarker).distance || 0) - ((b as PlaceMarker).distance || 0));
    }

    return places;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const mapService = new MapService();
