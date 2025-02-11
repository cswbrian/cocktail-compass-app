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
  name: string;
  unit: string;
  rationale: string;
};

export type Cocktail = {
  name: string;
  description: string;
  historical_reference?: string;
  technique: string;
  garnish: string;
  allergens: string[];
  baseSpirits: Ingredient[];
  liqueurs: Ingredient[];
  ingredients: Ingredient[];
  flavor_descriptors: string[];
  flavor_profile: FlavorProfile;
};
