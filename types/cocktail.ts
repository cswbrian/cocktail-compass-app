export type LocalizedString = {
  en: string;
  zh: string;
};

export type FlavorProfile = {
  body: number;
  booziness: number;
  bubbles: boolean;
  complexity: number;
  sourness: number;
  sweetness: number;
};

export type Ingredient = {
  amount: number;
  name: LocalizedString;
  unit: LocalizedString;
  rationale: LocalizedString;
};

// Update the base type for all ingredient types
type BaseIngredient = {
  name: LocalizedString;
  amount: number;
  unit: LocalizedString;
};

export interface Cocktail {
  name: LocalizedString;
  flavor_profile: FlavorProfile;
  base_spirits: BaseIngredient[];
  liqueurs: BaseIngredient[];
  ingredients: BaseIngredient[];
  flavor_descriptors: LocalizedString[];
  technique?: LocalizedString;  // Add since it's used in the component
  garnish?: LocalizedString;    // Add since it's used in the component
}

export interface RankedCocktail extends Cocktail {
  distance: number;
  flavorMatches: number;
}
