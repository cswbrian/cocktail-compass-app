import { supabase } from "@/lib/supabase";
import { CocktailLog } from "@/types/cocktail-log";

interface CocktailLogWithDetails extends CocktailLog {
  cocktails: {
    slug: string;
    cocktail_name: string;
  };
}

class CocktailLogService {
  private async getCocktailIdBySlug(slug: string): Promise<string> {
    const { data, error } = await supabase
      .from("cocktails")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Cocktail with slug ${slug} not found`);
    return data.id;
  }

  async createLog(
    cocktailSlug: string,
    userId: string,
    rating: number,
    specialIngredients?: string | null,
    comments?: string | null,
    location?: string | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null
  ): Promise<CocktailLog> {
    const cocktailId = await this.getCocktailIdBySlug(cocktailSlug);
    
    const { data, error } = await supabase
      .from("cocktail_logs")
      .insert([{
        cocktail_id: cocktailId,
        user_id: userId,
        rating,
        special_ingredients: specialIngredients,
        comments,
        location,
        bartender,
        tags,
        drink_date: drinkDate
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLog(
    id: string,
    rating: number,
    specialIngredients?: string | null,
    comments?: string | null,
    location?: string | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null
  ): Promise<CocktailLog> {
    const { data, error } = await supabase
      .from("cocktail_logs")
      .update({
        rating,
        special_ingredients: specialIngredients,
        comments,
        location,
        bartender,
        tags,
        drink_date: drinkDate,
        updated_at: new Date()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLog(id: string): Promise<void> {
    const { error } = await supabase
      .from("cocktail_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getLogsByCocktailSlug(cocktailSlug: string): Promise<CocktailLogWithDetails[]> {
    const cocktailId = await this.getCocktailIdBySlug(cocktailSlug);
    
    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        cocktails (
          slug,
          data:data->name
        )
      `)
      .eq("cocktail_id", cocktailId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getLogsByUserId(userId: string): Promise<CocktailLogWithDetails[]> {
    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        cocktails (
          slug,
          data:data->name
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const cocktailLogService = new CocktailLogService(); 