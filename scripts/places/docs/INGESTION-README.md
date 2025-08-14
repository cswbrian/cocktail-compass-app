# 🍸 Places Data Ingestion Tool

A powerful CLI tool for ingesting and updating place information in Supabase using Google Places API data. Perfect for building comprehensive databases of cocktail bars, restaurants, and other venues.

## ✨ Features

- **🔄 Dual File Format Support**: JSON arrays and line-separated TXT files
- **🌍 Multi-Region Support**: Hong Kong and Taiwan regions with extensible architecture
- **⚡ Batch Processing**: Configurable batch sizes with intelligent rate limiting
- **🔍 Smart Duplicate Detection**: Prevents duplicate entries while allowing updates
- **📊 Progress Tracking**: Real-time progress bars with ETA calculations
- **🛡️ Safety Features**: Dry-run mode, environment validation, and confirmation prompts
- **📈 Comprehensive Reporting**: Detailed success/failure metrics and exportable reports
- **🎯 Opening Hours Support**: Full Google Places opening hours data with human-readable formats
- **🎮 Interactive Confirmation**: Beautiful CLI interface with individual and batch confirmations

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd scripts/places
pnpm install
```

### 2. Configure API Keys

Create a `.env` file or set environment variables:

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=your_api_key_here

# Supabase (staging)
VITE_SUPABASE_URL=your_staging_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Supabase (production)  
SUPABASE_URL_PRODUCTION=your_production_url
SUPABASE_SERVICE_ROLE_KEY_PRODUCTION=your_production_key
```

### 3. Test the Tool

```bash
# Dry run with sample data
pnpm run ingest:sample

# Test with TXT file
pnpm run ingest:sample:txt
```

## 📁 Input File Formats

### JSON Format (Recommended)

```json
[
  {
    "name": "The Old Man",
    "searchQuery": "The Old Man cocktail bar hong kong"
  },
  {
    "name": "Quinary", 
    "searchQuery": "Quinary cocktail bar hong kong"
  }
]
```

**Fields:**
- `name` (required): Place name to search for
- `searchQuery` (optional): Custom search query (defaults to `{name} {region}`)

### TXT Format (Simple)

```txt
The Old Man
Quinary
COA
Penicillin
Stockton
```

One place name per line. The tool automatically generates search queries.

## 🎯 Command Line Usage

### Basic Commands

```bash
# Basic ingestion with interactive confirmation
pnpm tsx ingest-places.ts --input places.json

# Staging environment (default)
pnpm tsx ingest-places.ts --input hong-kong-bars.json --environment staging

# Production environment (requires --confirm)
pnpm tsx ingest-places.ts --input places.json --environment production --confirm
```

### Advanced Options

```bash
# Custom batch processing
pnpm tsx ingest-places.ts \
  --input large-dataset.json \
  --batch-size 5 \
  --delay 2000 \
  --update-existing

# Dry run with verbose output
pnpm tsx ingest-places.ts \
  --input places.txt \
  --dry-run \
  --verbose \
  --output report.json
```

### All Available Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input file (JSON/TXT) | **Required** |
| `--environment` | `-e` | Environment (staging/production) | `staging` |
| `--region` | `-r` | Region (hongkong/taiwan) | `hongkong` |
| `--batch-size` | `-b` | Batch size for processing | `10` |
| `--delay` | `-d` | Delay between API calls (ms) | `1000` |
| `--confirm` | | Skip confirmations | `false` |
| `--dry-run` | | Preview without database changes | `false` |
| `--update-existing` | | Update existing places | `false` |
| `--verbose` | | Enable detailed logging | `false` |
| `--output` | `-o` | Save report to file | `undefined` |
| `--help` | `-h` | Show help information | `false` |

## 🔧 Configuration

### Environment Variables

The tool automatically detects and uses the appropriate configuration based on the `--environment` flag:

```bash
# Staging (default)
VITE_SUPABASE_URL=staging_url
SUPABASE_SERVICE_ROLE_KEY=staging_key
GOOGLE_PLACES_API_KEY=your_key

# Production
SUPABASE_URL_PRODUCTION=production_url
SUPABASE_SERVICE_ROLE_KEY_PRODUCTION=production_key
GOOGLE_PLACES_API_KEY_PRODUCTION=your_key
```

### Rate Limiting

- **Google Places API**: 100 requests/second (automatically managed)
- **Batch Processing**: Configurable delays between batches
- **API Call Delays**: Customizable delays between individual API calls

## 📊 Output & Reporting

### Console Output

```
🍸 Cocktail Compass - Places Data Ingestion Tool
================================================

📖 Reading input file: sample-places.json
✅ Loaded 5 places from input file

🚀 Starting ingestion of 5 places...
   Environment: staging
   Region: hongkong
   Batch Size: 10
   Delay: 1000ms
   Dry Run: Yes

[██████████████████████████████████████████████████] 100% (5/5) - ETA: 0s

📊 Processing Summary:
   Total Places: 5
   Processed: 4
   Inserted: 0
   Updated: 0
   Skipped: 1
   Success Rate: 0%
```

### Report File (JSON)

When using `--output`, the tool generates a detailed JSON report:

```json
{
  "total": 5,
  "processed": 4,
  "inserted": 0,
  "updated": 0,
  "skipped": 1,
  "errors": 0,
  "details": [
    {
      "name": "The Old Man",
      "status": "dry_run",
      "action": "insert"
    }
  ]
}
```

## 🎮 Interactive Confirmation System

### Beautiful Place Display

