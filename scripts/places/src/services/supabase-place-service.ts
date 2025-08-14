import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Place } from '../../../../src/types/place';
import { GooglePlaceDetails, UpsertResult, BatchUpsertResult } from '../types/types';
import { config } from '../../config';

/**
 * Conflict resolution strategies for place data
 */
export type ConflictResolution = 
  | 'skip'           // Skip if exists
  | 'update'         // Always update
  | 'merge'          // Merge non-null values
  | 'replace';       // Replace completely

/**
 * Supabase Place Service for database operations
 * Handles individual and batch upsert operations with duplicate detection
 */
export class SupabasePlaceService {
  private supabase: SupabaseClient;
  private projectId: string;

  constructor(projectId?: string) {
    this.projectId = projectId || 'ucxtfzzgxzqhqtflrhad'; // Default to staging
    
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * Check if a place exists by place_id
   */
  async existsByPlaceId(placeId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('places')
      .select('id')
      .eq('place_id', placeId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check place existence: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get existing place by place_id
   */
  async getByPlaceId(placeId: string): Promise<Place | null> {
    const { data, error } = await this.supabase
      .from('places')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get place: ${error.message}`);
    }

    return data as Place | null;
  }

  /**
   * Insert a new place
   */
  async insertPlace(placeData: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Promise<Place> {
    const { data, error } = await this.supabase
      .from('places')
      .insert({
        ...placeData,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert place: ${error.message}`);
    }

    return data as Place;
  }

  /**
   * Update an existing place
   */
  async updatePlace(
    placeId: string, 
    placeData: Partial<Omit<Place, 'id' | 'created_at' | 'updated_at'>>,
    conflictResolution: ConflictResolution = 'merge'
  ): Promise<Place> {
    let updateData = { ...placeData };

    if (conflictResolution === 'merge') {
      // Get existing place to merge with
      const existing = await this.getByPlaceId(placeId);
      if (existing) {
        // Only update fields that have new values
        updateData = Object.entries(placeData).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as any);
      }
    }

    const { data, error } = await this.supabase
      .from('places')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .eq('place_id', placeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update place: ${error.message}`);
    }

    return data as Place;
  }

  /**
   * Upsert a single place with conflict resolution
   */
  async upsertPlace(
    placeData: Omit<Place, 'id' | 'created_at' | 'updated_at'>,
    conflictResolution: ConflictResolution = 'merge'
  ): Promise<UpsertResult> {
    try {
      const exists = await this.existsByPlaceId(placeData.place_id);
      
      if (exists) {
        if (conflictResolution === 'skip') {
          return {
            type: 'skipped',
            changes: {
              added: [],
              updated: [],
              unchanged: [placeData.place_id],
              errors: [],
            },
          };
        }

        const updatedPlace = await this.updatePlace(
          placeData.place_id, 
          placeData, 
          conflictResolution
        );

        return {
          type: 'updated',
          data: updatedPlace,
          changes: {
            added: [],
            updated: [placeData.place_id],
            unchanged: [],
            errors: [],
          },
        };
      } else {
        const insertedPlace = await this.insertPlace(placeData);

        return {
          type: 'inserted',
          data: insertedPlace,
          changes: {
            added: [placeData.place_id],
            updated: [],
            unchanged: [],
            errors: [],
          },
        };
      }
    } catch (error) {
      return {
        type: 'error',
        error,
        changes: {
          added: [],
          updated: [],
          unchanged: [],
          errors: [placeData.place_id],
        },
      };
    }
  }

  /**
   * Batch upsert multiple places
   */
  async batchUpsertPlaces(
    placesData: Omit<Place, 'id' | 'created_at' | 'updated_at'>[],
    conflictResolution: ConflictResolution = 'merge'
  ): Promise<BatchUpsertResult> {
    const results: UpsertResult[] = [];
    const summary = {
      total: placesData.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      successRate: 0,
    };
    const changes = {
      added: [] as string[],
      updated: [] as string[],
      unchanged: [] as string[],
      errors: [] as string[],
    };

    // Process places sequentially to avoid overwhelming the database
    for (const placeData of placesData) {
      try {
        await new Promise(resolve => setTimeout(resolve, config.venues.delayMs));
        
        const result = await this.upsertPlace(placeData, conflictResolution);
        results.push(result);

        // Update summary
        summary[result.type]++;
        
        // Merge changes
        changes.added.push(...result.changes!.added);
        changes.updated.push(...result.changes!.updated);
        changes.unchanged.push(...result.changes!.unchanged);
        changes.errors.push(...result.changes!.errors);

      } catch (error) {
        const errorResult: UpsertResult = {
          type: 'error',
          error,
          changes: {
            added: [],
            updated: [],
            unchanged: [],
            errors: [placeData.place_id],
          },
        };
        results.push(errorResult);
        summary.errors++;
        changes.errors.push(placeData.place_id);

        console.error(`Failed to upsert place ${placeData.place_id}:`, error);
      }
    }

    summary.successRate = ((summary.inserted + summary.updated + summary.skipped) / summary.total) * 100;

    return {
      results,
      summary,
      changes,
    };
  }

  /**
   * Convert GooglePlaceDetails to Place data for database insertion
   */
  convertGooglePlaceToPlaceData(
    googlePlace: GooglePlaceDetails,
    timezone?: string
  ): Omit<Place, 'id' | 'created_at' | 'updated_at'> {
    const addressParts = googlePlace.formatted_address.split(',');
    const mainText = googlePlace.name;
    const secondaryText = addressParts.length > 1 ? addressParts.slice(0, -1).join(',').trim() : null;

    return {
      place_id: googlePlace.place_id,
      name: googlePlace.name,
      main_text: mainText,
      secondary_text: secondaryText,
      lat: googlePlace.geometry.location.lat,
      lng: googlePlace.geometry.location.lng,
      is_verified: false,
      
      // Contact Information
      phone_number: googlePlace.international_phone_number || googlePlace.formatted_phone_number,
      website: googlePlace.website,
      formatted_address: googlePlace.formatted_address,
      international_phone_number: googlePlace.international_phone_number,
      
      // Ratings and Reviews
      rating: googlePlace.rating,
      user_ratings_total: googlePlace.user_ratings_total,
      price_level: googlePlace.price_level,
      
      // Categories and Features
      place_types: googlePlace.types,
      business_status: googlePlace.business_status,
      
      // Business Hours and Location
      opening_hours: googlePlace.opening_hours,
      timezone: timezone || 'Asia/Hong_Kong', // Use provided timezone or fallback
      google_url: googlePlace.url,
      
      // Metadata and Tracking
      last_updated: new Date().toISOString(),
      data_source: 'google_places',
    };
  }

  /**
   * Search places in database
   */
  async searchPlaces(
    query?: string,
    region?: string,
    limit: number = 50
  ): Promise<Place[]> {
    let queryBuilder = this.supabase
      .from('places')
      .select('*')
      .limit(limit);

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,formatted_address.ilike.%${query}%`);
    }

