import { Cocktail, FlavorProfile } from '@/types/cocktail';

// Add this type definition at the top of the file, after the imports
type Ingredient =
  | string
  | {
      name: {
        en: string;
      };
    };

export function calculateDistance(
  base: Cocktail,
  comparison: Cocktail,
): number {
  // Check for mocktail compatibility
  const isBaseMocktail =
    base.flavor_profile.booziness === 0;
  const isComparisonMocktail =
    comparison.flavor_profile.booziness === 0;

  // If one is a mocktail and the other isn't, return a very high distance
  if (isBaseMocktail !== isComparisonMocktail) {
    return 1000; // Large number to ensure these won't be recommended together
  }

  let distance = 0;

  // Compare base spirits (highest weight - most important for recipe similarity)
  const baseSpiritsDistance = compareIngredients(
    base.base_spirits,
    comparison.base_spirits,
    true, // Consider position
  );
  distance += baseSpiritsDistance * 4;

  // Compare liqueurs (high weight)
  const liqueursDistance = compareIngredients(
    base.liqueurs,
    comparison.liqueurs,
    true, // Consider position
  );
  distance += liqueursDistance * 3;

  // Compare other ingredients (medium-high weight)
  const ingredientsDistance = compareIngredients(
    base.ingredients,
    comparison.ingredients,
    true, // Consider position
  );
  distance += ingredientsDistance * 2.5;

  // Compare flavor profiles (medium weight)
  const flavorProfileDistance = compareFlavorProfiles(
    base.flavor_profile,
    comparison.flavor_profile,
  );
  distance += flavorProfileDistance * 1.5;

  // Compare flavor descriptors (lower weight)
  const flavorDescriptorsDistance = compareIngredients(
    Array.isArray(base.flavor_descriptors)
      ? base.flavor_descriptors.map(fd => fd.en)
      : [],
    Array.isArray(comparison.flavor_descriptors)
      ? comparison.flavor_descriptors.map(fd => fd.en)
      : [],
    false, // Don't consider position for descriptors
  );
  distance += flavorDescriptorsDistance;

  return distance;
}

function compareIngredients(
  base: Ingredient[] | undefined,
  comparison: Ingredient[] | undefined,
  considerPosition: boolean = false,
): number {
  // Handle undefined/null arrays
  if (!base || !comparison) return 5;

  // Ensure we're working with arrays
  if (!Array.isArray(base) || !Array.isArray(comparison))
    return 5;

  // Convert items to lowercase strings, handling both string and object formats
  const baseItems = base
    .map(i => {
      if (!i) return '';
      return typeof i === 'string'
        ? i.toLowerCase()
        : i.name?.en
          ? i.name.en.toLowerCase()
          : '';
    })
    .filter(Boolean);

  const comparisonItems = comparison
    .map(i => {
      if (!i) return '';
      return typeof i === 'string'
        ? i.toLowerCase()
        : i.name?.en
          ? i.name.en.toLowerCase()
          : '';
    })
    .filter(Boolean);

  let difference = 0;

  if (considerPosition) {
    // Compare items considering their position
    const maxLength = Math.max(
      baseItems.length,
      comparisonItems.length,
    );
    for (let i = 0; i < maxLength; i++) {
      const baseItem = baseItems[i];
      const comparisonItem = comparisonItems[i];

      if (!baseItem || !comparisonItem) {
        // Missing ingredient in one list
        difference += 1;
      } else if (baseItem !== comparisonItem) {
        // Different ingredients at same position
        // Add more weight to differences in earlier positions
        difference += 1 + (maxLength - i) * 0.2;
      }
    }
  } else {
    // Original set-based comparison for non-positional comparisons
    const baseSet = new Set(baseItems);
    const comparisonSet = new Set(comparisonItems);

    // Count items in base that aren't in comparison
    for (const item of baseSet) {
      if (!comparisonSet.has(item)) difference++;
    }

    // Count items in comparison that aren't in base
    for (const item of comparisonSet) {
      if (!baseSet.has(item)) difference++;
    }
  }

  return difference;
}

// Add this new function to compare flavor profiles
function compareFlavorProfiles(
  base: FlavorProfile,
  comparison: FlavorProfile,
): number {
  let difference = 0;

  // Compare numeric properties
  difference += Math.abs(base.body - comparison.body);
  difference += Math.abs(
    base.complexity - comparison.complexity,
  );
  difference += Math.abs(
    base.sourness - comparison.sourness,
  );
  difference += Math.abs(
    base.sweetness - comparison.sweetness,
  );

  // Compare bubbles (if both are not null)
  if (
    base.bubbles !== null &&
    comparison.bubbles !== null
  ) {
    difference +=
      base.bubbles !== comparison.bubbles ? 1 : 0;
  }

  return difference;
}
