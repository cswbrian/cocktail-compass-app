import { Cocktail, RankedCocktail } from '@/types/cocktail';

interface CalculateDistanceParams {
  cocktail: Cocktail;
  sweetness: number | null;
  sourness: number | null;
  body: number | null;
  complexity: number | null;
  booziness: number | null;
  bubbles: boolean | null;
  selectedBaseSpirits: string[];
  selectedIngredients: string[];
  selectedLiqueurs: string[];
  selectedFlavors: string[];
  language: string;
}

export function calculateDistance({
  cocktail,
  sweetness,
  sourness,
  body,
  complexity,
  booziness,
  bubbles,
  selectedBaseSpirits,
  selectedIngredients,
  selectedLiqueurs,
  selectedFlavors,
}: CalculateDistanceParams): number {
  const profile = cocktail.flavor_profile;

  // 1. MUST-HAVE: If user booziness is 0, only keep non-alcoholic cocktails
  if (booziness === 0 && profile.booziness !== 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  // 2. MUST-HAVE: Bubbles must match user preference exactly if specified
  if (bubbles !== null && profile.bubbles !== bubbles) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Use tiered scoring to enforce priorities - lower values are better matches
  let score = 0;

  // 3. HIGHEST PRIORITY: Calculate ingredient matches
  // Range: 1,000,000 - 2,000,000 (huge penalty to ensure highest priority)
  let ingredientScore = 0;
  let totalSelections = 0;
  let matchCount = 0;

  if (selectedBaseSpirits.length > 0) {
    totalSelections++;
    if (
      selectedBaseSpirits.some(spirit =>
        cocktail.base_spirits.some(
          cocktailSpirit =>
            cocktailSpirit.name.en === spirit,
        ),
      )
    ) {
      matchCount++;
    }
  }

  if (selectedIngredients.length > 0) {
    totalSelections++;
    if (
      selectedIngredients.some(ingredient =>
        cocktail.ingredients.some(
          cocktailIngredient =>
            cocktailIngredient.name.en === ingredient,
        ),
      )
    ) {
      matchCount++;
    }
  }

  if (selectedLiqueurs.length > 0) {
    totalSelections++;
    if (
      selectedLiqueurs.some(liqueur =>
        cocktail.liqueurs.some(
          cocktailLiqueur =>
            cocktailLiqueur.name.en === liqueur,
        ),
      )
    ) {
      matchCount++;
    }
  }

  // Calculate ingredient score - 0 if no selections made
  if (totalSelections > 0) {
    ingredientScore =
      1000000 * (1 - matchCount / totalSelections);
  }
  score += ingredientScore;

  // 4. MEDIUM PRIORITY: Calculate flavor descriptor matches
  // Range: 1,000 - 10,000 (won't override ingredient matches)
  let flavorScore = 0;
  if (selectedFlavors.length > 0) {
    const matchingFlavors = selectedFlavors.filter(
      flavor => {
        const selectedFlavorLower = flavor.toLowerCase();
        const cocktailFlavorsLower =
          cocktail.flavor_descriptors.map(f =>
            f.en.toLowerCase(),
          );
        return cocktailFlavorsLower.includes(
          selectedFlavorLower,
        );
      },
    ).length;

    flavorScore =
      10000 *
      (1 - matchingFlavors / selectedFlavors.length);
  }
  score += flavorScore;

  // 5. LOWEST PRIORITY: Calculate numerical attributes distance
  // Range: 0-100 (won't override flavor or ingredient priorities)
  const attributeDistances = [
    sweetness !== null
      ? Math.pow(profile.sweetness - sweetness, 2)
      : 0,
    sourness !== null
      ? Math.pow(profile.sourness - sourness, 2)
      : 0,
    body !== null ? Math.pow(profile.body - body, 2) : 0,
    complexity !== null
      ? Math.pow(profile.complexity - complexity, 2)
      : 0,
    booziness !== null
      ? Math.pow(profile.booziness - booziness, 2)
      : 0,
  ];

  const attributeScore = Math.sqrt(
    attributeDistances.reduce((sum, dist) => sum + dist, 0),
  );
  score += attributeScore;

  return score; // Lower score = better match
}

export function rankCocktails(
  cocktails: Cocktail[],
  params: Omit<CalculateDistanceParams, 'cocktail'>,
): RankedCocktail[] {
  // Score by reference first — avoid spreading ~670 full cocktails
  const ranked = cocktails
    .map(cocktail => ({
      cocktail,
      distance: calculateDistance({ ...params, cocktail }),
    }))
    .filter(
      entry => entry.distance !== Number.MAX_SAFE_INTEGER,
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);

  // Convert top 20 to 0-100 display score (higher is better)
  return ranked.map(({ cocktail, distance }) => {
    let displayScore = 100;

    if (distance >= 1000000) {
      displayScore = Math.max(
        0,
        60 - (distance - 1000000) / 20000,
      );
    } else if (distance >= 10000) {
      displayScore = Math.max(
        60,
        80 - (distance - 10000) / 500,
      );
    } else {
      displayScore = Math.max(80, 100 - distance / 100);
    }

    return {
      ...cocktail,
      distance,
      score: Math.round(displayScore),
    };
  });
}
