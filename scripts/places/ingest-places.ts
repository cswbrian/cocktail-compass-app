#!/usr/bin/env tsx

import { GooglePlacesService } from './src/services/google-places-service';
import { SupabasePlaceService } from './src/services/supabase-place-service';
import { CliConfirmation } from './src/cli/cli-confirmation';
import { formatDuration } from './src/utils/utils';
import { GooglePlaceDetails, PlaceInput } from './src/types/types';

// Command line argument parsing
interface CliOptions {
  input: string;
  environment: 'staging' | 'production';
  batchSize: number;
  delay: number;
  confirm: boolean;
  dryRun: boolean;
  updateExisting: boolean;
  verbose: boolean;
  individual: boolean;
  output?: string;
  help: boolean;
}

function parseArguments(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    input: '',
    environment: 'staging',
    batchSize: 10,
    delay: 1000,
    confirm: false,
    dryRun: false,
    updateExisting: false,
    verbose: false,
    individual: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-i':
      case '--input':
        if (nextArg && !nextArg.startsWith('-')) {
          options.input = nextArg;
          i++;
        }
        break;
      case '-e':
      case '--environment':
        if (nextArg && !nextArg.startsWith('-')) {
          if (nextArg === 'staging' || nextArg === 'production') {
            options.environment = nextArg;
            i++;
          }
        }
        break;

      case '-b':
      case '--batch-size':
        if (nextArg && !nextArg.startsWith('-')) {
          const size = parseInt(nextArg);
          if (!isNaN(size) && size > 0) {
            options.batchSize = size;
            i++;
          }
        }
        break;
      case '-d':
      case '--delay':
        if (nextArg && !nextArg.startsWith('-')) {
          const delay = parseInt(nextArg);
          if (!isNaN(delay) && delay >= 0) {
            options.delay = delay;
            i++;
          }
        }
        break;
      case '--confirm':
        options.confirm = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--update-existing':
        options.updateExisting = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--individual':
        options.individual = true;
        break;
      case '-o':
      case '--output':
        if (nextArg && !nextArg.startsWith('-')) {
          options.output = nextArg;
          i++;
        }
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
🍸 Cocktail Compass - Places Data Ingestion Tool
================================================

USAGE:
  tsx ingest-places.ts [OPTIONS]

OPTIONS:
  -i, --input <file>           Input file (JSON or TXT format) [REQUIRED]
  -e, --environment <env>      Supabase environment (staging/production) [default: staging]
  -b, --batch-size <number>    Process places in batches [default: 10]
  -d, --delay <ms>             Delay between API calls [default: 1000ms]
  --confirm                     Skip individual confirmations
  --dry-run                     Preview changes without database updates
  --update-existing             Update existing places (default: skip)
  --verbose                     Enable detailed logging
  --individual                  Confirm each place individually (one by one)
  -o, --output <file>          Save report to file
  -h, --help                    Show this help information

EXAMPLES:
  # Basic usage with interactive confirmation
  tsx ingest-places.ts --input places.json

  # Staging environment with batch processing
  tsx ingest-places.ts --input hong-kong-bars.json --environment staging

  # Dry run to preview changes
  tsx ingest-places.ts --input places.txt --dry-run --verbose

  # Advanced options
  tsx ingest-places.ts --input large-dataset.json --batch-size 5 --delay 2000 --update-existing --output report.json

INPUT FORMATS:
  JSON: Array of place objects with name and optional searchQuery
  TXT: One place name per line
  
  Example JSON:
  [
    {"name": "The Old Man", "searchQuery": "cocktail bar"},
    {"name": "Quinary", "searchQuery": "quinary bar"}
  ]

  Example TXT:
  The Old Man
  Quinary
  COA
`);
}



async function readInputFile(filePath: string): Promise<PlaceInput[]> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.json') {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name || item,
          searchQuery: item.searchQuery || `${item.name || item} cocktail bar`,
        }));
      } else {
        throw new Error('JSON file must contain an array');
      }
    } else if (ext === '.txt') {
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(name => ({
          name,
          searchQuery: `${name} cocktail bar`,
        }));
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json or .txt`);
    }
  } catch (error) {
    throw new Error(`Failed to read input file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Progress tracking
class ProgressTracker {
  private startTime: number;
  private total: number;
  private current: number = 0;
  private lastUpdate: number = 0;

  constructor(total: number) {
    this.startTime = Date.now();
    this.total = total;
  }

  update(count: number = 1): void {
    this.current += count;
    const now = Date.now();
    
    // Update every 500ms to avoid spam
    if (now - this.lastUpdate > 500) {
      this.display();
      this.lastUpdate = now;
    }
  }

  private display(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const avgTimePerItem = elapsed / this.current;
    const remaining = this.total - this.current;
    const eta = Math.round(remaining * avgTimePerItem);
    
    const progressBar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    
    process.stdout.write(`\r[${progressBar}] ${percentage}% (${this.current}/${this.total}) - ETA: ${formatDuration(eta)}`);
  }

  complete(): void {
    this.current = this.total;
    this.display();
    console.log('\n✅ Processing completed!');
  }
}

// Main processing logic
async function processPlaces(
  places: PlaceInput[],
  options: CliOptions,
  googleService: GooglePlacesService,
  supabaseService: SupabasePlaceService
): Promise<void> {
  const confirmation = new CliConfirmation();
  console.log(`\n🚀 Starting ingestion of ${places.length} places...`);
  console.log(`   Environment: ${options.environment}`);
  console.log(`   Batch Size: ${options.batchSize}`);
  console.log(`   Delay: ${options.delay}ms`);
  console.log(`   Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(`   Update Existing: ${options.updateExisting ? 'Yes' : 'No'}`);
  
  const progress = new ProgressTracker(places.length);
  const results = {
    total: places.length,
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    details: [] as any[],
  };

  // Collect all places and actions for batch confirmation
  const placeDetails: GooglePlaceDetails[] = [];
  const actions: ('insert' | 'update' | 'skip')[] = [];
  
  console.log('\n🔍 Analyzing places and determining actions...');
  for (const placeInput of places) {
    try {
      // Search for place details
      const searchResults = await googleService.searchPlaces(
        placeInput.searchQuery || placeInput.name,
        '22.3193,114.1694' // Hong Kong coordinates for better search results
      );
      
      if (searchResults.length === 0) {
        console.log(`  ❌ No places found for: ${placeInput.name}`);
        console.log(`     Search query used: ${placeInput.searchQuery || placeInput.name}`);
        console.log(`     Location context: Hong Kong (22.3193,114.1694)`);
        results.errors++;
        results.details.push({
          name: placeInput.name,
          status: 'not_found',
          error: 'No places found in Google Places API',
          searchQuery: placeInput.searchQuery || placeInput.name,
        });
        continue;
      }

      // Get full details for the first result
      const details = await googleService.getPlaceDetails(searchResults[0].place_id);
      
      // Check if place already exists
      const existingPlace = await supabaseService.existsByPlaceId(details.place_id);
      
      // Determine action type
      let action: 'insert' | 'update' | 'skip';
      if (existingPlace && !options.updateExisting) {
        action = 'skip';
      } else if (existingPlace) {
        action = 'update';
      } else {
        action = 'insert';
      }

      placeDetails.push(details);
      actions.push(action);
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error analyzing ${placeInput.name}:`, error instanceof Error ? error.message : String(error));
      results.errors++;
      results.details.push({
        name: placeInput.name,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Individual or batch confirmation (unless --confirm flag is set)
  if (!options.confirm && !options.dryRun && placeDetails.length > 0) {
    if (options.individual) {
      // Individual confirmation for each place
      console.log('\n🔍 Individual place confirmation mode enabled...');
      for (let i = 0; i < placeDetails.length; i++) {
        const placeDetail = placeDetails[i];
        const action = actions[i];
        
        const confirmed = await confirmation.confirmPlace(placeDetail, action);
        if (!confirmed) {
          console.log(`\n⏭️  Skipping ${placeDetail.name} by user request.`);
          actions[i] = 'skip'; // Mark as skipped
        }
      }
    } else {
      // Batch confirmation
      const batchConfirmed = await confirmation.confirmBatch(placeDetails, actions);
      if (!batchConfirmed) {
        console.log('\n⏭️  Batch processing cancelled by user.');
        return;
      }
    }
  }

  // Process in batches
  for (let i = 0; i < placeDetails.length; i += options.batchSize) {
    const batch = placeDetails.slice(i, i + options.batchSize);
    const batchActions = actions.slice(i, i + options.batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(placeDetails.length / options.batchSize)}`);
    
    for (let j = 0; j < batch.length; j++) {
      const placeDetail = batch[j];
      const action = batchActions[j];
      try {
        console.log(`\n📍 Processing: ${placeDetail.name}`);
        
        if (options.verbose) {
          console.log(`  📍 Found: ${placeDetail.name}`);
          console.log(`     Address: ${placeDetail.formatted_address || 'N/A'}`);
          console.log(`     Rating: ${placeDetail.rating || 'N/A'}/5`);
          console.log(`     Types: ${placeDetail.types?.join(', ') || 'N/A'}`);
        }

        if (action === 'skip') {
          console.log(`  ⏭️  Skipping existing place: ${placeDetail.name}`);
          results.skipped++;
          results.details.push({
            name: placeDetail.name,
            status: 'skipped',
            reason: 'Place already exists',
          });
          continue;
        }

        if (options.dryRun) {
          console.log(`  🔍 [DRY RUN] Would ${action}: ${placeDetail.name}`);
          results.processed++;
          results.details.push({
            name: placeDetail.name,
            status: 'dry_run',
            action: action,
          });
          continue;
        }

        // Get timezone for this place
        const timezone = await googleService.getPlaceTimezone(
          placeDetail.geometry.location.lat,
          placeDetail.geometry.location.lng
        );
        
        // Convert and upsert
        const placeData = supabaseService.convertGooglePlaceToPlaceData(placeDetail, timezone);
        const upsertResult = await supabaseService.upsertPlace(placeData, 'merge');
        
        if (upsertResult.type === 'inserted') {
          console.log(`  ✅ Inserted: ${placeDetail.name}`);
          results.inserted++;
        } else if (upsertResult.type === 'updated') {
          console.log(`  🔄 Updated: ${placeDetail.name}`);
          results.updated++;
        } else {
          console.log(`  ⚠️  Skipped: ${placeDetail.name} (${upsertResult.type})`);
          results.skipped++;
        }

        results.processed++;
        results.details.push({
          name: placeDetail.name,
          status: upsertResult.type,
          place_id: placeDetail.place_id,
        });

        // Delay between API calls
        if (options.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }

      } catch (error) {
        console.error(`  ❌ Error processing ${placeDetail.name}:`, error instanceof Error ? error.message : String(error));
        results.errors++;
        results.details.push({
          name: placeDetail.name,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
      
      progress.update(1);
    }
    
    // Delay between batches
    if (i + options.batchSize < placeDetails.length && options.delay > 0) {
      console.log(`\n⏳ Waiting ${options.delay}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }

  progress.complete();
  
  // Generate summary report using confirmation system
  confirmation.displaySummary(results);

  // Save report if output file specified
  if (options.output) {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(options.output, JSON.stringify(results, null, 2));
      console.log(`\n📄 Report saved to: ${options.output}`);
    } catch (error) {
      console.error(`\n❌ Failed to save report:`, error instanceof Error ? error.message : String(error));
    }
  }
}

// Main function
async function main(): Promise<void> {
  const options = parseArguments();
  
  try {
    if (options.help) {
      showHelp();
      return;
    }
    
    if (!options.input) {
      console.error('❌ Error: Input file is required. Use --help for usage information.');
      process.exit(1);
    }
    
    // Validate environment
    if (options.environment === 'production') {
      console.log('⚠️  WARNING: Running in PRODUCTION environment!');
      if (!options.confirm) {
        console.log('Use --confirm to proceed with production updates.');
        process.exit(1);
      }
    }
    
    console.log('🍸 Cocktail Compass - Places Data Ingestion Tool');
    console.log('================================================');
    
    // Read input file
    console.log(`\n📖 Reading input file: ${options.input}`);
    const places = await readInputFile(options.input);
    console.log(`✅ Loaded ${places.length} places from input file`);
    
    // Initialize services
    console.log('\n🔧 Initializing services...');
    const googleService = new GooglePlacesService();
    const supabaseService = new SupabasePlaceService();
    console.log('✅ Services initialized');
    
    // Test Google Places API connectivity
    console.log('\n🧪 Testing Google Places API connectivity...');
    try {
      const testResults = await googleService.searchPlaces('test bar', '22.3193,114.1694');
      console.log(`✅ API test successful: Found ${testResults.length} test results`);
    } catch (error) {
      console.error('❌ Google Places API test failed:', error instanceof Error ? error.message : String(error));
      console.log('Please check your API key and quota limits.');
      return;
    }
    
    // Process places
    await processPlaces(places, options, googleService, supabaseService);
    
    console.log('\n🎉 Ingestion completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : String(error));
    if (options?.verbose) {
      console.error('\nStack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
