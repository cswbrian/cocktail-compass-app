# Technical Specification - Offline Data Ingestion Flow

## 🎯 System Requirements

### Functional Requirements
1. **Venue Data Ingestion**: Process bar names and fetch comprehensive venue information
2. **Google Places Integration**: Fetch detailed place data including opening hours and contact info
3. **Supabase Upsert**: Insert new venues or update existing ones with latest data
4. **Data Validation**: Ensure data quality and completeness before database operations
5. **User Confirmation**: Provide interactive review and confirmation before upserting
6. **Batch Processing**: Handle multiple venues efficiently with rate limiting
7. **Environment Management**: Support staging and production environments
8. **Reusability**: Pipeline can be re-run anytime with new venue lists

### Non-Functional Requirements
- **Performance**: Process venues in <2 seconds each
- **Reliability**: >95% success rate for upsert operations
- **Scalability**: Handle 1000+ venues efficiently
- **Maintainability**: Clear separation of concerns and modular design
- **Security**: Secure handling of API keys and database credentials
- **Monitoring**: Comprehensive logging and error tracking

## 🏗 System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Input Files  │    │  Google Places   │    │    Supabase     │
│  (JSON/TXT)    │───▶│      API         │───▶│    Database     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Validation &   │    │   Rate Limiting  │    │   Audit Trail   │
│   Confirmation  │    │   & Retry Logic  │    │   & Logging     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture
```
scripts/venues/
├── ingest-venues.ts              # Main orchestration script
├── cli.ts                        # Command-line interface
├── config.ts                     # Environment configuration
├── venue-types.ts                # TypeScript type definitions
├── google-places-service.ts      # Google Places API wrapper
├── supabase-venue-service.ts     # Supabase operations
├── validation.ts                 # Data validation logic
├── rate-limiter.ts               # API rate limiting
├── progress.ts                   # Progress tracking
├── reporting.ts                  # Report generation
└── utils.ts                      # Utility functions
```

## 🔧 Technical Implementation

### 1. Google Places API Integration

#### API Endpoints
- **Place Search**: `https://maps.googleapis.com/maps/api/place/textsearch/json`
- **Place Details**: `https://maps.googleapis.com/maps/api/place/details/json`
- **Libraries**: `places` library for comprehensive data

#### Required Fields Mapping
```typescript
interface GooglePlaceDetails {
  // Core identification
  place_id: string;                    // Unique Google identifier
  name: string;                        // Venue name
  formatted_address: string;           // Full address
  
  // Geographic coordinates
  geometry: {
    location: {
      lat: number;                     // Latitude
      lng: number;                     // Longitude
    };
    viewport?: {
      northeast: { lat: number; lng: number; };
      southwest: { lat: number; lng: number; };
    };
  };
  
  // Business information
  opening_hours?: {
    open_now: boolean;                 // Current open/closed status
    periods: OpeningPeriod[];          // Detailed schedule
    weekday_text: string[];            // Human-readable schedule
  };
  
  // Contact details
  formatted_phone_number?: string;     // Phone number
  international_phone_number?: string; // International format
  website?: string;                    // Official website
  url?: string;                        // Google Maps URL
  
  // Ratings and reviews
  rating?: number;                     // Average rating (0-5)
  user_ratings_total?: number;         // Total number of reviews
  price_level?: number;                // Price range (0-4)
  
  // Categories and types
  types: string[];                     // Place categories
  business_status?: string;            // Operational status
  
  // Additional features
  wheelchair_accessible_entrance?: boolean;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  serves_beer?: boolean;
  serves_cocktails?: boolean;
  serves_wine?: boolean;
  serves_breakfast?: boolean;
  serves_lunch?: boolean;
  serves_dinner?: boolean;
  serves_brunch?: boolean;
  outdoor_seating?: boolean;
  live_music?: boolean;
  happy_hour?: boolean;
  
  // Photos and media
  photos?: PlacePhoto[];
  
  // Reviews
  reviews?: PlaceReview[];
}

interface OpeningPeriod {
  open: {
    day: number;                       // 0-6 (Sunday-Saturday)
    time: string;                      // HHMM format
  };
  close: {
    day: number;                       // 0-6 (Sunday-Saturday)
    time: string;                      // HHMM format
  };
}
```

