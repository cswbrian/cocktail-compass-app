import { supabase } from "@/lib/supabase";
import { Cocktail } from "@/types/cocktail";
import { slugify } from "@/lib/utils";

export class CustomCocktailService {
  async createCustomCocktail(
    name: { en: string; zh: string },
    userId: string
  ): Promise<Cocktail> {
    const slug = slugify(name.en);
    
    const { data: cocktail, error } = await supabase
      .from("cocktails")
      .insert([{
        data: {
          name,
          slug,
          flavor_profile: {
            body: 0,
            booziness: 0,
            bubbles: false,
            complexity: 0,
            sourness: 0,
            sweetness: 0
          },
          base_spirits: [],
          liqueurs: [],
          ingredients: [],
          flavor_descriptors: [],
          categories: []
        },
        slug,
        is_custom: true,
        created_by: userId,
        name_en: name.en,
        name_zh: name.zh
      }])
      .select()
      .single();

    if (error) throw error;
    return cocktail;
  }

  async getCustomCocktails(userId: string): Promise<Cocktail[]> {
    const { data, error } = await supabase
      .from("cocktails")
      .select("*")
      .eq("is_custom", true)
      .eq("created_by", userId);

    if (error) throw error;
    return data || [];
  }

  async updateCustomCocktail(
    id: string,
    updates: Partial<Cocktail>
  ): Promise<Cocktail> {
    const { data, error } = await supabase
      .from("cocktails")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomCocktail(id: string): Promise<void> {
    const { error } = await supabase
      .from("cocktails")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const customCocktailService = new CustomCocktailService(); 