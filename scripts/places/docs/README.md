# Places Data Ingestion Pipeline

## Overview

This directory contains the offline data ingestion pipeline for importing place information from Google Places API into Supabase. The pipeline is designed for cocktail bars and drinking establishments but can be adapted for other venue types.

## Phase 2.1 Implementation ✅

**Google Places Service** - Completed implementation includes:

- ✅ GooglePlacesService class with comprehensive API integration
- ✅ Rate limiting (100 requests/second with sliding window)
- ✅ Exponential backoff retry logic with jitter
- ✅ API response parsing and mapping to Place interface
- ✅ Error handling and usage logging
- ✅ Data validation utilities
- ✅ Test script for validation

## Quick Start

### 1. Setup Environment

```bash
cd scripts/places/
cp ../../.env.example .env
# Edit .env with your Google Places API key and Supabase credentials
```

**Required Environment Variables:**
```bash
# Google Places API
GOOGLE_MAPS_API_KEY=your_google_places_api_key
# or
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional

# Environment
SUPABASE_ENV=staging  # or production
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Test the Google Places Service

```bash
# Test Google Places API integration
pnpm run test-google-places

# Test configuration
pnpm run test-config

# Type checking
pnpm run type-check
```

## Architecture

### Core Components

#### 1. GooglePlacesService (`google-places-service.ts`)

**Main Features:**
- Text search for places by query
- Place details fetching by place_id  
- Nearby places search by coordinates
- Rate limiting with sliding window algorithm
- Exponential backoff with jitter for retries
- API usage tracking and logging

**Usage Example:**
```typescript
import { GooglePlacesService } from './google-places-service';

const service = new GooglePlacesService();

// Search for places
const places = await service.searchPlaces('cocktail bar', 'HK');

// Get detailed information
const details = await service.getPlaceDetails(places[0].place_id);

// Convert to our Place interface
const placeData = service.convertToPlace(details);

// Check API usage
const stats = service.getUsageStats();
console.log(`Made ${stats.requestCount} requests at ${stats.requestsPerSecond}/s`);
```

#### 2. Rate Limiter (`rate-limiter.ts`)

Implements Google Places API rate limiting:
- **Sliding Window**: 100 requests per second
- **Automatic Waiting**: Pauses execution when limit reached
- **Usage Tracking**: Monitor current request count
- **Exponential Backoff**: Retry failed requests with increasing delays

**Usage Example:**
```typescript
import { GooglePlacesRateLimiter, ExponentialBackoff } from './rate-limiter';

const rateLimiter = new GooglePlacesRateLimiter(100, 1000); // 100 req/sec
const backoff = new ExponentialBackoff(1000, 30000, 3); // 1s base, 30s max, 3 retries

// Wait for rate limit before API call
await rateLimiter.waitIfNeeded();

// Execute with retry logic
const result = await backoff.execute(async () => {
  return await apiCall();
});
```

#### 3. Utilities (`utils.ts`)

Helper functions for data processing:
- **Data Validation**: Coordinates, phone numbers, URLs, ratings
- **Formatting**: Price levels, ratings, phone numbers, durations
- **Analysis**: Data completeness scoring, bar detection
- **Display**: Progress bars, summaries, text truncation

**Key Functions:**
```typescript
import { 
  calculateDataCompleteness,
  createPlaceSummary,
  isLikelyBar,
  validateCoordinates,
  formatDuration 
} from './utils';

// Calculate how complete place data is (0-100%)
const completeness = calculateDataCompleteness(place); // 85%

// Create CLI-friendly summary
const summary = createPlaceSummary(place);
console.log(`${summary.title} - ${summary.rating} - ${summary.completeness}%`);

// Check if place is likely a bar
if (isLikelyBar(place)) {
  console.log('This looks like a drinking establishment');
}
```

### Data Flow

```
Input Query → GooglePlacesService → Rate Limiter → Google API
                      ↓
Place Details ← API Response ← Error Handling ← Retry Logic
                      ↓
Validation → Data Mapping → Place Interface → Ready for Database
```

### Configuration

Environment-specific settings in `config.ts`:

```typescript
// Development: Slower, more verbose
development: {
  venues: { batchSize: 5, delayMs: 2000 },
  logging: { level: 'debug' }
}

// Staging: Balanced settings  
staging: {
  venues: { batchSize: 10, delayMs: 1000 },
  logging: { level: 'info', enableFile: true }
}

