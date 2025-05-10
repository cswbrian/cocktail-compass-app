import { supabase } from "@/lib/supabase";
import { CocktailLog } from "@/types/cocktail-log";
import { cocktailService } from "@/services/cocktail-service";
import { cocktailLogsMediaService } from "@/services/media-service";

export class CocktailLogService {
  async createLog(
    cocktailId: string,
    userId: string,
    rating?: number | null,
    specialIngredients?: string | null,
    comments?: string | null,
    location?: string | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null,
    media?: { url: string; type: 'image' | 'video' }[] | null
  ): Promise<CocktailLog> {
    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error("Rating must be an integer between 1 and 5");
      }
    }

    // First create the log to get the ID
    const { data: logData, error: createError } = await supabase
      .from("cocktail_logs")
      .insert([{
        cocktail_id: cocktailId,
        user_id: userId,
        rating: rating || null,
        special_ingredients: specialIngredients,
        comments,
        location,
        bartender,
        tags,
        drink_date: drinkDate,
        media: [] // Initialize with empty media array
      }])
      .select()
      .single();

    if (createError) throw createError;

    // If there are media files to upload, handle them
    if (media && media.length > 0) {
      try {
        // Upload each media file and get the URLs
        const mediaUrls = await Promise.all(
          media.map(async (item: { url: string; type: 'image' | 'video' }) => {
            if (item.url.startsWith('blob:')) {
              // This is a new file that needs to be uploaded
              const response = await fetch(item.url);
              const blob = await response.blob();
              const file = new File([blob], `media-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`, {
                type: item.type === 'video' ? 'video/mp4' : 'image/jpeg'
              });
              const url = await cocktailLogsMediaService.uploadMedia(file, userId, logData.id);
              return { url, type: item.type };
            }
            return item; // Keep existing media items
          })
        );

        // Update the log with the new media URLs
        const { data: updatedLog, error: updateError } = await supabase
          .from("cocktail_logs")
          .update({ media: mediaUrls })
          .eq("id", logData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedLog;
      } catch (error) {
        // If media upload fails, delete the log and throw the error
        await this.deleteLog(logData.id);
        throw error;
      }
    }

    return logData;
  }

  async updateLog(
    id: string,
    cocktailId: string,
    rating?: number | null,
    specialIngredients?: string | null,
    comments?: string | null,
    location?: string | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null,
    media?: { url: string; type: 'image' | 'video' }[] | null
  ): Promise<CocktailLog> {
    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error("Rating must be an integer between 1 and 5");
      }
    }

    // Get the existing log to compare media
    const { data: existingLog, error: fetchError } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Handle media updates
    if (media) {
      try {
        // Find media items to soft delete (items in existingLog.media but not in new media)
        const mediaToDelete = existingLog.media
          ?.filter((existing: { url: string; type: 'image' | 'video' }) => !media.some(newItem => newItem.url === existing.url))
          .map((item: { url: string; type: 'image' | 'video' }) => item.url) || [];

        // Soft delete removed media files
        if (mediaToDelete.length > 0) {
          await cocktailLogsMediaService.softDeleteMultipleMedia(mediaToDelete);
        }

        // Upload new media files
        const updatedMedia = await Promise.all(
          media.map(async (item: { url: string; type: 'image' | 'video' }) => {
            if (item.url.startsWith('blob:')) {
              // This is a new file that needs to be uploaded
              const response = await fetch(item.url);
              const blob = await response.blob();
              const file = new File([blob], `media-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`, {
                type: item.type === 'video' ? 'video/mp4' : 'image/jpeg'
              });
              const url = await cocktailLogsMediaService.uploadMedia(file, existingLog.user_id, id);
              return { url, type: item.type };
            }
            return item; // Keep existing media items
          })
        );

        // Update the log with all changes
        const { data, error } = await supabase
          .from("cocktail_logs")
          .update({
            cocktail_id: cocktailId,
            rating: rating || null,
            special_ingredients: specialIngredients,
            comments,
            location,
            bartender,
            tags,
            drink_date: drinkDate,
            media: updatedMedia,
            updated_at: new Date()
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        throw error;
      }
    } else {
      // If no media changes, just update the other fields
      const { data, error } = await supabase
        .from("cocktail_logs")
        .update({
          cocktail_id: cocktailId,
          rating: rating || null,
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
  }

  async deleteLog(id: string): Promise<void> {
    // Get the log to find media files to soft delete
    const { data: log, error: fetchError } = await supabase
      .from("cocktail_logs")
      .select("media")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Soft delete associated media files
    if (log.media && log.media.length > 0) {
      const mediaUrls = log.media.map((item: { url: string; type: 'image' | 'video' }) => item.url);
      await cocktailLogsMediaService.softDeleteMultipleMedia(mediaUrls);
    }

    // Delete the log
    const { error } = await supabase
      .from("cocktail_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getLogsByCocktailId(cocktailId: string): Promise<CocktailLog[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("cocktail_id", cocktailId)
      .eq("user_id", user.user.id)
      .order("drink_date", { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(log => this.mapLog(log)));
  }

  async getLogsByUserId(userId?: string): Promise<CocktailLog[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("user_id", userId || user.user.id)
      .order("drink_date", { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(log => this.mapLog(log)));
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
    const allCocktails = cocktailService.getAllCocktailsWithDetails();

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

  async getEnhancedUserStats() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // Get all logs for the user
    const { data: logs } = await supabase
      .from("cocktail_logs")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (!logs) return null;

    // Get all cocktails from our in-memory data
    const allCocktails = cocktailService.getAllCocktails();

    // Calculate basic stats
    const totalCocktailsDrunk = logs.length;
    const uniqueCocktails = new Set(logs.map(log => log.cocktail_id)).size;
    const uniqueBars = new Set(logs.map(log => log.location).filter(Boolean)).size;

    // Get drinks logged over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const drinksByMonth = logs.reduce((acc, log) => {
      const date = new Date(log.drink_date || log.created_at);
      if (date >= sixMonthsAgo) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get top bars with drink counts
    const barDrinkCounts = logs.reduce((acc, log) => {
      if (log.location) {
        acc[log.location] = (acc[log.location] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topBarsWithMostDrinks = Object.entries(barDrinkCounts)
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent photos
    const recentPhotos = logs
      .flatMap(log => log.media || [])
      .filter(media => media.type === 'image')
      .slice(0, 6);

    return {
      basicStats: {
        totalCocktailsDrunk,
        uniqueCocktails,
        uniqueBars
      },
      drinksByMonth,
      topBarsWithMostDrinks,
      recentPhotos
    };
  }

  private async mapLog(data: any): Promise<CocktailLog> {
    // Get the cocktail from our in-memory data
    const allCocktails = cocktailService.getAllCocktails();
    const cocktail = allCocktails.find(c => c.id === data.cocktail_id);
    
    // Convert media URLs to signed URLs
    const media = data.media ? await cocktailLogsMediaService.getSignedUrlsForMediaItems(data.media) : [];
    
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
      drinkDate: data.drink_date,
      media
    };
  }
}

export const cocktailLogService = new CocktailLogService(); 