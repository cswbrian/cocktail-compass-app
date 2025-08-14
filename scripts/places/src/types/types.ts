// Data ingestion specific types - not used by the main app
export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  opening_hours?: {
    open_now?: boolean;
    periods?: OpeningPeriod[];
    weekday_text?: string[];
  };
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  business_status?: string;
  
  // Accessibility and services
  wheelchair_accessible_entrance?: boolean;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  
  // Food and beverage services
  serves_beer?: boolean;
  serves_cocktails?: boolean;
  serves_wine?: boolean;
  serves_breakfast?: boolean;
  serves_lunch?: boolean;
  serves_dinner?: boolean;
  serves_brunch?: boolean;
  
  // Venue features
  outdoor_seating?: boolean;
  live_music?: boolean;
  happy_hour?: boolean;
  
  // Photos and reviews
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }>;
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    language: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
}

export interface OpeningPeriod {
  open: {
    day: number; // 0-6 (Sunday-Saturday)
    time: string; // HHMM format
  };
  close: {
    day: number; // 0-6 (Sunday-Saturday)
    time: string; // HHMM format
  };
}

// Data ingestion input types
export interface PlaceInput {
  name: string;
  searchQuery?: string;
  tags?: string[];
  description?: string;
  show_on_map?: boolean;
}

// Data ingestion result types
export interface UpsertResult {
  type: 'inserted' | 'updated' | 'skipped' | 'error';
  data?: any; // Using 'any' to avoid circular dependency with Place
  error?: any;
  changes?: {
    added: string[];
    updated: string[];
    unchanged: string[];
    errors: string[];
  };
}

export interface BatchUpsertResult {
  results: UpsertResult[];
  summary: {
    total: number;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
    successRate: number;
  };
  changes: {
    added: string[];
    updated: string[];
    unchanged: string[];
    errors: string[];
  };
}
