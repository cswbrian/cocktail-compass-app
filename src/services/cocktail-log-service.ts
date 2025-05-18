import { supabase } from "@/lib/supabase";
import { CocktailLog } from "@/types/cocktail-log";
import { cocktailLogsMediaService } from "@/services/media-service";
import { placeService } from "@/services/place-service";
import { AuthService } from "@/services/auth-service";
import { mutate } from "swr";
import { CACHE_KEYS } from "@/lib/swr-config";

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface ReactionType {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

interface Reaction {
  id: string;
  userId: string;
  cocktailLogId: string;
  reactionTypeId: string;
  createdAt: Date;
}

export class CocktailLogService {
  private async handleMediaUpload(
    media: { url: string; type: 'image' | 'video' }[],
    userId: string,
    entityId: string,
    entityType: string = 'cocktail_log'
  ): Promise<void> {
    if (!media || media.length === 0) return;

    // Check authentication first
    const user = await AuthService.getCurrentSession();
    if (!user) {
      throw new Error('Not authenticated');
    }

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
            entityId,
            {
              originalName: file.name,
              contentType: file.type,
              fileSize: file.size,
              entityType,
              entityId
            }
          );
          
          // Create media_item record
          const { error: mediaError } = await supabase
            .from('media_items')
            .insert({
              url: filePath,
              user_id: userId,
              entity_id: entityId,
              entity_type: entityType,
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
  }

  private async handleLocationData(location?: LocationData | null): Promise<string | null> {
    if (!location) return null;

    const place = await placeService.getOrCreatePlace({
      place_id: location.place_id,
      name: location.name,
      main_text: location.main_text,
      secondary_text: location.secondary_text,
      lat: location.lat,
      lng: location.lng,
      is_verified: false
    });
    return place.id;
  }

  private validateRating(rating?: number | null): void {
    if (rating !== undefined && rating !== null) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new Error("Rating must be an integer between 1 and 5");
      }
    }
  }

  private async handleMediaDeletion(
    mediaItems: { url: string; type: 'image' | 'video' }[],
    existingMedia: { url: string; type: 'image' | 'video' }[],
    entityId: string
  ): Promise<void> {
    // Find media items that were removed (exist in existingMedia but not in mediaItems)
    const removedMedia = existingMedia.filter(
      existing => !mediaItems.some(current => current.url === existing.url)
    );

    if (removedMedia.length === 0) return;

    // Use the media service to handle the soft deletion
    await Promise.all(
      removedMedia.map(item => 
        cocktailLogsMediaService.softDeleteMedia(item.url)
      )
    );
  }

  private async revalidateStats() {
    await mutate(CACHE_KEYS.USER_STATS);
  }

  async createLog(
    cocktailId: string,
    userId: string,
    rating?: number | null,
    comments?: string | null,
    location?: LocationData | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null,
    media?: { url: string; type: 'image' | 'video' }[] | null,
    visibility: 'public' | 'private' | 'friends' = 'public'
  ): Promise<CocktailLog> {
    this.validateRating(rating);
    const placeId = await this.handleLocationData(location);

    // First create the log
    const { data: logData, error: createError } = await supabase
      .from("cocktail_logs")
      .insert([{
        cocktail_id: cocktailId,
        user_id: userId,
        rating: rating || null,
        comments,
        place_id: placeId,
        bartender,
        tags,
        drink_date: drinkDate,
        visibility
      }])
      .select()
      .single();

    if (createError) throw createError;

    try {
      // Handle media uploads if any
      if (media && media.length > 0) {
        await this.handleMediaUpload(media, userId, logData.id);
      }

      const updatedLog = await this.getLogById(logData.id);
      if (!updatedLog) {
        throw new Error('Failed to retrieve created log');
      }
      await this.revalidateStats();
      return updatedLog;
    } catch (error) {
      // If media upload fails, delete the log and throw the error
      await this.deleteLog(logData.id);
      throw error;
    }
  }

  async updateLog(
    id: string,
    cocktailId: string,
    rating?: number | null,
    comments?: string | null,
    location?: LocationData | null,
    bartender?: string | null,
    tags?: string[] | null,
    drinkDate?: Date | null,
    media?: { url: string; type: 'image' | 'video' }[] | null,
    visibility?: 'public' | 'private' | 'friends'
  ): Promise<CocktailLog> {
    this.validateRating(rating);
    const placeId = await this.handleLocationData(location);

    // Get the existing log
    const existingLog = await this.getLogById(id);
    if (!existingLog) {
      throw new Error('Log not found');
    }

    // Handle media changes
    if (media) {
      try {
        // Handle media deletions
        if (existingLog.media) {
          await this.handleMediaDeletion(media, existingLog.media, id);
        }

        // Handle new media uploads
        const newMedia = media.filter(item => item.url.startsWith('blob:'));
        if (newMedia.length > 0) {
          await this.handleMediaUpload(newMedia, existingLog.userId, id);
        }
      } catch (error) {
        console.error('Error handling media changes:', error);
        throw error;
      }
    }

    // Update the log
    const { error } = await supabase
      .from("cocktail_logs")
      .update({
        cocktail_id: cocktailId,
        rating: rating || null,
        comments,
        place_id: placeId,
        bartender,
        tags,
        drink_date: drinkDate,
        updated_at: new Date(),
        visibility: visibility || undefined
      })
      .eq("id", id);

    if (error) throw error;

    const updatedLog = await this.getLogById(id);
    if (!updatedLog) {
      throw new Error('Failed to retrieve updated log');
    }
    await this.revalidateStats();
    return updatedLog;
  }

  async deleteLog(id: string): Promise<void> {
    // Get the log to find media files to soft delete
    const { data: log, error: fetchError } = await supabase
      .from("cocktail_logs")
      .select(`
        media_items (
          id,
          status
        )
      `)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Soft delete associated media files
    if (log.media_items && log.media_items.length > 0) {
      const mediaIds = log.media_items.map((item: any) => item.id);
      await cocktailLogsMediaService.softDeleteMultipleMedia(mediaIds);
    }

    // Soft delete the log by setting deleted_at
    const { error } = await supabase
      .from("cocktail_logs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    await this.revalidateStats();
  }

  async getLogsByQuery(query: { [key: string]: any }, page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    const user = await AuthService.getCurrentSession();
    if (!user) return { logs: [], hasMore: false };

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Build visibility filter
    const baseQuery = supabase
      .from("cocktail_logs")
      .select('*', { count: 'exact', head: true })
      .match({ ...query, user_id: user.id })
      .is("deleted_at", null);

    // Apply visibility filter
    const { count, error: countError } = await baseQuery
      .or(`visibility.eq.public,user_id.eq.${user.id},and(visibility.eq.friends,user_id.eq.${user.id})`);

    if (countError) throw countError;

    // Then get paginated data
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
      .match({ ...query, user_id: user.id })
      .is("deleted_at", null)
      .or(`visibility.eq.public,user_id.eq.${user.id},and(visibility.eq.friends,user_id.eq.${user.id})`)
      .order("drink_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const logs = await Promise.all(data.map(log => this.mapLog(log)));
    const hasMore = (offset + pageSize) < (count || 0);

    return { logs, hasMore };
  }

  async getLogsByCocktailId(cocktailId: string, page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    return this.getLogsByQuery({ cocktail_id: cocktailId }, page, pageSize);
  }

  async getLogsByUserId(userId?: string, page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    const user = await AuthService.getCurrentSession();
    if (!user) return { logs: [], hasMore: false };
    return this.getLogsByQuery({ user_id: userId || user.id }, page, pageSize);
  }

  async getLogsByPlaceId(placeId: string, page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    return this.getLogsByQuery({ place_id: placeId }, page, pageSize);
  }

  private async getLogByQuery(query: { [key: string]: any }): Promise<CocktailLog | null> {
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
          created_at,
          status
        )
      `)
      .match({ ...query, user_id: user.id })
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

  async getLogById(logId: string): Promise<CocktailLog | null> {
    return this.getLogByQuery({ id: logId });
  }

  private mapLog(data: any, reactions?: { [key: string]: number }): CocktailLog {
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
          : `${import.meta.env.VITE_R2_BUCKET_URL}/${item.url}`;

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
      location: locationData,
      bartender: data.bartender,
      comments: data.comments,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      drinkDate: data.drink_date,
      media,
      deletedAt: data.deleted_at,
      visibility: data.visibility,
      reactions: reactions || {}
    };
  }

  // New reaction methods
  async getReactionTypes(): Promise<ReactionType[]> {
    const { data, error } = await supabase
      .from("reaction_types")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data.map(this.mapReactionType);
  }

  async addReaction(
    cocktailLogId: string, 
    userId: string, 
    reactionTypeId: string
  ): Promise<Reaction> {
    const { data, error } = await supabase
      .from("cocktail_log_reactions")
      .insert([{
        cocktail_log_id: cocktailLogId,
        user_id: userId,
        reaction_type_id: reactionTypeId
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapReaction(data);
  }

  async removeReaction(
    cocktailLogId: string, 
    userId: string, 
    reactionTypeId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("cocktail_log_reactions")
      .delete()
      .match({
        cocktail_log_id: cocktailLogId,
        user_id: userId,
        reaction_type_id: reactionTypeId
      });

    if (error) throw error;
  }

  async getReactions(cocktailLogId: string): Promise<{
    reactions: Reaction[],
    counts: { [key: string]: number }
  }> {
    const { data, error } = await supabase
      .from("cocktail_log_reactions")
      .select(`
        *,
        reaction_types (
          id,
          name,
          icon
        )
      `)
      .eq("cocktail_log_id", cocktailLogId);

    if (error) throw error;

    // Calculate reaction counts
    const counts = data.reduce((acc: { [key: string]: number }, curr: any) => {
      const typeName = curr.reaction_types.name;
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    return {
      reactions: data.map(this.mapReaction),
      counts
    };
  }

  private mapReactionType(data: any): ReactionType {
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at)
    };
  }

  private mapReaction(data: any): Reaction {
    return {
      id: data.id,
      userId: data.user_id,
      cocktailLogId: data.cocktail_log_id,
      reactionTypeId: data.reaction_type_id,
      createdAt: new Date(data.created_at)
    };
  }

  async getPublicLogs(page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    const user = await AuthService.getCurrentSession();
    if (!user) return { logs: [], hasMore: false };

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count of public logs
    const { count, error: countError } = await supabase
      .from("cocktail_logs_with_user_info")
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public')
      .is("deleted_at", null);

    if (countError) throw countError;

    // Get paginated public logs with user info and reactions
    const { data, error } = await supabase
      .from("cocktail_logs_with_user_info")
      .select(`
        id,
        created_at,
        updated_at,
        user_id,
        cocktail_id,
        rating,
        comments,
        bartender,
        tags,
        drink_date,
        place_id,
        deleted_at,
        visibility,
        username,
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
        ),
        cocktail_log_reactions (
          reaction_types (
            name
          )
        )
      `)
      .eq('visibility', 'public')
      .is("deleted_at", null)
      .order("drink_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const logs = data.map(log => {
      // Calculate reaction counts from the nested data
      const reactionCounts = log.cocktail_log_reactions?.reduce((acc: { [key: string]: number }, curr: any) => {
        const typeName = curr.reaction_types.name;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {}) || {};

      const mappedLog = this.mapLog(log, reactionCounts);
      
      // Add user info
      mappedLog.user = {
        id: log.user_id,
        username: log.username || null,
        avatarUrl: null
      };

      return mappedLog;
    });

    const hasMore = (offset + pageSize) < (count || 0);

    return { logs, hasMore };
  }

  async getOwnLogs(userId: string, page: number = 1, pageSize: number = 10): Promise<{ logs: CocktailLog[], hasMore: boolean }> {
    const user = await AuthService.getCurrentSession();
    if (!user) return { logs: [], hasMore: false };

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count of user's logs
    const { count, error: countError } = await supabase
      .from("cocktail_logs")
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is("deleted_at", null);

    if (countError) throw countError;

    // Get paginated user's logs
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
      .eq('user_id', userId)
      .is("deleted_at", null)
      .order("drink_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const logs = await Promise.all(data.map(log => this.mapLog(log)));
    const hasMore = (offset + pageSize) < (count || 0);

    return { logs, hasMore };
  }
}

export const cocktailLogService = new CocktailLogService();