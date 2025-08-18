import { Place } from '../../../../src/types/place';
import { GooglePlaceDetails } from '../types/types';
import { config } from '../../config';
import { GooglePlacesRateLimiter, ExponentialBackoff } from '../utils/rate-limiter';

/**
 * Google Places API service using direct HTTP requests
 * More reliable than the google-maps-services library for server-side usage
 * 
 * Uses Text Search Essentials (IDs only) for cost optimization:
 * - Text Search API returns minimal data (place_id, basic info)
 * - Place Details API provides comprehensive information
 * - This approach reduces costs while maintaining full functionality
 */
export class GooglePlacesService {
  private rateLimiter: GooglePlacesRateLimiter;
  private backoff: ExponentialBackoff;
  private apiKey: string;
  private requestCount: number = 0;
  private startTime: number = Date.now();
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = config.google.placesApiKey || config.google.apiKey;
    
    if (!this.apiKey) {
      throw new Error('Google Places API key is required');
    }

    this.rateLimiter = new GooglePlacesRateLimiter(
      config.venues.rateLimitPerSecond,
      1000 // 1 second window
    );
    
    this.backoff = new ExponentialBackoff(
      config.venues.delayMs,
      30000, // max 30 seconds
      config.venues.maxRetries
    );
  }

  /**
   * Search for places using text query with fallback strategies
   * Uses Text Search Essentials (IDs only) for cost optimization
   */
  async searchPlaces(query: string, location?: string): Promise<GooglePlaceDetails[]> {
    // Clean up the query
    const cleanQuery = this.cleanSearchQuery(query);
    
    // Try primary search first
    let results = await this.performSearch(cleanQuery, location);
    
    // If no results, try fallback strategies
    if (results.length === 0) {
      console.log(`  🔍 No results for "${cleanQuery}", trying fallback searches...`);
      
      // Try with "bar" suffix
      const barQuery = `${cleanQuery} bar`;
      results = await this.performSearch(barQuery, location);
      
      // If still no results, try with "restaurant" suffix
      if (results.length === 0) {
        const restaurantQuery = `${cleanQuery} restaurant`;
        results = await this.performSearch(restaurantQuery, location);
      }
      
      // If still no results, try with "cafe" suffix
      if (results.length === 0) {
        const cafeQuery = `${cleanQuery} cafe`;
        results = await this.performSearch(cafeQuery, location);
      }
      
      // If still no results, try with just the main part of the name
      if (results.length === 0 && cleanQuery.includes(' ')) {
        const mainPart = cleanQuery.split(' ')[0];
        console.log(`  🔍 Trying main part of name: "${mainPart}"`);
        results = await this.performSearch(mainPart, location);
      }
    }
    
    return results;
  }

  /**
   * Clean up search query for better results
   */
  private cleanSearchQuery(query: string): string {
    return query
      .replace(/[\(\)]/g, '') // Remove parentheses
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();
  }

  /**
   * Perform the actual search with given parameters
   * Uses Text Search Essentials (IDs only) for cost optimization
   */
  private async performSearch(query: string, location?: string): Promise<GooglePlaceDetails[]> {
    const params = new URLSearchParams({
      query,
      key: this.apiKey,
      // Text Search Essentials returns minimal data - just enough to identify places
      // We'll get full details via Place Details API calls
    });

    // Add location context if provided to improve search accuracy
    if (location) {
      params.append('location', location);
      params.append('radius', '50000'); // 50km radius
    }

    const url = `${this.baseUrl}/textsearch/json?${params}`;

    try {
      await this.rateLimiter.waitIfNeeded();
      
      const response = await this.backoff.execute(
        async () => {
          this.requestCount++;
          const result = await fetch(url);
          const data = await result.json();
          
          this.logApiUsage('textSearch', result.status);
          
          if (!result.ok) {
            throw new Error(`HTTP ${result.status}: ${result.statusText}`);
          }
          
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
          }
          
          return data;
        },
        (attempt, error) => {
          console.warn(`Text search retry attempt ${attempt} for query "${query}":`, error instanceof Error ? error.message : String(error));
        }
      );

      // Text Search Essentials returns minimal data - extract only place_id and basic info
      // Full details will be retrieved via Place Details API calls
      return (response.results || []).map((place: any) => ({
        place_id: place.place_id,
        name: place.name || 'Unknown Place', // Keep name for logging/debugging
        formatted_address: place.formatted_address || '',
        geometry: {
          location: {
            lat: place.geometry?.location?.lat || 0,
            lng: place.geometry?.location?.lng || 0,
          },
          viewport: place.geometry?.viewport ? {
            northeast: place.geometry.viewport.northeast,
            southwest: place.geometry.viewport.southwest,
          } : undefined,
        },
        // Minimal data from Text Search Essentials
        types: place.types || [],
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        price_level: place.price_level,
        business_status: place.business_status,
        // Other fields will be populated by Place Details API calls
        opening_hours: undefined,
        formatted_phone_number: undefined,
        international_phone_number: undefined,
        website: undefined,
        url: undefined,
      }));
    } catch (error) {
      this.logError('searchPlaces', error, { query });
      console.error(`  🔍 Search failed for "${query}":`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get detailed information for a specific place
   * This is the main method for retrieving comprehensive place data after getting place_id from search
   */
  async getPlaceDetails(placeId: string, includeAtmosphereData: boolean = false): Promise<GooglePlaceDetails> {
    const fields = [
      // Basic information
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      
      // Contact information
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'url',
      
      // Ratings and reviews
      'rating',
      'user_ratings_total',
      'price_level',
      
      // Categories and features
      'types',
      'business_status',
      
      // Business hours
      'opening_hours',
      
      // Photos and reviews (optional for basic ingestion)
      'photos',
      'reviews',
    ];

    // Only include atmosphere/food service fields if specifically requested
    if (includeAtmosphereData) {
      fields.push(
        // Accessibility and services
        'wheelchair_accessible_entrance',
        'delivery',
        'dine_in',
        'takeout',
        'reservable',
        
        // Food and beverage services
        'serves_beer',
        'serves_cocktails',
        'serves_wine',
        'serves_breakfast',
        'serves_lunch',
        'serves_dinner',
        'serves_brunch',
        
        // Venue features
        'outdoor_seating',
        'live_music',
        'happy_hour'
      );
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: this.apiKey,
      fields: fields.join(','),
    });

    const url = `${this.baseUrl}/details/json?${params}`;

    try {
      await this.rateLimiter.waitIfNeeded();
      
      const response = await this.backoff.execute(
        async () => {
          this.requestCount++;
          const result = await fetch(url);
          const data = await result.json();
          
          this.logApiUsage('placeDetails', result.status);
          
          if (!result.ok) {
            throw new Error(`HTTP ${result.status}: ${result.statusText}`);
          }
          
          if (data.status !== 'OK') {
            throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
          }
          
          if (!data.result) {
            throw new Error(`No place details found for place_id: ${placeId}`);
          }
          
          return data;
        },
        (attempt, error) => {
          console.warn(`Place details retry attempt ${attempt} for place_id "${placeId}":`, error instanceof Error ? error.message : String(error));
        }
      );

      return this.mapGooglePlaceToDetails(response.result);
    } catch (error) {
      this.logError('getPlaceDetails', error, { placeId });
      throw error;
    }
  }

  /**
   * Search for places near a location (basic info only)
   * Returns minimal data - full details should be retrieved via Place Details API
   */
  async searchNearby(
    lat: number, 
    lng: number, 
    radius: number = 1000,
    type: string = 'bar'
  ): Promise<GooglePlaceDetails[]> {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      type,
      key: this.apiKey,
    });

    const url = `${this.baseUrl}/nearbysearch/json?${params}`;

    try {
      await this.rateLimiter.waitIfNeeded();
      
      const response = await this.backoff.execute(
        async () => {
          this.requestCount++;
          const result = await fetch(url);
          const data = await result.json();
          
          this.logApiUsage('placesNearby', result.status);
          
          if (!result.ok) {
            throw new Error(`HTTP ${result.status}: ${result.statusText}`);
          }
          
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
          }
          
          return data;
        },
        (attempt, error) => {
          console.warn(`Nearby search retry attempt ${attempt} for location (${lat}, ${lng}):`, error instanceof Error ? error.message : String(error));
        }
      );

      return (response.results || []).map((place: any) => this.mapGooglePlaceToDetails(place));
    } catch (error) {
      this.logError('searchNearby', error, { lat, lng, radius, type });
      throw error;
    }
  }

  /**
   * Search for places near a location with full details (including opening hours)
   * Demonstrates the proper workflow: basic search → place IDs → full details via Place Details API
   */
  async searchNearbyWithDetails(
    lat: number, 
    lng: number, 
    radius: number = 1000,
    type: string = 'bar',
    maxPlaces: number = 20
  ): Promise<GooglePlaceDetails[]> {
    console.log(`🔍 Searching for ${type}s near (${lat}, ${lng}) with radius ${radius}m...`);
    
    // First get basic search results
    const basicResults = await this.searchNearby(lat, lng, radius, type);
    
    if (basicResults.length === 0) {
      return [];
    }
    
    // Limit the number of places to get full details for (to avoid hitting rate limits)
    const limitedResults = basicResults.slice(0, maxPlaces);
    
    console.log(`📋 Found ${basicResults.length} places, getting full details for ${limitedResults.length}...`);
    
    // Get full details for each place
    const detailedResults: GooglePlaceDetails[] = [];
    
          for (let i = 0; i < limitedResults.length; i++) {
        const place = limitedResults[i];
        try {
          console.log(`  ${i + 1}/${limitedResults.length}: Getting details for ${place.name}...`);
          const details = await this.getPlaceDetails(place.place_id);
          

          
          detailedResults.push(details);
          
          // Small delay to be respectful to the API
          if (i < limitedResults.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get details for ${place.name}:`, error instanceof Error ? error.message : String(error));
          // Add the basic result if we can't get details
          detailedResults.push(place);
        }
      }
    
    console.log(`✅ Successfully retrieved full details for ${detailedResults.length} places`);
    return detailedResults;
  }

  /**
   * Map Google Places API response to our GooglePlaceDetails interface
   * Used for mapping Place Details API responses (comprehensive data)
   * Text Search responses are handled directly in performSearch for cost optimization
   */
  private mapGooglePlaceToDetails(place: any): GooglePlaceDetails {
    return {
      place_id: place.place_id,
      name: place.name || '',
      formatted_address: place.formatted_address || '',
      geometry: {
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0,
        },
        viewport: place.geometry?.viewport ? {
          northeast: place.geometry.viewport.northeast,
          southwest: place.geometry.viewport.southwest,
        } : undefined,
      },
      opening_hours: place.opening_hours ? {
        open_now: place.opening_hours.open_now,
        periods: place.opening_hours.periods,
        weekday_text: place.opening_hours.weekday_text,
      } : undefined,
      formatted_phone_number: place.formatted_phone_number,
      international_phone_number: place.international_phone_number,
      website: place.website,
      url: place.url,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      types: place.types || [],
      business_status: place.business_status,
    };
  }

  /**
   * Convert GooglePlaceDetails to our Place interface for database storage
   */
  async convertToPlace(googlePlace: GooglePlaceDetails): Promise<Omit<Place, 'id' | 'created_at' | 'updated_at'>> {
    const addressParts = googlePlace.formatted_address.split(',');
    const mainText = googlePlace.name;
    const secondaryText = addressParts.length > 1 ? addressParts.slice(0, -1).join(',').trim() : null;

    // Get dynamic timezone based on coordinates
    const timezone = await this.getPlaceTimezone(
      googlePlace.geometry.location.lat,
      googlePlace.geometry.location.lng
    );

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
      timezone: timezone, // Dynamic timezone from Google Time Zone API
      google_url: googlePlace.url,
      
      // Metadata and Tracking
      last_updated: new Date().toISOString(),
      data_source: 'google_places',
    };
  }

  /**
   * Get timezone for a location using Google Time Zone API
   */
  async getPlaceTimezone(lat: number, lng: number): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${this.apiKey}`;
    
    try {
      await this.rateLimiter.waitIfNeeded();
      
      const response = await this.backoff.execute(
        async () => {
          this.requestCount++;
          const result = await fetch(url);
          const data = await result.json();
          
          this.logApiUsage('timeZone', result.status);
          
          if (!result.ok) {
            throw new Error(`HTTP ${result.status}: ${result.statusText}`);
          }
          
          if (data.status !== 'OK') {
            throw new Error(`Google Time Zone API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
          }
          
          return data;
        },
        (attempt, error) => {
          console.warn(`Time zone API retry attempt ${attempt} for location (${lat}, ${lng}):`, error instanceof Error ? error.message : String(error));
        }
      );

      if (response.timeZoneId) {
        return response.timeZoneId; // e.g., "Asia/Hong_Kong"
      }
      
      // Fallback to region-based detection if timezone not found
      return this.getTimezoneFromCoordinates(lat, lng);
      
    } catch (error) {
      this.logError('getPlaceTimezone', error, { lat, lng });
      // Fallback to coordinate-based detection
      return this.getTimezoneFromCoordinates(lat, lng);
    }
  }

  /**
   * Fallback timezone detection based on coordinates
   * @deprecated This method will be removed in future versions as region concept is being phased out
   */
  private getTimezoneFromCoordinates(lat: number, lng: number): string {
    // DEPRECATED: Hardcoded region logic will be removed
    // Use Google Time Zone API instead for accurate timezone detection
    
    // Fallback to Hong Kong timezone for backward compatibility
    // TODO: Remove this method when region concept is fully removed
    console.warn('Hardcoded region-based timezone detection is deprecated. Use Google Time Zone API instead.');
    
    // Default fallback
    return 'Asia/Hong_Kong';
  }

  /**
   * Get API usage statistics
   */
  getUsageStats(): {
    requestCount: number;
    requestsPerSecond: number;
    elapsedTimeMs: number;
    currentRateLimit: number;
  } {
    const elapsedTimeMs = Date.now() - this.startTime;
    const requestsPerSecond = this.requestCount / (elapsedTimeMs / 1000);
    
    return {
      requestCount: this.requestCount,
      requestsPerSecond: Number(requestsPerSecond.toFixed(2)),
      elapsedTimeMs,
      currentRateLimit: this.rateLimiter.getCurrentRequestCount(),
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.requestCount = 0;
    this.startTime = Date.now();
    this.rateLimiter.reset();
  }

  /**
   * Log API usage for monitoring
   */
  private logApiUsage(operation: string, status: number): void {
    const stats = this.getUsageStats();
    if (config.logging.level === 'debug') {
      console.debug(`[GooglePlacesService] ${operation} - Status: ${status}, Requests: ${stats.requestCount}, Rate: ${stats.requestsPerSecond}/s`);
    }
  }

  /**
   * Log errors with context
   */
  private logError(operation: string, error: any, context: any): void {
    console.error(`[GooglePlacesService] ${operation} failed:`, {
      error: error instanceof Error ? error.message : String(error),
      context,
      stack: error instanceof Error ? error.stack : undefined,
      usage: this.getUsageStats(),
    });
  }
}
