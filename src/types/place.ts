export interface Place {
  id: string;
  place_id: string;
  name: string;
  main_text: string;
  secondary_text: string | null;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  
  // Contact Information
  phone_number?: string;
  website?: string;
  formatted_address?: string;
  international_phone_number?: string;
  
  // Ratings and Reviews
  rating?: number; // 0-5 scale
  user_ratings_total?: number;
  price_level?: number; // 0-4 scale
  
  // Categories and Features
  place_types?: string[];
  business_status?: string;
  
  // Business Hours and Location
  opening_hours?: any; // JSON structure from Google Places API
  timezone?: string;
  google_url?: string; // Google Maps URL
  is_open?: boolean | null; // Computed open/closed status based on opening hours and timezone
  
  // Metadata and Tracking
  last_updated?: string;
  data_source?: string;
  verification_date?: string;
  verified_by?: string;
}