#### Rate Limiting Strategy
```typescript
class GooglePlacesRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100;  // Google's limit per second
  private readonly windowMs = 1000;    // 1 second sliding window
  private readonly maxRetries = 3;     // Maximum retry attempts
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // If at limit, wait until we can make another request
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Record this request
    this.requests.push(now);
  }
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryDelay = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.waitIfNeeded();
        return await operation();
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

### 2. Supabase Database Integration

#### Enhanced Places Table Schema
```sql
-- Migration: 20250113_001_enhance_places_table.sql

-- Add new columns for comprehensive venue information
ALTER TABLE places ADD COLUMN IF NOT EXISTS:
  -- Contact Information
  phone_number text,
  website text,
  formatted_address text,
  international_phone_number text,
  
  -- Ratings and Reviews
  rating numeric(3,2) CHECK (rating >= 0 AND rating <= 5),
  user_ratings_total integer CHECK (user_ratings_total >= 0),
  price_level integer CHECK (price_level >= 0 AND price_level <= 4),
  
  -- Categories and Features
  place_types text[],
  business_status text DEFAULT 'OPERATIONAL',
  
  -- Accessibility and Services
  wheelchair_accessible_entrance boolean DEFAULT false,
  delivery boolean DEFAULT false,
  dine_in boolean DEFAULT true,
  takeout boolean DEFAULT false,
  reservable boolean DEFAULT false,
  
  -- Food and Beverage Services
  serves_beer boolean DEFAULT false,
  serves_cocktails boolean DEFAULT false,
  serves_wine boolean DEFAULT false,
  serves_breakfast boolean DEFAULT false,
  serves_lunch boolean DEFAULT false,
  serves_dinner boolean DEFAULT false,
  serves_brunch boolean DEFAULT false,
  
  -- Venue Features
  outdoor_seating boolean DEFAULT false,
  live_music boolean DEFAULT false,
  happy_hour boolean DEFAULT false,
  
  -- Business Hours
  opening_hours jsonb,
  timezone text DEFAULT 'Asia/Hong_Kong',
  is_open boolean GENERATED ALWAYS AS (
    CASE 
      WHEN opening_hours IS NULL THEN NULL
      WHEN (opening_hours->>'open_now')::boolean THEN true
      ELSE false
    END
  ) STORED,
  
  -- Metadata and Tracking
  last_updated timestamptz DEFAULT now(),
  data_source text DEFAULT 'google_places',
  is_verified boolean DEFAULT false,
  verification_date timestamptz,
  verified_by uuid REFERENCES users(id),
  
  -- Add Google Places specific fields
  google_photos jsonb,          -- Stored photo references
  google_reviews jsonb;         -- Stored review data
```

#### Performance Indexes
```sql
-- Add indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_places_rating ON places (rating);
CREATE INDEX IF NOT EXISTS idx_places_price_level ON places (price_level);
CREATE INDEX IF NOT EXISTS idx_places_place_types ON places USING GIN (place_types);
CREATE INDEX IF NOT EXISTS idx_places_business_status ON places (business_status);
CREATE INDEX IF NOT EXISTS idx_places_last_updated ON places (last_updated);
CREATE INDEX IF NOT EXISTS idx_places_data_source ON places (data_source);
CREATE INDEX IF NOT EXISTS idx_places_is_verified ON places (is_verified);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_places_region_rating ON places (region, rating);
CREATE INDEX IF NOT EXISTS idx_places_region_price ON places (region, price_level);
CREATE INDEX IF NOT EXISTS idx_places_region_types ON places (region, place_types);
```

#### Upsert Operations
```typescript
interface UpsertResult {
  type: 'inserted' | 'updated' | 'skipped' | 'error';
  data?: any;
  error?: any;
  changes?: {
    added: string[];
    updated: string[];
    unchanged: string[];
    errors: string[];
  };
}

