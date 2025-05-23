import fs from 'fs';
import path from 'path';

interface LocalizedString {
  en: string;
  zh: string;
}

interface BaseIngredient {
  name: LocalizedString;
  amount: number;
  unit: LocalizedString;
}

interface Cocktail {
  id: string;
  slug: string;
  name: LocalizedString;
  base_spirits: BaseIngredient[];
  liqueurs: BaseIngredient[];
  ingredients: BaseIngredient[];
  flavor_descriptors: LocalizedString[];
}

interface CountInfo {
  count: number;
  tags: Set<[string, string]>;
}

interface SummaryItem {
  name: LocalizedString;
  count: number;
  tags: { en: string; zh: string }[];
}

interface Summary {
  base_spirits: SummaryItem[];
  liqueurs: SummaryItem[];
  ingredients: SummaryItem[];
  flavor_descriptors: SummaryItem[];
}

function generateSummary(cocktails: Cocktail[]): Summary {
  // Initialize counters with additional tag information
  const baseSpiritCounts = new Map<string, CountInfo>();
  const liqueurCounts = new Map<string, CountInfo>();
  const ingredientCounts = new Map<string, CountInfo>();
  const flavorCounts = new Map<string, CountInfo>();

  // Process each cocktail
  for (const cocktail of cocktails) {
    // Count base spirits
    for (const spirit of cocktail.base_spirits) {
      const key = `${spirit.name.en}|${spirit.name.zh}`;
      const info = baseSpiritCounts.get(key) || {
        count: 0,
        tags: new Set(),
      };
      info.count++;
      baseSpiritCounts.set(key, info);
    }

    // Count liqueurs
    for (const liqueur of cocktail.liqueurs) {
      const key = `${liqueur.name.en}|${liqueur.name.zh}`;
      const info = liqueurCounts.get(key) || {
        count: 0,
        tags: new Set(),
      };
      info.count++;
      liqueurCounts.set(key, info);
    }

    // Count ingredients
    for (const ingredient of cocktail.ingredients) {
      const key = `${ingredient.name.en}|${ingredient.name.zh}`;
      const info = ingredientCounts.get(key) || {
        count: 0,
        tags: new Set(),
      };
      info.count++;
      ingredientCounts.set(key, info);
    }

    // Count flavor descriptors
    for (const flavor of cocktail.flavor_descriptors) {
      const key = `${flavor.en}|${flavor.zh}`;
      const info = flavorCounts.get(key) || {
        count: 0,
        tags: new Set(),
      };
      info.count++;
      flavorCounts.set(key, info);
    }
  }

  // Helper function to create sorted items
  function createSortedItems(
    counts: Map<string, CountInfo>,
  ): SummaryItem[] {
    return Array.from(counts.entries())
      .map(([key, info]) => {
        const [en, zh] = key.split('|');
        return {
          name: { en, zh },
          count: info.count,
          tags: Array.from(info.tags).map(
            ([tagEn, tagZh]) => ({ en: tagEn, zh: tagZh }),
          ),
        };
      })
      .sort((a, b) => {
        // Sort by count descending, then by English name
        if (b.count !== a.count) return b.count - a.count;
        return a.name.en.localeCompare(b.name.en);
      });
  }

  // Create the summary structure
  const summary: Summary = {
    base_spirits: createSortedItems(baseSpiritCounts),
    liqueurs: createSortedItems(liqueurCounts),
    ingredients: createSortedItems(ingredientCounts),
    flavor_descriptors: createSortedItems(flavorCounts),
  };

  return summary;
}

async function generateAndSaveSummary() {
  try {
    // Read cocktails data
    const dataDir = path.join(process.cwd(), 'data');
    const cocktailsPath = path.join(
      dataDir,
      'cocktails.json',
    );

    if (!fs.existsSync(cocktailsPath)) {
      throw new Error('Cocktails data file not found');
    }

    const cocktailsData = JSON.parse(
      fs.readFileSync(cocktailsPath, 'utf-8'),
    );

    // Generate summary
    const summary = generateSummary(cocktailsData);

    // Save summary
    const summaryPath = path.join(dataDir, 'summary.json');
    fs.writeFileSync(
      summaryPath,
      JSON.stringify(summary, null, 2),
    );

    console.log(
      '✅ Summary data generated and saved successfully',
    );
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    process.exit(1);
  }
}

// Run the function
generateAndSaveSummary();
