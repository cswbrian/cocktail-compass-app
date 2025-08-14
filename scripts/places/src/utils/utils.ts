import { Place } from '../../../../src/types/place';
import { GooglePlaceDetails } from '../types/types';

/**
 * Utility functions for the places ingestion pipeline
 */

/**
 * Calculate data completeness score for a place (0-100%)
 */
export function calculateDataCompleteness(place: GooglePlaceDetails | Place): number {
  const fields = [
    'name',
    'formatted_address',
    'phone_number',
    'website',
    'rating',
    'price_level',
    'place_types',
    'opening_hours',
  ];

  const optionalFields = [
    'user_ratings_total',
    'business_status',
    'wheelchair_accessible_entrance',
    'delivery',
    'dine_in',
    'takeout',
    'serves_cocktails',
    'serves_beer',
    'serves_wine',
    'outdoor_seating',
  ];

  const allFields = [...fields, ...optionalFields];
  let completedFields = 0;

  allFields.forEach(field => {
    const value = (place as any)[field];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      } else if (!Array.isArray(value)) {
        completedFields++;
      }
    }
  });

  return Math.round((completedFields / allFields.length) * 100);
}

/**
 * Format price level for display
 */
export function formatPriceLevel(priceLevel?: number): string {
  if (priceLevel === undefined || priceLevel === null) {
    return 'Unknown';
  }
  
  const levels = ['Free', '$', '$$', '$$$', '$$$$'];
  return levels[priceLevel] || 'Unknown';
}

/**
 * Format rating for display
 */
export function formatRating(rating?: number, userRatingsTotal?: number): string {
  if (!rating) {
    return 'No rating';
  }
  
  const stars = '⭐'.repeat(Math.round(rating));
  const totalText = userRatingsTotal ? ` (${userRatingsTotal} reviews)` : '';
  return `${rating}/5${totalText}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(
  phoneNumber?: string,
  internationalPhoneNumber?: string
): string {
  return internationalPhoneNumber || phoneNumber || 'Not available';
}

/**
 * Format opening hours for display
 */
export function formatOpeningHours(openingHours?: any): string {
  if (!openingHours || !openingHours.weekday_text) {
    return 'Hours not available';
  }
  
  return openingHours.weekday_text.join('\n');
}

/**
 * Extract main features from place types and attributes
 */
export function extractMainFeatures(place: GooglePlaceDetails | Place): string[] {
  const features: string[] = [];
  
  // Add based on place types - handle both GooglePlaceDetails and Place types
  let placeTypes: string[] = [];
  
  if ('place_types' in place && place.place_types) {
    // GooglePlaceDetails has place_types
    placeTypes = place.place_types;
  } else if ('types' in place && place.types) {
    // Some other type might have types
    placeTypes = place.types;
  }
  
  if (placeTypes.includes('bar')) features.push('Bar');
  if (placeTypes.includes('restaurant')) features.push('Restaurant');
  if (placeTypes.includes('night_club')) features.push('Nightclub');
  if (placeTypes.includes('cafe')) features.push('Cafe');
  
  // Features can be inferred from place types
  // Additional features could be added from other sources if needed
  
  return features;
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
}

/**
 * Validate phone number format (basic validation)
 */
export function validatePhoneNumber(phone?: string): boolean {
  if (!phone) return true; // Optional field
  
  // Basic international phone number pattern
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phonePattern.test(cleanPhone);
}

/**
 * Validate website URL
 */
export function validateWebsiteUrl(url?: string): boolean {
  if (!url) return true; // Optional field
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate rating value
 */
export function validateRating(rating?: number): boolean {
  if (rating === undefined || rating === null) return true; // Optional field
  return rating >= 0 && rating <= 5;
}

/**
 * Validate price level
 */
export function validatePriceLevel(priceLevel?: number): boolean {
  if (priceLevel === undefined || priceLevel === null) return true; // Optional field
  return Number.isInteger(priceLevel) && priceLevel >= 0 && priceLevel <= 4;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input?: string): string | undefined {
  if (!input) return undefined;
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Create a summary of place information for CLI display
 */
export function createPlaceSummary(place: GooglePlaceDetails): {
  title: string;
  address: string;
  contact: string;
  rating: string;
  features: string[];
  completeness: number;
} {
  const features = extractMainFeatures(place);
  const completeness = calculateDataCompleteness(place);
  
  return {
    title: place.name,
    address: place.formatted_address,
    contact: `${formatPhoneNumber(place.formatted_phone_number, place.international_phone_number)} | ${place.website || 'No website'}`,
    rating: `${formatRating(place.rating, place.user_ratings_total)} | ${formatPriceLevel(place.price_level)}`,
    features,
    completeness,
  };
}

/**
 * Check if a place is likely a bar/drinking establishment
 */
export function isLikelyBar(place: GooglePlaceDetails): boolean {
  const types = place.types || [];
  const name = place.name.toLowerCase();
  
  // Direct type matches
  if (types.includes('bar') || types.includes('night_club') || types.includes('liquor_store')) {
    return true;
  }
  
  // Name-based detection (common bar/pub keywords)
  const barKeywords = [
    'bar', 'pub', 'tavern', 'lounge', 'brewery', 'cocktail', 'speakeasy',
    'wine bar', 'beer garden', 'sports bar', 'rooftop bar', 'craft beer'
  ];
  
  return barKeywords.some(keyword => name.includes(keyword));
}

/**
 * Sleep utility for adding delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Create a progress bar string
 */
export function createProgressBar(current: number, total: number, width: number = 20): string {
  const percentage = total > 0 ? current / total : 0;
  const filled = Math.floor(percentage * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(percentage * 100);
  
  return `[${bar}] ${percent}% (${current}/${total})`;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Deep merge two objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}
