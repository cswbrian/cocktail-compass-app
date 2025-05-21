import { supabase } from "@/lib/supabase";
import { AuthService } from "@/services/auth-service";

interface BasicStats {
  totalCocktailsDrunk: number;
  uniqueCocktails: number;
  uniquePlaces: number;
}

interface PlaceStats {
  name: string;
  count: number;
  place_id: string;
}

interface UserStats {
  basicStats: BasicStats;
  drinksByMonth: Record<string, number>;
  topPlaces: PlaceStats[];
  recentPhotos: { url: string; type: 'image' | 'video' }[];
  mostLoggedCocktails: { name: string; count: number }[];
}

export class UserStatsService {
  async getUserStats(): Promise<UserStats | null> {
    const user = await AuthService.getCurrentSession();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      basicStats: {
        totalCocktailsDrunk: data.total_cocktails_drunk,
        uniqueCocktails: data.unique_cocktails,
        uniquePlaces: data.unique_places
      },
      drinksByMonth: data.drinks_by_month,
      topPlaces: data.top_places,
      recentPhotos: data.recent_photos,
      mostLoggedCocktails: data.most_logged_cocktails
    };
  }

  async getUserStatsByUserId(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      basicStats: {
        totalCocktailsDrunk: data.total_cocktails_drunk,
        uniqueCocktails: data.unique_cocktails,
        uniquePlaces: data.unique_places
      },
      drinksByMonth: data.drinks_by_month,
      topPlaces: data.top_places,
      recentPhotos: data.recent_photos,
      mostLoggedCocktails: data.most_logged_cocktails
    };
  }
}

export const userStatsService = new UserStatsService(); 