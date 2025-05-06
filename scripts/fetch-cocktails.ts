import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
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

    // Transform the data to match the Cocktail interface
    const transformedCocktails = transformCocktails(cocktails);

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save the transformed data
    const filePath = path.join(dataDir, 'cocktails.json');
    fs.writeFileSync(filePath, JSON.stringify(transformedCocktails, null, 2));

    console.log('✅ Cocktails data fetched and saved successfully');
  } catch (error) {
    console.error('❌ Error fetching cocktails:', error);
    process.exit(1);
  }
}

// Run the function
fetchAndSaveCocktails(); 