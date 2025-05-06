import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env files
config({ path: '.env' });
config({ path: '.env.local' });

// Create Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function transformCocktails(cocktails: any[]) {
  return cocktails.map(cocktail => {
    // If the cocktail has a data property, merge its contents with the parent object
    if (cocktail.data) {
      const { data, ...rest } = cocktail;
      return {
        ...rest,
        ...data
      };
    }
    return cocktail;
  });
}

async function fetchAndSaveCocktails() {
  try {
    // Fetch cocktails from Supabase
    const { data: cocktails, error } = await supabase
      .from('cocktails')
      .select('*');

    if (error) {
      throw error;
    }

    if (!cocktails) {
      throw new Error('No cocktails found');
    }

    // Transform the cocktails data
    const transformedCocktails = transformCocktails(cocktails);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write cocktails to JSON file
    const outputPath = path.join(dataDir, 'cocktails.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedCocktails, null, 2));

    console.log('✅ Cocktails data fetched and saved successfully');
    console.log(`📊 Total cocktails: ${transformedCocktails.length}`);
  } catch (error) {
    console.error('❌ Error fetching cocktails:', error);
    process.exit(1);
  }
}

// Run the function
fetchAndSaveCocktails(); 