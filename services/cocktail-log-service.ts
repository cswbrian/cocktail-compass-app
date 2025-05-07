import { supabase } from "@/lib/supabase";
import { CocktailLog } from "@/types/cocktail-log";
import { cocktailService } from "@/services/cocktail-service";

export class CocktailLogService {
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

  async getLogsByCocktailSlug(slug: string): Promise<CocktailLog[]> {
    const { data: cocktail } = await supabase
      .from("cocktails")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!cocktail) return [];

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("cocktail_id", cocktail.id)
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(this.mapLog);
  }

  async getLogsByUserId(userId?: string): Promise<CocktailLog[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("user_id", userId || user.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(this.mapLog);
  }

  async getUserStats() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // Get total logs
    const { count: totalLogs } = await supabase
      .from("cocktail_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id);

    // Get average rating
    const { data: ratings } = await supabase
      .from("cocktail_logs")
      .select("rating")
      .eq("user_id", user.user.id);

    const averageRating = ratings?.length
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

    // Get all logs with cocktail IDs
    const { data: logs } = await supabase
      .from("cocktail_logs")
      .select("cocktail_id")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    // Get all cocktails from our in-memory data
    const allCocktails = cocktailService.getAllCocktails();

    // Count cocktails
    const cocktailCounts = logs?.reduce((acc, curr) => {
      const cocktail = allCocktails.find(c => c.id === curr.cocktail_id);
      if (cocktail) {
        const name = cocktail.name.en;
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteCocktailsList = Object.entries(cocktailCounts || {})
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count spirits
    const spiritCounts = logs?.reduce((acc, curr) => {
      const cocktail = allCocktails.find(c => c.id === curr.cocktail_id);
      if (cocktail) {
        cocktail.base_spirits.forEach(spirit => {
          const spiritName = spirit.name.en;
          acc[spiritName] = (acc[spiritName] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const mostLoggedSpirits = Object.entries(spiritCounts || {})
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLogs: totalLogs || 0,
      averageRating,
      favoriteCocktails: favoriteCocktailsList,
      mostLoggedSpirits,
    };
  }

  private mapLog(data: any): CocktailLog {
    // Get the cocktail from our in-memory data
    const allCocktails = cocktailService.getAllCocktails();
    const cocktail = allCocktails.find(c => c.id === data.cocktail_id);
    
    return {
      id: data.id,
      cocktailId: data.cocktail_id,
      cocktailName: cocktail?.name.en || "",
      userId: data.user_id,
      rating: data.rating,
      location: data.location,
      bartender: data.bartender,
      comments: data.comments,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      drinkDate: data.drink_date
    };
  }
}

export const cocktailLogService = new CocktailLogService(); 