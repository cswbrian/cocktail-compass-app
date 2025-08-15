import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';
import { PlaceMarker, PlaceSearchParams, PlaceWithStats } from '@/types/map';
import { SMART_DEFAULT_VIEWPORT } from '@/config/map-config';
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
    
    const { data, error } = await supabase.rpc('places_in_viewport_with_status', params);

    if (error) {
      console.error('❌ PostGIS Error:', error);
      throw error;
    }

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
    const { data, error } = await supabase.rpc('nearby_places_with_status', {
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
   * Get places with smart fallback strategy
   * This method provides fallback data loading when no viewport is available
   */
  async getPlacesWithSmartFallback(viewport?: LatLngBounds, limit: number = 100): Promise<PlaceMarker[]> {
    // If viewport is provided and large enough, use it
    if (viewport && this.isViewportLargeEnough(viewport)) {
      return this.getPlacesInViewport(viewport, limit);
    }

    // Otherwise, use smart default viewport
    const bounds = new (await import('leaflet')).LatLngBounds(
      [SMART_DEFAULT_VIEWPORT.fallbackViewport.min_lat, SMART_DEFAULT_VIEWPORT.fallbackViewport.min_lng] as any,
      [SMART_DEFAULT_VIEWPORT.fallbackViewport.max_lat, SMART_DEFAULT_VIEWPORT.fallbackViewport.max_lng] as any,
    );
    return this.getPlacesInViewport(bounds, limit);
  }

  /**
   * Check if a viewport is large enough for meaningful data loading
   */
  private isViewportLargeEnough(viewport: LatLngBounds): boolean {
    const latSpan = Math.abs(viewport.getNorth() - viewport.getSouth());
    const lngSpan = Math.abs(viewport.getEast() - viewport.getWest());
    
    return latSpan >= SMART_DEFAULT_VIEWPORT.minViewportSize.lat && 
           lngSpan >= SMART_DEFAULT_VIEWPORT.minViewportSize.lng;
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
   * Search places by text query with optional spatial filtering
   */
  async searchPlaces(query: string, params?: PlaceSearchParams): Promise<PlaceMarker[]> {
    let queryBuilder = supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${query}%, main_text.ilike.%${query}%, secondary_text.ilike.%${query}%`);
    
    // Only include places that should be shown on the map
    queryBuilder = queryBuilder.eq('show_on_map', true);

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