// Production: Optimized performance
production: {
  venues: { batchSize: 20, delayMs: 500, maxRetries: 5 },
  logging: { level: 'warn', enableFile: true }
}
```

## API Rate Limits & Costs

### Google Places API Limits

- **Text Search**: $32 per 1000 requests
- **Place Details**: $17 per 1000 requests  
- **Nearby Search**: $32 per 1000 requests
- **Rate Limit**: 100 requests per second

### Cost Estimation

For 100 new places:
- Text Search: 100 requests × $0.032 = $3.20
- Place Details: 100 requests × $0.017 = $1.70
- **Total**: ~$4.90 per 100 places

### Rate Limiting Strategy

```typescript
// Sliding window rate limiter
const requests = []; // Timestamps of recent requests
const maxRequests = 100; // Per second
const windowMs = 1000; // 1 second window

// Clean old requests and check if we need to wait
const now = Date.now();
const validRequests = requests.filter(time => now - time < windowMs);

if (validRequests.length >= maxRequests) {
  const waitTime = windowMs - (now - validRequests[0]);
  await sleep(waitTime);
}
```

## Testing

### Test Scripts

```bash
# Test Google Places Service
pnpm run test-google-places
# Output: Search results, place details, API stats

# Test configuration loading
pnpm run test-config  
# Output: Environment settings, validation

# Test database schema
pnpm run test-schema
# Output: Supabase connection, table structure
```

### Sample Test Output

```
🧪 Testing Google Places Service
Environment: staging
Rate limit: 100 requests/second
---
🔍 Test 1: Searching for bars in Hong Kong...
✅ Found 20 places in 1.2s

📍 First result:
  Name: The Old Man
  Address: 2/F, 32 Aberdeen St, Central, Hong Kong
  Contact: +852 2234 5678 | https://theoldman.hk
  Rating: 4.5/5 (120 reviews) | $$$
  Features: Bar, Cocktails, Outdoor Seating
  Data Completeness: 95%

🔍 Test 2: Getting detailed information...
✅ Retrieved details in 0.8s
  Business Status: OPERATIONAL
  Phone: +852 2234 5678
  Website: https://theoldman.hk
  Types: bar, establishment, food, point_of_interest

🔄 Test 3: Converting to Place interface...
✅ Converted successfully
  Place ID: ChIJ7cv00DwBBDQRdwjMnkP9EAs
  Main Text: The Old Man
  Secondary Text: 2/F, 32 Aberdeen St, Central
  Coordinates: (22.281, 114.155)
  Data Source: google_places

📊 API Usage Statistics:
  Total Requests: 2
  Requests/Second: 1.67
  Elapsed Time: 1.2s
  Current Rate Limit Window: 2 requests

✅ All tests completed successfully!
```

## Error Handling

### Common Issues & Solutions

**1. API Key Issues**
```bash
❌ Error: Google Places API key is required
💡 Solution: Set GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY
```

**2. Rate Limiting**
```bash
⚠️ Warning: Rate limit reached, waiting 250ms...
💡 Info: Automatic handling with sliding window
```

**3. API Quota Exceeded**
```bash
❌ Error: Google Places API error: 429 - Too Many Requests
💡 Solution: Check quota in Google Cloud Console, upgrade plan
```

**4. Invalid Place ID**
```bash
❌ Error: No place details found for place_id: invalid_id
💡 Solution: Verify place_id format and existence
```

### Retry Strategy

```typescript
// Exponential backoff with jitter
const delays = [1s, 2s, 4s]; // Base delays
const jitter = ±25%; // Random variance
const maxDelay = 30s; // Cap on delay

// Example: Retry sequence for failed request
Attempt 1: Immediate
Attempt 2: Wait 1.2s (1s + 20% jitter)  
Attempt 3: Wait 1.8s (2s - 10% jitter)
Attempt 4: Wait 4.1s (4s + 2.5% jitter)
```

## Next Steps

### Phase 2.2: Supabase Place Service
- [ ] Individual and batch upsert operations
- [ ] Duplicate detection by place_id
- [ ] Conflict resolution strategies
- [ ] Audit trail and metadata tracking

### Phase 2.3: Data Validation Layer  
- [ ] Comprehensive validation rules
- [ ] Data completeness scoring
- [ ] Error reporting and correction suggestions

### Phase 3: CLI Interface
- [ ] Interactive confirmation system
- [ ] Progress tracking and reporting
- [ ] File input processing
- [ ] Dry-run functionality

## File Structure

```
scripts/places/
├── config.ts                  # Environment configuration
├── google-places-service.ts   # ✅ Google Places API service
├── rate-limiter.ts            # ✅ Rate limiting utilities  
├── utils.ts                   # ✅ Helper functions
├── test-google-places.ts      # ✅ Test script
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This documentation

# Coming in Phase 2.2-2.3:
├── supabase-place-service.ts  # Supabase operations
├── validation.ts              # Data validation
├── ingest-places.ts           # Main CLI script  
├── cli-confirmation.ts        # Interactive confirmation
└── progress-tracker.ts        # Progress tracking
```

---

*Part of Cocktail Compass App - Places Data Ingestion Pipeline*
*Phase 2.1 Implementation - January 13, 2025*