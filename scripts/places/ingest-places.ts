#!/usr/bin/env tsx

import { GooglePlacesService } from './src/services/google-places-service';
import { SupabasePlaceService } from './src/services/supabase-place-service';
import { PlaceInventoryService, PlaceInventoryItem } from './src/services/place-inventory-service';
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
  useInventory: boolean;
  inventoryFile: string;
  exportInventory: boolean;
  skipInventoryCheck: boolean;
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
    useInventory: false,
    inventoryFile: '',
    exportInventory: false,
    skipInventoryCheck: false,
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
      case '--use-inventory':
        options.useInventory = true;
        break;
      case '--inventory-file':
        if (nextArg && !nextArg.startsWith('-')) {
          options.inventoryFile = nextArg;
          i++;
        }
        break;
      case '--export-inventory':
        options.exportInventory = true;
        break;
      case '--skip-inventory-check':
        options.skipInventoryCheck = true;
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
  -i, --input <file>           Input file (JSON, CSV, or TXT format) [REQUIRED]
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
  --use-inventory               Use inventory to check for existing places
  --inventory-file <file>       File to load/save inventory (JSON)
  --export-inventory            Export inventory to the specified file
  --skip-inventory-check       Skip checking inventory for existing places

EXAMPLES:
  # Basic usage with interactive confirmation
  tsx ingest-places.ts --input places.json

  # Staging environment with batch processing
  tsx ingest-places.ts --input hong-kong-bars.json --environment staging

  # Production environment (requires --confirm flag)
  tsx ingest-places.ts --input production-places.json --environment production --confirm

  # Dry run to preview changes
  tsx ingest-places.ts --input places.txt --dry-run --verbose

  # Process CSV file
  tsx ingest-places.ts --input venues.csv --dry-run --verbose

  # Advanced options
  tsx ingest-places.ts --input large-dataset.json --batch-size 5 --delay 2000 --update-existing --output report.json

  # Use inventory to save costs
  tsx ingest-places.ts --input places.json --use-inventory --inventory-file place-inventory.json

  # Export current inventory
  tsx ingest-places.ts --export-inventory --inventory-file place-inventory.json

ENVIRONMENT FILES:
  Create separate .env files for each environment:
  
  .env.staging:
  GOOGLE_MAPS_API_KEY=your_staging_api_key
  SUPABASE_URL=https://your-staging-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
  
  .env.production:
  GOOGLE_MAPS_API_KEY=your_production_api_key
  SUPABASE_URL=https://your-production-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
  
  Template structure:
  GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
  SUPABASE_URL=https://your-project-ref.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  NODE_ENV=staging

INPUT FORMATS:
  JSON: Array of place objects with name and optional searchQuery/google_place_id
  CSV: Comma-separated values with headers (name, searchQuery, google_place_id, tags, description, show_on_map)
  TXT: One place name per line
  
  Example JSON with Place IDs (RECOMMENDED - saves 65% on costs):
  [
    {"name": "The Old Man", "google_place_id": "ChIJ7cv00DwBBDQRdwjMnkP9EAs", "tags": ["speakeasy", "craft cocktails"]},
    {"name": "Quinary", "google_place_id": "ChIJ1234567890abcdef", "tags": ["molecular gastronomy", "innovative"]}
  ]

  Example JSON with Search Queries (fallback - costs more):
  [
    {"name": "The Old Man", "searchQuery": "cocktail bar"},
    {"name": "Quinary", "searchQuery": "quinary bar"}
  ]

  Example CSV with Place IDs:
  name,google_place_id,tags,description,show_on_map
  "The Old Man","ChIJ7cv00DwBBDQRdwjMnkP9EAs","speakeasy,craft cocktails","Hidden gem in Soho",true
  "Quinary","ChIJ1234567890abcdef","molecular gastronomy,innovative","Award-winning cocktail bar",true

  Example CSV with Search Queries:
  name,searchQuery,tags,description,show_on_map
  "The Old Man","cocktail bar","speakeasy,craft cocktails","Hidden gem in Soho",true
  "Quinary","quinary bar","molecular gastronomy,innovative","Award-winning cocktail bar",true

  Example TXT:
  The Old Man
  Quinary
  COA