class SupabaseVenueService {
  async upsertVenue(venue: VenueData): Promise<UpsertResult> {
    try {
      // Check for existing venue by place_id
      const { data: existing, error: fetchError } = await this.supabase
        .from('places')
        .select('*')
        .eq('place_id', venue.place_id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existing) {
        // Update existing venue
        const { data, error } = await this.supabase
          .from('places')
          .update({
            ...venue,
            updated_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .eq('place_id', venue.place_id)
          .select()
          .single();
          
        if (error) throw error;
        
        return { 
          type: 'updated', 
          data,
          changes: { updated: [venue.place_id], added: [], unchanged: [], errors: [] }
        };
      } else {
        // Insert new venue
        const { data, error } = await this.supabase
          .from('places')
          .insert({
            ...venue,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return { 
          type: 'inserted', 
          data,
          changes: { added: [venue.place_id], updated: [], unchanged: [], errors: [] }
        };
      }
    } catch (error) {
      return { 
        type: 'error', 
        error,
        changes: { added: [], updated: [], unchanged: [], errors: [venue.place_id] }
      };
    }
  }
  
  async batchUpsert(venues: VenueData[]): Promise<BatchUpsertResult> {
    const results: UpsertResult[] = [];
    const changes = { added: [], updated: [], unchanged: [], errors: [] };
    
    for (const venue of venues) {
      const result = await this.upsertVenue(venue);
      results.push(result);
      
      // Aggregate changes
      if (result.changes) {
        changes.added.push(...result.changes.added);
        changes.updated.push(...result.changes.updated);
        changes.unchanged.push(...result.changes.unchanged);
        changes.errors.push(...result.changes.errors);
      }
    }
    
    return {
      results,
      summary: {
        total: venues.length,
        inserted: changes.added.length,
        updated: changes.updated.length,
        skipped: changes.unchanged.length,
        errors: changes.errors.length,
        successRate: ((changes.added.length + changes.updated.length) / venues.length) * 100
      },
      changes
    };
  }
}
```

### 3. Data Validation and Quality

#### Input Validation
```typescript
import { z } from 'zod';

const VenueInputSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  region: z.enum(['hongkong', 'taiwan']).optional(),
  searchQuery: z.string().optional()
});

const GooglePlaceDetailsSchema = z.object({
  place_id: z.string().min(1),
  name: z.string().min(1),
  formatted_address: z.string().min(1),
  geometry: z.object({
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    })
  }),
  opening_hours: z.object({
    open_now: z.boolean().optional(),
    weekday_text: z.array(z.string()).optional()
  }).optional(),
  formatted_phone_number: z.string().optional(),
  website: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  user_ratings_total: z.number().int().min(0).optional(),
  price_level: z.number().int().min(0).max(4).optional(),
  types: z.array(z.string()).min(1)
});

const VenueDataSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  main_text: z.string().optional(),
  secondary_text: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  region: z.string(),
  phone_number: z.string().optional(),
  website: z.string().optional(),
  formatted_address: z.string().optional(),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  price_level: z.number().optional(),
  place_types: z.array(z.string()).optional(),
  opening_hours: z.any().optional(),
  timezone: z.string().default('Asia/Hong_Kong'),
  is_verified: z.boolean().default(false)
});
```

#### Data Quality Checks
```typescript
class DataQualityValidator {
  validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
  
