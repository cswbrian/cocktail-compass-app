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

    // First create the log
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
        drink_date: drinkDate
      }])
      .select()
      .single();

    if (createError) throw createError;

    // If there are media files to upload, handle them
    if (media && media.length > 0) {
      try {
        // Upload each media file and create media_items records
        await Promise.all(
          media.map(async (item: { url: string; type: 'image' | 'video' }) => {
            if (item.url.startsWith('blob:')) {
              // This is a new file that needs to be uploaded
              const response = await fetch(item.url);
              const blob = await response.blob();
              const file = new File([blob], `media-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`, {
                type: item.type === 'video' ? 'video/mp4' : 'image/jpeg'
              });
              
              // Upload to R2 and get the file path
              const filePath = await cocktailLogsMediaService.uploadMedia(
                file,
                userId,
                logData.id,
                {
                  originalName: file.name,
                  contentType: file.type,
                  fileSize: file.size,
                  entityType: 'cocktail_log',
                  entityId: logData.id
                }
              );
              
              // Create media_item record
              const { error: mediaError } = await supabase
                .from('media_items')
                .insert({
                  url: filePath,
                  user_id: userId,
                  entity_id: logData.id,
                  entity_type: 'cocktail_log',
                  bucket: 'cocktail-logs',
                  content_type: file.type,
                  file_size: file.size,
                  original_name: file.name,
                  status: 'active'
                });

              if (mediaError) throw mediaError;
            }
          })
        );

        const updatedLog = await this.getLogById(logData.id);
        if (!updatedLog) {
          throw new Error('Failed to retrieve created log');
        }
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

    // Get the existing log
    const { data: existingLog, error: fetchError } = await supabase
      .from("cocktail_logs")
      .select(`
        *,
        media_items (
          id,
          url,
          content_type,
          file_size,
          original_name,
          status
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Handle new media uploads only
    if (media) {
      try {
        // Upload only new media files (those starting with blob:)
        await Promise.all(
          media.map(async (item: { url: string; type: 'image' | 'video' }) => {
            if (item.url.startsWith('blob:')) {
              // This is a new file that needs to be uploaded
              const response = await fetch(item.url);
              const blob = await response.blob();
              const file = new File([blob], `media-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`, {
                type: item.type === 'video' ? 'video/mp4' : 'image/jpeg'
              });
              
              // Upload to R2 and get the file path
              const filePath = await cocktailLogsMediaService.uploadMedia(
                file,
                existingLog.user_id,
                id,
                {
                  originalName: file.name,
                  contentType: file.type,
                  fileSize: file.size,
                  entityType: 'cocktail_log',
                  entityId: id
                }
              );
              
              // Create media_item record
              const { error: mediaError } = await supabase
                .from('media_items')
                .insert({
                  url: filePath,
                  user_id: existingLog.user_id,
                  entity_id: id,
                  entity_type: 'cocktail_log',
                  bucket: 'cocktail-logs',
                  content_type: file.type,
                  file_size: file.size,
                  original_name: file.name,
                  status: 'active'
                });

              if (mediaError) throw mediaError;
            }
          })
        );
      } catch (error) {
        console.error('Error handling media uploads:', error);
        throw error;
      }
    }

    // Update the log with other changes
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
    const updatedLog = await this.getLogById(id);
    if (!updatedLog) {
      throw new Error('Failed to retrieve updated log');
    }
    return updatedLog;
  }

  async deleteLog(id: string): Promise<void> {
    // Get the log to find media files to soft delete
    const { data: log, error: fetchError } = await supabase
      .from("cocktail_logs")
      .select(`
        media_items (
          url,
          status
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Soft delete associated media files
    if (log.media_items && log.media_items.length > 0) {
      const mediaUrls = log.media_items.map((item: any) => item.url);
      await cocktailLogsMediaService.softDeleteMultipleMedia(mediaUrls);
      
      // Update media_items status to deleted
      const { error: updateError } = await supabase
        .from('media_items')
        .update({ status: 'deleted' })
        .in('url', mediaUrls);

      if (updateError) throw updateError;
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
        ),
        media_items (
          id,
          url,
          content_type,
          file_size,
          original_name,
          created_at
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
          slug,
          is_custom
        ),
        media_items (
          id,
          url,
          content_type,
          file_size,
          original_name,
          created_at,
          status
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
        ),
        media_items (
          id,
          url,
          content_type,
          file_size,
          original_name,
          created_at
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
          slug,
          is_custom
        ),
        media_items (
          id,
          url,
          content_type,
          file_size,
          original_name,
          created_at
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
    
    // Convert media_items to the expected format
    const media = data.media_items ? data.media_items
      .filter((item: any) => item.status === 'active')
      .map((item: any) => {
        // Ensure the URL is properly formatted with the R2 bucket URL
        const url = item.url.startsWith('http') 
          ? item.url 
          : `${process.env.NEXT_PUBLIC_R2_BUCKET_URL}/${item.url}`;

        return {
          id: item.id,
          url,
          type: item.content_type.startsWith('video/') ? 'video' : 'image',
          contentType: item.content_type,
          fileSize: item.file_size,
          originalName: item.original_name,
          createdAt: item.created_at,
          status: item.status
        };
      }) : [];
    
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