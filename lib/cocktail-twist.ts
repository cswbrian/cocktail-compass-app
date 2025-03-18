import { Cocktail } from "@/types/cocktail";

// Add this type definition at the top of the file, after the imports
type Ingredient = string | {
  name: {
    en: string;
  };
};

export function calculateDistance(base: Cocktail, comparison: Cocktail): number {
  let distance = 0;
  
  // Compare flavor profiles (highest weight)
  const flavorProfileDistance = compareIngredients(
    Array.isArray(base.flavor_profile) ? base.flavor_profile : [],
    Array.isArray(comparison.flavor_profile) ? comparison.flavor_profile : []
  );
  distance += flavorProfileDistance * 3;

  // Compare flavor descriptors (high weight)
  const flavorDescriptorsDistance = compareIngredients(
    Array.isArray(base.flavor_descriptors) ? base.flavor_descriptors.map(fd => fd.en) : [],
    Array.isArray(comparison.flavor_descriptors) ? comparison.flavor_descriptors.map(fd => fd.en) : []
  );
  distance += flavorDescriptorsDistance * 2.5;

  // Compare base spirits (medium-high weight)
  const baseSpiritsDistance = compareIngredients(
    base.base_spirits,
    comparison.base_spirits
  );
  distance += baseSpiritsDistance * 2;

  // Compare liqueurs (medium weight)
  const liqueursDistance = compareIngredients(
    base.liqueurs,
    comparison.liqueurs
  );
  distance += liqueursDistance * 1.5;

  // Compare other ingredients (lower weight)
  const ingredientsDistance = compareIngredients(
    base.ingredients,
    comparison.ingredients
  );
  distance += ingredientsDistance;

  return distance;
}

function compareIngredients(base: Ingredient[] | undefined, comparison: Ingredient[] | undefined): number {
  // Handle undefined/null arrays
  if (!base || !comparison) return 5; // Return high distance if either is undefined
  
  // Ensure we're working with arrays
  if (!Array.isArray(base) || !Array.isArray(comparison)) return 5;
  
  // Convert items to lowercase strings, handling both string and object formats
  const baseSet = new Set(base.map(i => {
    if (!i) return '';
    return typeof i === 'string' ? i.toLowerCase() : 
           (i.name?.en ? i.name.en.toLowerCase() : '');
  }).filter(Boolean));
  
  const comparisonSet = new Set(comparison.map(i => {
    if (!i) return '';
    return typeof i === 'string' ? i.toLowerCase() : 
           (i.name?.en ? i.name.en.toLowerCase() : '');
  }).filter(Boolean));
  
  let different = 0;
  
  // Count items in base that aren't in comparison
  for (const item of baseSet) {
    if (!comparisonSet.has(item)) different++;
  }
  
  // Count items in comparison that aren't in base
  for (const item of comparisonSet) {
    if (!baseSet.has(item)) different++;
  }
  
  return different;
}