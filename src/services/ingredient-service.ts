import { supabase } from '@/lib/supabase';

export type IngredientType =
  | 'base_spirit'
  | 'liqueur'
  | 'ingredient';

export interface Ingredient {
  id: string;
  type: IngredientType;
  nameEn: string;
  nameZh: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export class IngredientService {
  async getAllIngredients(): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name_en');

    if (error) throw error;
    return data.map(this.mapIngredient);
  }

  async getIngredientsBySlug(
    slug: string,
  ): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('slug', slug)
      .order('name_en');

    if (error) throw error;
    return data.map(this.mapIngredient);
  }

  async searchIngredients(
    query: string,
    type?: IngredientType,
  ): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .or(
        `name_en.ilike.%${query}%,name_zh.ilike.%${query}%`,
      )
      .order('name_en');

    if (error) throw error;
    return data.map(this.mapIngredient);
  }

  async createIngredient(
    nameEn: string,
    nameZh: string,
    type: IngredientType,
  ): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert([
        {
          name_en: nameEn,
          name_zh: nameZh,
          type,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.mapIngredient(data);
  }

  protected mapIngredient(data: any): Ingredient {
    return {
      id: data.id,
      type: data.type,
      nameEn: data.name_en,
      nameZh: data.name_zh,
      slug: data.slug,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const ingredientService = new IngredientService();