    if (region) {
      queryBuilder = queryBuilder.eq('region', region);
    }

    const { data, error } = await queryBuilder.order('name');

    if (error) {
      throw new Error(`Failed to search places: ${error.message}`);
    }

    return data as Place[];
  }

  /**
   * Get places by rating range
   */
  async getPlacesByRating(
    minRating: number,
    maxRating: number = 5,
    region?: string,
    limit: number = 50
  ): Promise<Place[]> {
    let queryBuilder = this.supabase
      .from('places')
      .select('*')
      .gte('rating', minRating)
      .lte('rating', maxRating)
      .limit(limit);

    if (region) {
      queryBuilder = queryBuilder.eq('region', region);
    }

    const { data, error } = await queryBuilder.order('rating', { ascending: false });

    if (error) {
      throw new Error(`Failed to get places by rating: ${error.message}`);
    }

    return data as Place[];
  }

  /**
   * Get places near coordinates
   */
  async getPlacesNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    limit: number = 50
  ): Promise<(Place & { distance: number })[]> {
    const { data, error } = await this.supabase.rpc('nearby_places', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
      result_limit: limit,
    });

    if (error) {
      throw new Error(`Failed to get nearby places: ${error.message}`);
    }

    return data as (Place & { distance: number })[];
  }

  /**
   * Get audit trail information
   */
  async getAuditTrail(placeId: string): Promise<{
    place: Place;
    created_at: string;
    updated_at: string;
    last_updated: string;
    data_source: string;
  }> {
    const { data, error } = await this.supabase
      .from('places')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }

    return {
      place: data as Place,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_updated: data.last_updated,
      data_source: data.data_source,
    };
  }

  /**
   * Mark a place as verified
   */
  async verifyPlace(placeId: string, verifiedBy?: string): Promise<Place> {
    const { data, error } = await this.supabase
      .from('places')
      .update({
        is_verified: true,
        verification_date: new Date().toISOString(),
        verified_by: verifiedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('place_id', placeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to verify place: ${error.message}`);
    }

    return data as Place;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalPlaces: number;
    verifiedPlaces: number;
    placesByRegion: Record<string, number>;
    placesByDataSource: Record<string, number>;
    averageRating: number;
  }> {
    const { data: total } = await this.supabase
      .from('places')
      .select('*', { count: 'exact', head: true });

    const { data: verified } = await this.supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    const { data: byRegion } = await this.supabase
      .from('places')
      .select('region')
      .not('region', 'is', null);

    const { data: bySource } = await this.supabase
      .from('places')
      .select('data_source')
      .not('data_source', 'is', null);

    const { data: avgRating } = await this.supabase
      .from('places')
      .select('rating')
      .not('rating', 'is', null);

    // Aggregate region counts
    const regionCounts = (byRegion || []).reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate source counts
    const sourceCounts = (bySource || []).reduce((acc, item) => {
      acc[item.data_source] = (acc[item.data_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average rating
    const ratings = (avgRating || []).map(item => item.rating).filter(r => r !== null);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      totalPlaces: total?.length || 0,
      verifiedPlaces: verified?.length || 0,
      placesByRegion: regionCounts,
      placesByDataSource: sourceCounts,
      averageRating: Number(averageRating.toFixed(2)),
    };
  }
}
