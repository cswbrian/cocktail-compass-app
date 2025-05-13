import { supabase } from "@/lib/supabase";
import { CocktailLog } from "@/types/cocktail-log";
import { cocktailLogsMediaService } from "@/services/media-service";
import { placeService } from "@/services/place-service";
import { AuthService } from "@/services/auth-service";
import { formatCocktailName } from "@/lib/utils";

interface CocktailWithNames {
  name: {
    en: string;
    zh: string;
  };
}

interface CocktailWithSpirits {
  id: string;
  data: {
    base_spirits: Array<{
      name: {
        en: string;
      };
    }>;
  };
}

interface LogWithCocktail {
  cocktail_id: string;
  cocktails: CocktailWithNames;
}

interface LogWithCocktailDetails extends LogWithCocktail {
  id: string;
  rating: number;
  place_id: string | null;
  bartender: string | null;
  comments: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  drink_date: string | null;
  media: { url: string; type: 'image' | 'video' }[] | null;
  places?: {
    id: string;
    place_id: string;
    name: string;
    main_text: string;
    secondary_text: string;
  } | null;
}

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

export class CocktailLogService {
  async createLog(
    cocktailId: string,
    userId: string,
    rating?: number | null,
    specialIngredients?: string | null,
    comments?: string | null,
    location?: LocationData | null,
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

    let placeId = null;
    if (location) {
      const place = await placeService.getOrCreatePlace({
        place_id: location.place_id,
        name: location.name,
        main_text: location.main_text,
        secondary_text: location.secondary_text,
        lat: location.lat,
        lng: location.lng,
        is_verified: false
      });
      placeId = place.id;
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
        place_id: placeId,
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
    location?: LocationData | null,
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

    let placeId = null;
    if (location) {
      const place = await placeService.getOrCreatePlace({
        place_id: location.place_id,
        name: location.name,
        main_text: location.main_text,
        secondary_text: location.secondary_text,
        lat: location.lat,
        lng: location.lng,
        is_verified: false
      });
      placeId = place.id;
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
            place_id: placeId,
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
          place_id: placeId,
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

    // Soft delete the log by setting deleted_at
    const { error } = await supabase
      .from("cocktail_logs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async getLogsByCocktailId(cocktailId: string): Promise<CocktailLog[]> {
    const user = await AuthService.getCurrentSession();
    if (!user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        places (
          id,
          place_id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        ),
        cocktails (
          name,
          slug
        )
      `)
      .eq("cocktail_id", cocktailId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("drink_date", { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(log => this.mapLog(log)));
  }

  async getLogsByUserId(userId?: string): Promise<CocktailLog[]> {
    const user = await AuthService.getCurrentSession();
    if (!user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        places (
          id,
          place_id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        ),
        cocktails (
          name,
          slug
        )
      `)
      .eq("user_id", userId || user.id)
      .is("deleted_at", null)
      .order("drink_date", { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(log => this.mapLog(log)));
  }

  async getLogsByPlaceId(placeId: string): Promise<CocktailLog[]> {
    const user = await AuthService.getCurrentSession();
    if (!user) return [];

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        places (
          id,
          place_id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        ),
        cocktails (
          name,
          slug
        )
      `)
      .eq("place_id", placeId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("drink_date", { ascending: false });

    if (error) throw error;
    return Promise.all(data.map(log => this.mapLog(log)));
  }

  async getLogById(logId: string): Promise<CocktailLog | null> {
    const user = await AuthService.getCurrentSession();
    if (!user) return null;

    const { data, error } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        places (
          id,
          place_id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        ),
        cocktails (
          name,
          slug
          is_custom
        )
      `)
      .eq("id", logId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw error;
    }

    return this.mapLog(data);
  }

  private async mapLog(data: any): Promise<CocktailLog> {
    // Convert place data to JSON string if it exists
    let locationData = null;
    if (data.places) {
      locationData = JSON.stringify({
        name: data.places.name,
        place_id: data.places.place_id,
        lat: data.places.lat,
        lng: data.places.lng,
        main_text: data.places.main_text,
        secondary_text: data.places.secondary_text
      });
    }
    
    // Convert media URLs to signed URLs
    const media = data.media ? await cocktailLogsMediaService.getSignedUrlsForMediaItems(data.media) : [];
    
    return {
      id: data.id,
      cocktail: data.cocktails,
      userId: data.user_id,
      rating: data.rating,
      specialIngredients: data.special_ingredients,
      location: locationData,
      bartender: data.bartender,
      comments: data.comments,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      drinkDate: data.drink_date,
      media,
      deletedAt: data.deleted_at
    };
  }
}

export const cocktailLogService = new CocktailLogService(); 