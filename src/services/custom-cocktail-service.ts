import { supabase } from '@/lib/supabase';
import { Cocktail } from '@/types/cocktail';
import { Ingredient } from '@/services/ingredient-service';

interface CustomCocktailIngredient {
  id: string;
  type: 'base_spirit' | 'liqueur' | 'ingredient';
  nameEn: string;
  nameZh: string;
  amount?: number;
  unitId?: string;
}

export class CustomCocktailService {
  async createCustomCocktail(
    name: { en: string; zh?: string },
    userId: string,
    ingredients: CustomCocktailIngredient[],
  ): Promise<Cocktail> {
    // First create the cocktail
    const { data: cocktail, error: cocktailError } = await supabase
      .from('cocktails')
      .insert([
        {
          data: {
            name: {
              en: name.en,
              zh: name.zh || name.en, // Fallback to English name if Chinese name is not provided
            },
          },
          is_custom: true,
          created_by: userId,
          name: {
            en: name.en,
            zh: name.zh || name.en, // Fallback to English name if Chinese name is not provided
          },
        },
      ])
      .select()
      .single();

    if (cocktailError) throw cocktailError;

    // Then create the cocktail_ingredients records
    if (ingredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('cocktail_ingredients')
        .insert(
          ingredients.map(ingredient => ({
            cocktail_id: cocktail.id,
            ingredient_id: ingredient.id,
            amount: ingredient.amount || null,
            unit_id: ingredient.unitId || null,
          }))
        );

      if (ingredientsError) throw ingredientsError;
    }

    return cocktail;
  }

  async getCustomCocktails(
    userId: string,
  ): Promise<Cocktail[]> {
    const { data, error } = await supabase
      .from('cocktails')
      .select('*')
      .eq('is_custom', true)
      .eq('created_by', userId);

    if (error) throw error;
    return data || [];
  }

  async updateCustomCocktail(
    id: string,
    updates: Partial<Cocktail>,
  ): Promise<Cocktail> {
    const { data, error } = await supabase
      .from('cocktails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomCocktail(id: string): Promise<void> {
    const { error } = await supabase
      .from('cocktails')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const customCocktailService =
  new CustomCocktailService();
