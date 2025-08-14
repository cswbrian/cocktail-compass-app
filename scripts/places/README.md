# Places Data Ingestion System

This directory contains the tools and services for ingesting venue data from Google Places API into the Cocktail Compass database.

## 📁 Directory Structure

```
scripts/places/
├── src/
│   ├── services/          # Core service classes
│   │   ├── google-places-service.ts      # Google Places API integration
│   │   └── supabase-place-service.ts     # Database operations
│   ├── types/             # TypeScript type definitions
│   │   └── types.ts       # Local types for the ingestion system
│   ├── utils/             # Utility functions
│   │   ├── utils.ts       # General utilities
│   │   └── rate-limiter.ts # API rate limiting
│   └── cli/               # CLI interaction components
│       └── cli-confirmation.ts # User confirmation dialogs
├── tests/                 # Test files
│   ├── test-config.ts
│   ├── test-google-places.ts
│   ├── test-schema.ts
│   ├── test-simple-places.ts
│   └── test-supabase-service.ts
├── docs/                  # Documentation
│   ├── README.md          # This file
│   ├── INGESTION-README.md # Detailed ingestion guide
│   └── TROUBLESHOOTING.md # Troubleshooting guide
├── samples/               # Sample data files
│   ├── my-bars.json
│   ├── sample-places.json
│   └── sample-places.txt
├── ingest-places.ts       # Main ingestion script
├── config.ts              # Configuration management
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp env.template .env
   # Edit .env with your API keys
   ```

3. **Run ingestion:**
   ```bash
   # Basic usage
   tsx ingest-places.ts --input samples/sample-places.json
   
   # With options
   tsx ingest-places.ts --input my-bars.json --environment staging --update-existing
   ```

## 🔧 Main Components

### Services (`src/services/`)
- **GooglePlacesService**: Handles Google Places API calls with rate limiting
- **SupabasePlaceService**: Manages database operations and data persistence

### Types (`src/types/`)
- **PlaceInput**: Input format for place ingestion
- **GooglePlaceDetails**: Google Places API response structure
- **UpsertResult**: Database operation results

### Utilities (`src/utils/`)
- **Rate Limiting**: Prevents API quota exhaustion
- **Data Formatting**: Converts between API and database formats
- **Error Handling**: Consistent error management

### CLI (`src/cli/`)
- **Interactive Confirmation**: User-friendly place-by-place confirmation
- **Batch Processing**: Efficient handling of large datasets
- **Progress Tracking**: Real-time ingestion status

## 📊 Data Flow

1. **Input**: JSON/TXT files with venue names
2. **Search**: Google Places API text search
3. **Details**: Fetch comprehensive place information
4. **Validation**: Check for existing venues
5. **Upsert**: Insert new or update existing venues
6. **Output**: Summary report and database updates

## 🧪 Testing

Run tests to verify system functionality:
```bash
# Test configuration
tsx tests/test-config.ts

# Test Google Places integration
tsx tests/test-google-places.ts

# Test database operations
tsx tests/test-supabase-service.ts
```

## 📚 Documentation

- **INGESTION-README.md**: Comprehensive usage guide
- **TROUBLESHOOTING.md**: Common issues and solutions
- **TECHNICAL-SPECIFICATION.md**: Database schema and API details

## 🔒 Security

- API keys are loaded from environment variables
- Rate limiting prevents quota exhaustion
- Input validation prevents malicious data
- Database operations use parameterized queries

## 🚨 Important Notes

- Always test with staging environment first
- Use `--dry-run` to preview changes
- Monitor API quotas and rate limits
- Backup database before bulk operations
- Verify venue data accuracy before production use