  validatePhoneNumber(phone: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
  
  validateWebsite(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  validateOpeningHours(hours: any): boolean {
    if (!hours || typeof hours !== 'object') return false;
    
    // Check for required fields
    if (hours.weekday_text && Array.isArray(hours.weekday_text)) {
      return hours.weekday_text.length === 7; // 7 days of the week
    }
    
    return true;
  }
  
  calculateDataCompleteness(venue: VenueData): number {
    const requiredFields = ['name', 'lat', 'lng', 'place_id'];
    const optionalFields = [
      'phone_number', 'website', 'formatted_address', 'rating',
      'opening_hours', 'place_types'
    ];
    
    const totalFields = requiredFields.length + optionalFields.length;
    let completedFields = 0;
    
    // Required fields must be present
    for (const field of requiredFields) {
      if (venue[field] !== undefined && venue[field] !== null) {
        completedFields++;
      }
    }
    
    // Optional fields add to completeness
    for (const field of optionalFields) {
      if (venue[field] !== undefined && venue[field] !== null) {
        completedFields++;
      }
    }
    
    return (completedFields / totalFields) * 100;
  }
}
```

### 4. Command Line Interface

#### Argument Parsing
```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('ingest-venues')
  .description('Ingest venue data from Google Places API to Supabase')
  .version('1.0.0');

program
  .option('-i, --input <file>', 'Input file (JSON or TXT format)', 'venues-input.json')
  .option('-e, --environment <env>', 'Supabase environment', 'staging')
  .option('-r, --region <region>', 'Default region', 'hongkong')
  .option('-b, --batch-size <number>', 'Batch size for processing', '10')
  .option('-d, --delay <ms>', 'Delay between API calls (ms)', '1000')
  .option('--confirm', 'Skip confirmation prompts')
  .option('--dry-run', 'Preview changes without updating database')
  .option('--update-existing', 'Update existing venues')
  .option('--verbose', 'Enable verbose logging')
  .option('--output <file>', 'Output report file')
  .option('--resume <file>', 'Resume from checkpoint file');

program.parse(process.argv);

const options = program.opts();
```

#### Interactive Confirmation
```typescript
import readline from 'readline';
import { createInterface } from 'readline';

class InteractiveConfirmation {
  private rl: readline.Interface;
  
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  
  async confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }
  
  async confirmBatch(venues: VenueData[], changes: BatchChanges): Promise<boolean> {
    console.log('\n📋 Batch Summary:');
    console.log(`  • Total venues: ${venues.length}`);
    console.log(`  • New venues: ${changes.added.length}`);
    console.log(`  • Updated venues: ${changes.updated.length}`);
    console.log(`  • Skipped venues: ${changes.unchanged.length}`);
    console.log(`  • Errors: ${changes.errors.length}`);
    
    return this.confirm('Proceed with this batch?');
  }
  
  async confirmIndividual(venue: VenueData, action: 'insert' | 'update'): Promise<boolean> {
    console.log(`\n📍 ${action === 'insert' ? 'New' : 'Update'} Venue:`);
    console.log(`  • Name: ${venue.name}`);
    console.log(`  • Address: ${venue.formatted_address || venue.main_text}`);
    console.log(`  • Location: ${venue.lat}, ${venue.lng}`);
    console.log(`  • Region: ${venue.region}`);
    
    if (venue.phone_number) console.log(`  • Phone: ${venue.phone_number}`);
    if (venue.website) console.log(`  • Website: ${venue.website}`);
    if (venue.rating) console.log(`  • Rating: ${venue.rating}/5`);
    
    return this.confirm(`Confirm ${action} for this venue?`);
  }
  
  close(): void {
    this.rl.close();
  }
}
```

### 5. Progress Tracking and Reporting

#### Progress Indicators
```typescript
class ProgressTracker {
  private total: number;
  private current: number;
  private startTime: number;
  private lastUpdate: number;
  
  constructor(total: number) {
    this.total = total;
    this.current = 0;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
  }
  
  update(increment: number = 1): void {
    this.current += increment;
    const now = Date.now();
    
    // Update every 500ms to avoid console spam
    if (now - this.lastUpdate > 500) {
      this.displayProgress();
      this.lastUpdate = now;
    }
  }
  