ENVIRONMENT CONFIGURATION:
  The script automatically loads environment-specific .env files:
  - .env.staging for staging environment
  - .env.production for production environment
  
  Required environment variables in each .env file:
  - GOOGLE_MAPS_API_KEY: Your Google Maps API key
  - SUPABASE_URL: Your Supabase project URL
  - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
  
  Example .env.staging:
  GOOGLE_MAPS_API_KEY=your_staging_api_key
  SUPABASE_URL=https://your-staging-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

COST OPTIMIZATION:
  Using google_place_id instead of searchQuery saves 65% on API costs:
  - With place ID: Only Place Details API call ($0.017 per place)
  - Without place ID: Text Search + Place Details ($0.049 per place)
  
  Using inventory system saves additional costs:
  - Skip API calls for places already in inventory
  - Automatic place ID lookup from previous runs
  - Export inventory to CSV for external use
  
  To get place IDs, run with --dry-run first to see what would be found.
`);
}

// Enhanced CSV parsing function to support place IDs
function parseCSV(content: string): PlaceInput[] {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1);
  
  // Find column indices
  const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
  const searchQueryIndex = headers.findIndex(h => h.toLowerCase() === 'searchquery' || h.toLowerCase() === 'search_query');
  const placeIdIndex = headers.findIndex(h => h.toLowerCase() === 'google_place_id' || h.toLowerCase() === 'place_id' || h.toLowerCase() === 'placeid');
  const tagsIndex = headers.findIndex(h => h.toLowerCase() === 'tags');
  const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
  const showOnMapIndex = headers.findIndex(h => h.toLowerCase() === 'show_on_map' || h.toLowerCase() === 'showonmap');

  if (nameIndex === -1) {
    throw new Error('CSV file must have a "name" column');
  }

  return dataLines.map((line, index) => {
    // Handle quoted values and commas within quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value

    const name = values[nameIndex]?.replace(/"/g, '') || '';
    const searchQuery = searchQueryIndex >= 0 ? values[searchQueryIndex]?.replace(/"/g, '') : undefined;
    const googlePlaceId = placeIdIndex >= 0 ? values[placeIdIndex]?.replace(/"/g, '') : undefined;
    const tags = tagsIndex >= 0 && values[tagsIndex] ? values[tagsIndex].replace(/"/g, '').split(';').map(t => t.trim()) : undefined;
    const description = descriptionIndex >= 0 ? values[descriptionIndex]?.replace(/"/g, '') : undefined;
    const showOnMap = showOnMapIndex >= 0 ? values[showOnMapIndex]?.replace(/"/g, '').toLowerCase() === 'true' : true;

    return {
      name: name || 'Unknown', // Provide fallback name if empty
      searchQuery: googlePlaceId ? undefined : (searchQuery || `${name || 'Unknown'} cocktail bar`),
      google_place_id: googlePlaceId,
      tags,
      description,
      show_on_map: showOnMap,
    };
  }).filter(place => place.name.length > 0 || place.google_place_id); // Allow empty names if place ID exists
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
          name: item.name || item || 'Unknown', // Provide fallback name
          searchQuery: item.google_place_id ? undefined : (item.searchQuery || `${item.name || item || 'Unknown'} cocktail bar`),
          google_place_id: item.google_place_id,
          tags: Array.isArray(item.tags) ? item.tags : undefined,
          description: typeof item.description === 'string' ? item.description : undefined,
          show_on_map: typeof item.show_on_map === 'boolean' ? item.show_on_map : true,
        }));
      } else {
        throw new Error('JSON file must contain an array');
      }
    } else if (ext === '.csv') {
      return parseCSV(content);
    } else if (ext === '.txt') {
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(name => ({
          name,
          searchQuery: `${name} cocktail bar`,
          show_on_map: true,
        }));
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json, .csv, or .txt`);
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
  console.log(`   Environment: ${options.environment.toUpperCase()}`);
  console.log(`   Environment File: .env.${options.environment}`);
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
  
  // Initialize inventory service if enabled
  let inventoryService: PlaceInventoryService | null = null;
  if (options.useInventory) {
    inventoryService = new PlaceInventoryService(options.inventoryFile || 'place-inventory.json');
    await inventoryService.loadInventory();
    console.log(`📚 Using inventory: ${inventoryService.getAllPlaces().length} places loaded`);
  }
  
  console.log('\n🔍 Analyzing places and determining actions...');
  for (const placeInput of places) {
    try {
      let details: GooglePlaceDetails | undefined;
      let searchMethod: 'place_id' | 'text_search' | 'inventory' = 'text_search'; // Default value
      
      // Check inventory first if enabled
      if (inventoryService && !options.skipInventoryCheck) {
        const inventoryPlace = inventoryService.findPlace(placeInput.name);
        if (inventoryPlace) {
          console.log(`  📚 Found in inventory: ${placeInput.name}`);
          
          // Use inventory data if we have a place ID
          if (inventoryPlace.google_place_id) {
            try {
              details = await googleService.getPlaceDetails(inventoryPlace.google_place_id);
              searchMethod = 'inventory';
              console.log(`  ✅ Retrieved from inventory + API: ${details.name}`);
            } catch (error) {
              console.log(`  ⚠️  Failed to get details for inventory place, falling back to search`);
              // Fall through to normal search
            }
          }
        }
      }
      
      // If not found in inventory or inventory lookup failed, proceed with normal flow
      if (!details) {
        if (placeInput.google_place_id) {
          // Direct lookup using place ID - much cheaper!
          console.log(`  🔍 Looking up place directly by ID: ${placeInput.name}`);
          details = await googleService.getPlaceDetails(placeInput.google_place_id);
          searchMethod = 'place_id';
          
          if (options.verbose) {
            console.log(`  ✅ Found by place ID: ${details.name}`);
          }
        } else {
          // Fallback to text search - more expensive
          console.log(`  🔍 Searching for place: ${placeInput.name}`);
          const searchResults = await googleService.searchPlaces(
            placeInput.searchQuery || placeInput.name,
            '22.3193,114.1694' // Hong Kong coordinates for better search results
          );
          
          if (searchResults.length === 0) {
            console.log(`  ❌ No places found for: ${placeInput.name}`);
            console.log(`     Search query used: ${placeInput.searchQuery || placeInput.name}`);
            console.log(`     Location context: Hong Kong (22.3193,114.1694)`);
            console.log(`     💡 Tip: Add google_place_id to skip expensive text search`);
            results.errors++;
            results.details.push({
              name: placeInput.name,
              status: 'not_found',
              error: 'No places found in Google Places API',
              searchQuery: placeInput.searchQuery || placeInput.name,
              searchMethod: 'text_search',
            });
            continue;
          }

          // Get full details for the first result
          details = await googleService.getPlaceDetails(searchResults[0].place_id);
          searchMethod = 'text_search';
          
          if (options.verbose) {
            console.log(`  ✅ Found by text search: ${details.name}`);
          }
        }
      }
      
      // Ensure we have details before proceeding
      if (!details) {
        console.error(`  ❌ Failed to get details for: ${placeInput.name}`);
        results.errors++;
        results.details.push({
          name: placeInput.name,
          status: 'error',
          error: 'Failed to get place details',
          searchMethod: placeInput.google_place_id ? 'place_id' : 'text_search',
        });
        continue;
      }
      
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
      
      // Add to inventory if enabled
      if (inventoryService && details) {
        const inventoryItem: PlaceInventoryItem = {
          name: details.name,
          google_place_id: details.place_id,
          last_fetched: new Date().toISOString(),
          address: details.formatted_address,
          rating: details.rating,
          types: details.types,
          tags: placeInput.tags,
          description: placeInput.description,
          show_on_map: placeInput.show_on_map
        };
        await inventoryService.addPlace(inventoryItem);
      }
      
      // Log cost savings when using place IDs or inventory
      if (searchMethod === 'place_id') {
        console.log(`  💰 Cost saved: Skipped text search API call (~$0.032)`);
      } else if (searchMethod === 'inventory') {
        console.log(`  💰 Cost saved: Used inventory + place details (~$0.032 saved)`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error analyzing ${placeInput.name}:`, error instanceof Error ? error.message : String(error));
      results.errors++;
      results.details.push({
        name: placeInput.name,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        searchMethod: placeInput.google_place_id ? 'place_id' : 'text_search',
      });
    }
  }

  // Individual or batch confirmation (unless --confirm flag is set)
  if (!options.confirm && !options.dryRun && placeDetails.length > 0) {
    if (options.individual) {
      // Individual confirmation for each place with immediate processing
      console.log('\n🔍 Individual place confirmation mode enabled...');
      for (let i = 0; i < placeDetails.length; i++) {
        const placeDetail = placeDetails[i];
        const action = actions[i];
        const placeInput = places[i];
        
        const manualTags = placeInput?.tags;
        const manualDescription = placeInput?.description;
        const manualShowOnMap = placeInput?.show_on_map;
        const searchMethod = placeInput?.google_place_id ? 'place_id' : 'text_search';
        
        const confirmed = await confirmation.confirmPlace(placeDetail, action, manualTags);
        if (!confirmed) {
          console.log(`\n⏭️  Skipping ${placeDetail.name} by user request.`);
          results.skipped++;
          results.details.push({
            name: placeDetail.name,
            status: 'skipped',
            reason: 'Skipped by user',
            searchMethod,
          });
          progress.update(1);
          continue;
        }

        // Process immediately after confirmation
        try {
          console.log(`\n📍 Processing: ${placeDetail.name}`);
          
          if (options.verbose) {
            console.log(`  📍 Found: ${placeDetail.name}`);
            console.log(`     Address: ${placeDetail.formatted_address || 'N/A'}`);
            console.log(`     Rating: ${placeDetail.rating || 'N/A'}/5`);
            console.log(`     Types: ${placeDetail.types?.join(', ') || 'N/A'}`);
            if (searchMethod === 'place_id') {
              console.log(`     💰 Cost saved: Used place ID instead of text search`);
            }
          }

          if (action === 'skip') {
            console.log(`  ⏭️  Skipping existing place: ${placeDetail.name}`);
            results.skipped++;
            results.details.push({
              name: placeDetail.name,
              status: 'skipped',
              reason: 'Place already exists',
            });
            progress.update(1);
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
            progress.update(1);
            continue;
          }

          // Get timezone for this place
          const timezone = await googleService.getPlaceTimezone(
            placeDetail.geometry.location.lat,
            placeDetail.geometry.location.lng
          );
          
          // Convert and upsert
          const placeData = supabaseService.convertGooglePlaceToPlaceData(placeDetail, timezone);
          if (manualTags && manualTags.length > 0) {
            (placeData as any).tags = manualTags;
          }
          if (typeof manualDescription === 'string' && manualDescription.length > 0) {
            (placeData as any).description = manualDescription;
          }
          (placeData as any).show_on_map = typeof manualShowOnMap === 'boolean' ? manualShowOnMap : true;
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
        
        // Small delay between individual processing
        if (options.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
      }
      
      // Skip the batch processing since we already processed everything individually
      progress.complete();
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
      
      return; // Exit early since we've already processed everything
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
      const placeInput = places[i + j];
      const searchMethod = placeInput?.google_place_id ? 'place_id' : 'text_search';
      
      try {
        console.log(`\n📍 Processing: ${placeDetail.name}`);
        
        if (options.verbose) {
          console.log(`  📍 Found: ${placeDetail.name}`);
          console.log(`     Address: ${placeDetail.formatted_address || 'N/A'}`);
          console.log(`     Rating: ${placeDetail.rating || 'N/A'}/5`);
          console.log(`     Types: ${placeDetail.types?.join(', ') || 'N/A'}`);
          if (searchMethod === 'place_id') {
            console.log(`     💰 Cost saved: Used place ID instead of text search`);
          }
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
        const correspondingPlaceInput = places[i + j];
        if (correspondingPlaceInput?.tags && correspondingPlaceInput.tags.length > 0) {
          (placeData as any).tags = correspondingPlaceInput.tags;
        }
        if (typeof correspondingPlaceInput?.description === 'string' && correspondingPlaceInput.description.length > 0) {
          (placeData as any).description = correspondingPlaceInput.description;
        }
        (placeData as any).show_on_map = typeof correspondingPlaceInput?.show_on_map === 'boolean' ? correspondingPlaceInput.show_on_map : true;
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
          searchMethod,
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
          searchMethod,
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
  
  // Calculate cost savings from using place IDs
  const placeIdLookups = results.details.filter(d => d.searchMethod === 'place_id').length;
  const textSearches = results.details.filter(d => d.searchMethod === 'text_search').length;
  const inventoryLookups = results.details.filter(d => d.searchMethod === 'inventory').length;
  const totalApiCalls = results.details.filter(d => d.status !== 'error').length;
  
  if (placeIdLookups > 0 || inventoryLookups > 0) {
    const costSavedFromPlaceIds = placeIdLookups * 0.032; // $0.032 per text search saved
    const costSavedFromInventory = inventoryLookups * 0.032; // $0.032 per text search saved
    const totalCostSaved = costSavedFromPlaceIds + costSavedFromInventory;
    
    console.log(`\n💰 Cost Analysis:`);
    console.log(`   Places found by place ID: ${placeIdLookups} (saved $${costSavedFromPlaceIds.toFixed(3)} USD)`);
    console.log(`   Places found by inventory: ${inventoryLookups} (saved $${costSavedFromInventory.toFixed(3)} USD)`);
    console.log(`   Places found by text search: ${textSearches}`);
    console.log(`   Total API calls: ${totalApiCalls}`);
    console.log(`   💡 Total cost saved: $${totalCostSaved.toFixed(3)} USD (~${(totalCostSaved * 7.8).toFixed(2)} HKD)`);
    
    if (options.useInventory) {
      console.log(`   📚 Inventory system enabled - future runs will be even cheaper!`);
    }
  }
  
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
    
    // Load environment-specific .env file
    console.log(`\n🔧 Loading environment configuration: ${options.environment}`);
    const envFile = `.env.${options.environment}`;
    const path = await import('path');
    const fs = await import('fs/promises');
    
    try {
      // Check if environment-specific .env file exists
      const envPath = path.join(process.cwd(), envFile);
      const envExists = await fs.access(envPath).then(() => true).catch(() => false);
      
      if (envExists) {
        // Load the environment-specific .env file
        const dotenv = await import('dotenv');
        const result = dotenv.config({ path: envPath });
        
        if (result.error) {
          console.error(`❌ Error loading ${envFile}:`, result.error.message);
          console.log(`   Please check the file format and permissions.`);
          process.exit(1);
        }
        
        console.log(`✅ Loaded environment configuration from ${envFile}`);
        
        // Validate required environment variables
        const requiredEnvVars = [
          'GOOGLE_MAPS_API_KEY',
          'SUPABASE_URL',
          'SUPABASE_SERVICE_ROLE_KEY'
        ];
        
        const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
        
        if (missingEnvVars.length > 0) {
          console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
          console.log(`   Please ensure these variables are defined in ${envFile}`);
          console.log(`   Current working directory: ${process.cwd()}`);
          console.log(`   Environment file path: ${path.resolve(envFile)}`);
          process.exit(1);
        }
        
        // Validate environment variable formats
        const supabaseUrl = process.env.SUPABASE_URL;
        if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
          console.error(`❌ Invalid SUPABASE_URL format: ${supabaseUrl}`);
          console.log(`   URL should start with 'https://'`);
          process.exit(1);
        }
        
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (googleApiKey && googleApiKey.length < 20) {
          console.error(`❌ Invalid GOOGLE_MAPS_API_KEY format: ${googleApiKey}`);
          console.log(`   API key should be at least 20 characters long`);
          process.exit(1);
        }
        
        // Display key environment variables (without sensitive data)
        const envVars = Object.keys(process.env).filter(key => 
          key.includes('SUPABASE') || key.includes('GOOGLE') || key.includes('NODE_ENV')
        );
        console.log(`   Environment variables loaded: ${envVars.join(', ')}`);
        console.log(`   ✅ All required environment variables are present and valid`);
      } else {
        console.error(`❌ Environment file not found: ${envFile}`);
        console.log(`   Expected location: ${path.resolve(envFile)}`);
        console.log(`   Current working directory: ${process.cwd()}`);
        console.log(`   Please create ${envFile} with your ${options.environment} environment configuration.`);
        console.log(`   Required variables: GOOGLE_MAPS_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY`);
        console.log(`   Use --help to see the template structure.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Failed to load environment configuration:`, error instanceof Error ? error.message : String(error));
      console.log(`   Please check file permissions and try again.`);
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
    
    // Handle export inventory mode
    if (options.exportInventory) {
      console.log('\n📚 Exporting inventory...');
      const inventoryService = new PlaceInventoryService(options.inventoryFile || 'place-inventory.json');
      await inventoryService.loadInventory();
      
      const stats = inventoryService.getStats();
      console.log(`📊 Inventory Statistics:`);
      console.log(`   Total places: ${stats.total}`);
      console.log(`   Last updated: ${inventoryService.getAllPlaces()[0]?.last_fetched || 'Never'}`);
      
      const csvPath = options.output || 'place-inventory.csv';
      await inventoryService.exportToCSV(csvPath);
      console.log(`✅ Inventory exported successfully!`);
      return;
    }
    
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