The tool provides an intuitive, emoji-rich interface for reviewing place details:

```
🆕 New Place: The Old Man
============================================================
📍 Address: Lower G/F, 37-39 Aberdeen Street, Soho, Central, Hong Kong
📞 Phone: +852 2234 5678
🌐 Website: https://theoldman.hk
⭐ Rating: ⭐⭐⭐⭐⭐ 4.6/5 (120 reviews)
💰 Price: $$$
🕒 Hours: Monday: 5:00 PM – 2:00 AM
🏷️  Type: bar, establishment, point_of_interest
📊 Status: 🟢 OPERATIONAL
📊 Data Completeness: 73%

------------------------------------------------------------
💾 Action: Will INSERT new place into database
============================================================
```

### Confirmation Options

- **`y`** - Confirm the action
- **`N`** - Skip this place (default)
- **`s`** - Show more detailed information
- **`q`** - Quit the entire process

### Batch Confirmation

Review all places before processing:

```
📦 Batch Confirmation Summary:
============================================================
🆕 The Old Man (73% complete) - INSERT
🆕 Quinary (100% complete) - INSERT
============================================================
📊 Summary: 2 insert, 0 update, 0 skip
💾 Total database operations: 2

Proceed with batch processing? (y/N/q=quit):
```

### Data Completeness Scoring

Each place receives a completeness score (0-100%) based on:
- Contact information (phone, website, address)
- Ratings and reviews
- Business hours and status
- Place types and features
- Geographic coordinates

## 🎯 Use Cases

```bash
# Load a comprehensive list of Hong Kong cocktail bars
pnpm tsx ingest-places.ts \
  --input hong-kong-cocktail-bars.json \
  --environment staging \
  --region hongkong \
  --batch-size 20
```

### 2. Regular Updates

```bash
# Update existing places with latest information
pnpm tsx ingest-places.ts \
  --input updated-places.json \
  --update-existing \
  --environment staging
```

### 3. Data Validation

```bash
# Preview changes without affecting database
pnpm tsx ingest-places.ts \
  --input new-places.txt \
  --dry-run \
  --verbose \
  --output validation-report.json
```

### 4. Production Deployment

```bash
# Deploy to production with confirmation
pnpm tsx ingest-places.ts \
  --input production-data.json \
  --environment production \
  --confirm \
  --output production-report.json
```

## 🛡️ Safety Features

### Environment Protection

- **Staging Default**: Always starts in staging environment
- **Production Confirmation**: Requires explicit `--confirm` flag for production
- **Environment Validation**: Prevents accidental production updates

### Data Safety

- **Duplicate Prevention**: Automatically skips existing places
- **Dry Run Mode**: Preview all changes before execution
- **Update Control**: Choose whether to update existing places
- **Comprehensive Logging**: Track all operations for audit purposes

### Error Handling

- **Graceful Failures**: Individual place failures don't stop the process
- **Detailed Error Reporting**: Clear error messages with context
- **Retry Logic**: Built-in retry mechanisms for transient failures
- **Progress Preservation**: Failed items are logged and reported

## 🔍 Troubleshooting

### Common Issues

#### 1. API Key Errors

```bash
❌ Google Places API error: REQUEST_DENIED - This API project is not authorized
```

**Solution**: Check your Google Places API key and ensure the Places API is enabled.

#### 2. Supabase Connection Issues

```bash
❌ Failed to connect to Supabase: Invalid API key
```

**Solution**: Verify your Supabase URL and service role key in the environment variables.

#### 3. File Format Errors

```bash
❌ Failed to read input file: JSON file must contain an array
```

**Solution**: Ensure your JSON file contains an array of place objects.

### Debug Mode

Use `--verbose` for detailed logging:

```bash
pnpm tsx ingest-places.ts --input places.json --verbose
```

### Environment Validation

Test your configuration:

```bash
pnpm run test-config
pnpm run test-schema
```

## 📈 Performance Tips

### Optimal Settings

- **Batch Size**: 10-20 places per batch (balance between speed and API limits)
- **Delay**: 1000-2000ms between API calls (respects Google's rate limits)
- **File Size**: Process large datasets in chunks for better error recovery

### Monitoring

- **Progress Bars**: Real-time progress with ETA calculations
- **API Usage**: Built-in rate limiting and usage tracking
- **Performance Metrics**: Processing time and success rate reporting

## 🔄 Integration

### With Existing Systems

- **CI/CD Pipelines**: Use in deployment scripts for data updates
- **Scheduled Jobs**: Regular data refresh with cron jobs
- **Data Validation**: Pre-deployment data quality checks

### Output Formats

- **Console**: Human-readable progress and summary
- **JSON Reports**: Machine-readable processing results
- **Database**: Direct Supabase integration with audit trails

## 📚 Examples

### Sample Input Files

See the included sample files:
- `sample-places.json` - JSON format example
- `sample-places.txt` - TXT format example

### Sample Commands

```bash
# Quick test
pnpm run ingest:sample

# Production deployment
pnpm run ingest:live

# Custom processing
pnpm tsx ingest-places.ts \
  --input my-places.json \
  --batch-size 5 \
  --delay 1500 \
  --update-existing \
  --output my-report.json
```

## 🤝 Contributing

### Development

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Testing

```bash
# Run all tests
pnpm test

# Test specific components
pnpm run test-google-places
pnpm run test-supabase
pnpm run test-config
```

## 📄 License

This tool is part of the Cocktail Compass App project.

---

**🍸 Happy Ingestion!** 

For support and questions, please refer to the main project documentation or create an issue in the repository.