  private displayProgress(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const estimated = this.total > 0 ? (elapsed / this.current) * (this.total - this.current) : 0;
    
    const progressBar = this.createProgressBar(percentage);
    
    process.stdout.write(`\r${progressBar} ${percentage}% | ${this.current}/${this.total} | ETA: ${this.formatTime(estimated)}`);
  }
  
  private createProgressBar(percentage: number): string {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }
  
  private formatTime(ms: number): string {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h`;
  }
  
  complete(): void {
    this.current = this.total;
    this.displayProgress();
    console.log('\n✅ Processing complete!');
  }
}
```

#### Report Generation
```typescript
interface ProcessingReport {
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    successRate: number;
    processingTime: number;
    averageTimePerVenue: number;
  };
  details: {
    inserted: VenueData[];
    updated: VenueData[];
    skipped: VenueData[];
    errors: {
      venue: VenueData;
      error: string;
      timestamp: string;
    }[];
  };
  metadata: {
    environment: string;
    region: string;
    timestamp: string;
    version: string;
  };
}

class ReportGenerator {
  generateReport(results: BatchUpsertResult[], options: any): ProcessingReport {
    const totalProcessed = results.reduce((sum, r) => sum + r.summary.total, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.summary.inserted + r.summary.updated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.summary.errors, 0);
    
    return {
      summary: {
        totalProcessed,
        successful: totalSuccessful,
        failed: totalFailed,
        successRate: (totalSuccessful / totalProcessed) * 100,
        processingTime: Date.now() - options.startTime,
        averageTimePerVenue: totalProcessed > 0 ? (Date.now() - options.startTime) / totalProcessed : 0
      },
      details: {
        inserted: results.flatMap(r => r.changes.added),
        updated: results.flatMap(r => r.changes.updated),
        skipped: results.flatMap(r => r.changes.unchanged),
        errors: results.flatMap(r => r.changes.errors.map(error => ({
          venue: error,
          error: 'Unknown error',
          timestamp: new Date().toISOString()
        })))
      },
      metadata: {
        environment: options.environment,
        region: options.region,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
  
  saveReport(report: ProcessingReport, filename: string): void {
    const reportData = {
      ...report,
      generatedAt: new Date().toISOString(),
      format: 'json'
    };
    
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`📊 Report saved to: ${filename}`);
  }
  
  displayReport(report: ProcessingReport): void {
    console.log('\n📊 Processing Report');
    console.log('==================');
    console.log(`Total Processed: ${report.summary.totalProcessed}`);
    console.log(`Successful: ${report.summary.successful}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`Processing Time: ${this.formatTime(report.summary.processingTime)}`);
    console.log(`Average Time per Venue: ${this.formatTime(report.summary.averageTimePerVenue)}`);
    
    if (report.details.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.details.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.venue.name}: ${error.error}`);
      });
    }
  }
  
  private formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }
}
```

## 🔒 Security Considerations

### API Key Management
- Store API keys in environment variables
- Never commit keys to version control
- Use different keys for staging/production
- Implement key rotation strategy

### Database Security
- Use Supabase Row Level Security (RLS)
- Implement proper authentication
- Validate all input data
- Log all database operations

### Error Handling
- Don't expose sensitive information in error messages
- Implement proper error logging
- Handle rate limiting gracefully
- Provide user-friendly error messages

## 📊 Performance Optimization

### Batch Processing
- Process venues in configurable batches
- Implement parallel processing where possible
- Use connection pooling for database operations
- Implement progress tracking and resumability

### Caching Strategy
- Cache Google Places API responses
- Implement intelligent retry logic
- Store processed data for validation
- Use Supabase caching features

### Memory Management
- Stream large input files
- Process data in chunks
- Clean up resources properly
- Monitor memory usage

---

*Technical Specification - Offline Data Ingestion Flow*  
*Part of Cocktail Compass App - Map Feature*  
*Last Updated: January 13, 2025*
