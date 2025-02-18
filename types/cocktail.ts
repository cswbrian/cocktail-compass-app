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

export type Cocktail = {
  name: LocalizedString;
  description: LocalizedString;
  historical_reference?: LocalizedString;
  technique: LocalizedString;
  garnish: LocalizedString;
  allergens: LocalizedString[];
  base_spirits: Ingredient[];
  liqueurs: Ingredient[];
  ingredients: Ingredient[];
  flavor_descriptors: LocalizedString[];
  flavor_profile: FlavorProfile;
  serve_in_glass: LocalizedString;
};
