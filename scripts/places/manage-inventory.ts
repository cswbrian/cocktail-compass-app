#!/usr/bin/env tsx

import { PlaceInventoryService } from './src/services/place-inventory-service';

interface CliOptions {
  inventoryFile: string;
  command: 'list' | 'search' | 'export' | 'stats' | 'cleanup' | 'help';
  query?: string;
  output?: string;
  daysOld?: number;
  help: boolean;
}

function parseArguments(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    inventoryFile: 'place-inventory.json',
    command: 'help',
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--inventory-file':
        if (nextArg && !nextArg.startsWith('-')) {
          options.inventoryFile = nextArg;
          i++;
        }
        break;
      case '--output':
        if (nextArg && !nextArg.startsWith('-')) {
          options.output = nextArg;
          i++;
        }
        break;
      case '--query':
        if (nextArg && !nextArg.startsWith('-')) {
          options.query = nextArg;
          i++;
        }
        break;
      case '--days-old':
        if (nextArg && !nextArg.startsWith('-')) {
          const days = parseInt(nextArg);
          if (!isNaN(days) && days > 0) {
            options.daysOld = days;
            i++;
          }
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          options.command = arg as any;
        }
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
📚 Place Inventory Management Tool
==================================

USAGE:
  tsx manage-inventory.ts [COMMAND] [OPTIONS]

COMMANDS:
  list                    List all places in inventory
  search <query>          Search inventory by name, address, tags, or description
  export [output]         Export inventory to CSV file
  stats                   Show inventory statistics
  cleanup [days]          Remove entries older than specified days (default: 365)
  help                    Show this help information

OPTIONS:
  --inventory-file <file>  Inventory file to use (default: place-inventory.json)
  --output <file>          Output file for export (default: place-inventory.csv)
  --query <text>           Search query for search command
  --days-old <number>      Days old for cleanup command (default: 365)
  --help, -h               Show help information

EXAMPLES:
  # List all places in inventory
  tsx manage-inventory.ts list

  # Search for places with "cocktail" in name or tags
  tsx manage-inventory.ts search --query cocktail

  # Export inventory to CSV
  tsx manage-inventory.ts export --output my-places.csv

  # Show inventory statistics
  tsx manage-inventory.ts stats

  # Clean up entries older than 180 days
  tsx manage-inventory.ts cleanup --days-old 180

  # Use custom inventory file
  tsx manage-inventory.ts list --inventory-file custom-inventory.json
`);
}

async function main(): Promise<void> {
  const options = parseArguments();
  
  try {
    if (options.help || options.command === 'help') {
      showHelp();
      return;
    }

    console.log('📚 Place Inventory Management Tool');
    console.log('==================================\n');

    // Initialize inventory service
    const inventoryService = new PlaceInventoryService(options.inventoryFile);
    await inventoryService.loadInventory();

    const stats = inventoryService.getStats();
    console.log(`📊 Inventory loaded: ${stats.total} places\n`);

    switch (options.command) {
      case 'list':
        await handleList(inventoryService);
        break;
      
      case 'search':
        if (!options.query) {
          console.error('❌ Error: Search query is required. Use --query <text>');
          process.exit(1);
        }
        await handleSearch(inventoryService, options.query);
        break;
      
      case 'export':
        await handleExport(inventoryService, options.output);
        break;
      
      case 'stats':
        await handleStats(inventoryService);
        break;
      
      case 'cleanup':
        await handleCleanup(inventoryService, options.daysOld);
        break;
      
      default:
        console.error(`❌ Error: Unknown command '${options.command}'`);
        showHelp();
        process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function handleList(inventoryService: PlaceInventoryService): Promise<void> {
  const places = inventoryService.getAllPlaces();
  
  if (places.length === 0) {
    console.log('📚 No places found in inventory.');
    return;
  }

  console.log(`📚 Inventory contains ${places.length} places:\n`);
  
  places.forEach((place, index) => {
    console.log(`${index + 1}. ${place.name}`);
    console.log(`   Place ID: ${place.google_place_id}`);
    console.log(`   Address: ${place.address || 'N/A'}`);
    console.log(`   Rating: ${place.rating || 'N/A'}/5`);
    console.log(`   Tags: ${place.tags?.join(', ') || 'None'}`);
    console.log(`   Last fetched: ${new Date(place.last_fetched).toLocaleDateString()}`);
    console.log('');
  });
}

async function handleSearch(inventoryService: PlaceInventoryService, query: string): Promise<void> {
  const results = inventoryService.searchInventory(query);
  
  if (results.length === 0) {
    console.log(`🔍 No places found matching "${query}"`);
    return;
  }

  console.log(`🔍 Found ${results.length} places matching "${query}":\n`);
  
  results.forEach((place, index) => {
    console.log(`${index + 1}. ${place.name}`);
    console.log(`   Place ID: ${place.google_place_id}`);
    console.log(`   Address: ${place.address || 'N/A'}`);
    console.log(`   Tags: ${place.tags?.join(', ') || 'None'}`);
    console.log(`   Description: ${place.description || 'N/A'}`);
    console.log('');
  });
}

async function handleExport(inventoryService: PlaceInventoryService, outputPath?: string): Promise<void> {
  const csvPath = outputPath || 'place-inventory.csv';
  
  console.log(`📄 Exporting inventory to: ${csvPath}`);
  await inventoryService.exportToCSV(csvPath);
  
  const stats = inventoryService.getStats();
  console.log(`✅ Successfully exported ${stats.total} places to ${csvPath}`);
}

async function handleStats(inventoryService: PlaceInventoryService): Promise<void> {
  const stats = inventoryService.getStats();
  
  console.log('📊 Inventory Statistics:\n');
  console.log(`Total places: ${stats.total}`);
  console.log(`Last updated: ${new Date().toLocaleDateString()}`);
  
  if (Object.keys(stats.byDate).length > 0) {
    console.log('\nPlaces added by date:');
    Object.entries(stats.byDate)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(([date, count]) => {
        console.log(`  ${date}: ${count} places`);
      });
  }
}

async function handleCleanup(inventoryService: PlaceInventoryService, daysOld?: number): Promise<void> {
  const days = daysOld || 365;
  
  console.log(`🧹 Cleaning up entries older than ${days} days...`);
  await inventoryService.cleanupOldEntries(days);
  
  const stats = inventoryService.getStats();
  console.log(`✅ Cleanup completed. Inventory now contains ${stats.total} places.`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
