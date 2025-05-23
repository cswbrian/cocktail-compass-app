import {
  Cocktail,
  RankedCocktail,
} from '@/types/cocktail';
import { slugify } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

class CocktailService {
  private static instance: CocktailService;
  private static isInitialized = false;
  private cocktails: Cocktail[] = [];


  private constructor() {
    if (CocktailService.isInitialized) {
      console.warn(
        'CocktailService is being instantiated multiple times!',
      );
    }

    CocktailService.isInitialized = true;
  }

  public static getInstance(): CocktailService {
    if (!CocktailService.instance) {
      console.log(
        '🎯 Creating new CocktailService instance',
      );
      CocktailService.instance = new CocktailService();
    }
    return CocktailService.instance;
  }

  public async getAllCocktailsWithDetails(): Promise<Cocktail[]> {
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*');

    if (error) {
      console.error('Error fetching cocktail details:', error);
      return [];
    }

    return data.map(this.mapSupabaseResponseToCocktail);
  }

  public async getCocktailBySlug(
    slug: string,
  ): Promise<Cocktail | undefined> {
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(
        'Error fetching cocktail by slug:',
        error,
      );
      return undefined;
    }

    return this.mapSupabaseResponseToCocktail(data);
  }

  private mapSupabaseResponseToCocktail(
    data: any,
  ): Cocktail {
    const cocktailData = data.data || {};
    
    // Initialize arrays for different ingredient types
    const baseSpirits: any[] = [];
    const liqueurs: any[] = [];
    const ingredients: any[] = [];

    // Map ingredients based on their type
    if (data.ingredients && Array.isArray(data.ingredients)) {
      data.ingredients.forEach((item: any) => {
        const ingredient = {
          id: item.ingredient.id,
          slug: item.ingredient.slug,
          name: {
            en: item.ingredient.name_en,
            zh: item.ingredient.name_zh
          },
          unit: {
            en: item.unit.name_en,
            zh: item.unit.name_zh
          },
          amount: item.amount,
        };

        switch (item.ingredient.type) {
          case 'base_spirit':
            baseSpirits.push(ingredient);
            break;
          case 'liqueur':
            liqueurs.push(ingredient);
            break;
          default:
            ingredients.push(ingredient);
        }
      });
    }

    return {
      id: data.id,
      slug: data.slug,
      name: cocktailData.name || { en: '', zh: null },
      flavor_profile: cocktailData.flavor_profile || {
        body: 0,
        booziness: 0,
        bubbles: false,
        complexity: 0,
        sourness: 0,
        sweetness: 0,
      },
      base_spirits: baseSpirits,
      liqueurs: liqueurs,
      ingredients: ingredients,
      flavor_descriptors: cocktailData.flavor_descriptors || [],
      technique: cocktailData.technique,
      garnish: cocktailData.garnish,
      description: cocktailData.description,
      categories: cocktailData.categories || [],
      is_custom: data.is_custom || false,
    };
  }

  public async getCocktailById(
    id: string,
  ): Promise<Cocktail | undefined> {
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(
        'Error fetching cocktail by id:',
        error,
      );
      return undefined;
    }

    return this.mapSupabaseResponseToCocktail(data);
  }

  public async getCocktailsByIngredientId(
    ingredientId: string,
  ): Promise<Cocktail[]> {
    // First get all cocktail IDs that use this ingredient
    const { data: cocktailIds, error: cocktailIdsError } =
      await supabase
        .from('cocktail_ingredients')
        .select('cocktail_id')
        .eq('ingredient_id', ingredientId);

    if (cocktailIdsError) {
      console.error(
        'Error fetching cocktail IDs:',
        cocktailIdsError,
      );
      return [];
    }

    if (!cocktailIds || cocktailIds.length === 0) {
      return [];
    }

    // Then get the full cocktail details for these IDs
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*')
      .in(
        'id',
        cocktailIds.map(ci => ci.cocktail_id),
      );

    if (error) {
      console.error(
        'Error fetching cocktails by ingredient:',
        error,
      );
      return [];
    }

    return data.map(this.mapSupabaseResponseToCocktail);
  }

  public getCocktailsByMood(
    category:
      | 'Strong & Spirit-Focused'
      | 'Sweet & Tart'
      | 'Tall & Bubbly'
      | 'Rich & Creamy',
    spirit?: string,
    preference?: string,
  ): RankedCocktail[] {
    console.log(
      `🔍 Searching for cocktails with category: ${category}${spirit ? ` and spirit: ${spirit}` : ''}${preference ? ` and preference: ${preference}` : ''}`,
    );

    // First filter: Match by category
    let filteredCocktails = this.cocktails.filter(
      cocktail => cocktail.categories.includes(category),
    );
    console.log(
      `📊 Found ${filteredCocktails.length} cocktails matching category`,
    );

    // Second filter: Match by selected spirit if provided
    if (spirit) {
      filteredCocktails = filteredCocktails.filter(
        cocktail =>
          cocktail.base_spirits.some(
            baseSpirit =>
              slugify(baseSpirit.name.en) === spirit,
          ),
      );
      console.log(
        `📊 After spirit filter: ${filteredCocktails.length} cocktails remaining`,
      );
    }

    // Third filter: Match by preference if provided and category is Sweet & Tart
    if (preference && category === 'Sweet & Tart') {
      filteredCocktails = filteredCocktails.filter(
        cocktail => {
          const flavorProfile = cocktail.flavor_profile;
          if (!flavorProfile) return false;

          const sweetness = flavorProfile.sweetness;
          const sourness = flavorProfile.sourness;

          switch (preference) {
            case 'More Sweet':
              return sweetness > sourness;
            case 'More Tart':
              return sourness > sweetness;
            case 'Balanced':
              return Math.abs(sweetness - sourness) <= 1;
            default:
              return true;
          }
        },
      );
      console.log(
        `📊 After preference filter: ${filteredCocktails.length} cocktails remaining`,
      );
    }

    // Fourth step: Randomly select one cocktail if any are available
    if (filteredCocktails.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * filteredCocktails.length,
      );
      const selectedCocktail =
        filteredCocktails[randomIndex];
      console.log(
        `🎲 Randomly selected: ${selectedCocktail.name.en}`,
      );
      return [
        {
          ...selectedCocktail,
          distance: 0,
        },
      ];
    }

    console.log(
      '❌ No cocktails found matching the criteria',
    );
    return [];
  }

  public async getRecommendableCocktails(): Promise<Cocktail[]> {
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*')
      .eq('is_custom', false);

    if (error) {
      console.error('Error fetching recommendable cocktails:', error);
      return [];
    }

    return data
      .map(this.mapSupabaseResponseToCocktail)
      .filter(cocktail => {
        const profile = cocktail.flavor_profile;
        return (
          profile &&
          typeof profile.sweetness === 'number' &&
          typeof profile.sourness === 'number' &&
          typeof profile.body === 'number' &&
          typeof profile.complexity === 'number' &&
          typeof profile.booziness === 'number' &&
          typeof profile.bubbles === 'boolean'
        );
      });
  }

  public async getCocktailDetails(): Promise<
    Cocktail[] | null
  > {
    const { data, error } = await supabase
      .from('cocktail_details')
      .select('*');

    if (error) {
      console.error(
        'Error fetching cocktail details:',
        error,
      );
      return null;
    }

    return data;
  }
}

export const cocktailService =
  CocktailService.getInstance();
