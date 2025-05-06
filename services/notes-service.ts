import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/services/auth-service';
import { CocktailLog } from '@/types/cocktail-log';

class CocktailLogService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private async getUserId(): Promise<string | null> {
    const user = await AuthService.getCurrentUser();
    if (!user) return null;
    return user.id;
  }

  async getLogs(): Promise<CocktailLog[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    
    const { data, error } = await this.supabase
      .from('cocktail_logs')
      .select('*')
      .eq('user_id', userId)
      .order('last_modified', { ascending: false });

    if (error) throw error;
    return data as CocktailLog[];
  }

  async getLogsByCocktailSlug(cocktailSlug: string): Promise<CocktailLog[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    
    const { data, error } = await this.supabase
      .from('cocktail_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('cocktail_slug', cocktailSlug)
      .order('last_modified', { ascending: false });

    if (error) throw error;
    return data as CocktailLog[];
  }

  async createLog(
    cocktailSlug: string,
    cocktailName: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[] = [],
    drinkDate?: Date
  ): Promise<CocktailLog> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const logData = {
      cocktail_slug: cocktailSlug,
      cocktail_name: cocktailName,
      rating,
      special_ingredients: specialIngredients,
      comments,
      location,
      bartender,
      tags,
      user_id: userId,
      drink_date: drinkDate,
      last_modified: new Date()
    };

    const { data, error } = await this.supabase
      .from('cocktail_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    return data as CocktailLog;
  }

  async updateLog(
    logId: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[],
    drinkDate?: Date
  ): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await this.supabase
      .from('cocktail_logs')
      .update({
        rating,
        special_ingredients: specialIngredients,
        comments,
        location,
        bartender,
        tags,
        drink_date: drinkDate,
        last_modified: new Date()
      })
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async deleteLog(logId: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await this.supabase
      .from('cocktail_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export const cocktailLogService = new CocktailLogService(); 