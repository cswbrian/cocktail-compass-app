import { supabase } from '@/lib/supabase';
import { CocktailLog } from '@/types/cocktail-log';
import { cocktailLogsMediaService } from '@/services/media-service';
import { placeService } from '@/services/place-service';
import { AuthService } from '@/services/auth-service';
import { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';

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

// Add constant for cheers reaction
const CHEERS_REACTION = 'cheers';

// Add this interface near the top of the file with other interfaces
interface CocktailLogViewData {
  log_id: string;
  log_created_at: Date;
  comments: string | null;
  drink_date: Date | null;
  visibility: 'public' | 'private' | 'friends';
  user_id: string;
  username: string | null;
  place_id: string | null;
  place_name: string | null;
  cocktail_id?: string;
  cocktail_slug?: string;
  cocktail_name?: string;
  media_urls: string[];
  cheers_count: number;
  has_cheered: boolean;
}

interface ThreadsShareData {
  text: string;
  mediaUrls?: string[];
  cocktailName: string;
  location?: string;
}

export class CocktailLogService {
  private async handleMediaUpload(
    media: { url: string; type: 'image' | 'video' }[],
    userId: string,
    entityId: string,
    entityType: string = 'cocktail_log',
  ): Promise<void> {
    if (!media?.length) return;

    const user = await AuthService.getCurrentSession();
    if (!user) throw new Error('Not authenticated');

    await Promise.all(
      media.map(async item => {
        if (!item.url.startsWith('blob:')) return;

        const response = await fetch(item.url);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `media-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`,
          {
            type:
              item.type === 'video'
                ? 'video/mp4'
                : 'image/jpeg',
          },
        );

        const filePath =
          await cocktailLogsMediaService.uploadMedia(
            file,
            userId,
            entityId,
            {
              originalName: file.name,
              contentType: file.type,
              fileSize: file.size,
              entityType,
              entityId,
            },
          );

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
            status: 'active',
          });

        if (mediaError) throw mediaError;
      }),
    );
  }

  private async handleLocationData(
    location?: LocationData | null,
  ): Promise<string | null> {
    if (!location) return null;

    const place = await placeService.getOrCreatePlace({
      place_id: location.place_id,
      name: location.name,
      main_text: location.main_text,
      secondary_text: location.secondary_text,
      lat: location.lat,
      lng: location.lng,
      is_verified: false,
    });
    return place.id;
  }

  private async handleMediaDeletion(
    mediaItems: { url: string; type: 'image' | 'video' }[],
    existingMedia: {
      url: string;
      type: 'image' | 'video';
    }[],
    entityId: string,
  ): Promise<void> {
    const removedMedia = existingMedia.filter(
      existing =>
        !mediaItems.some(
          current => current.url === existing.url,
        ),
    );

    if (!removedMedia.length) return;

    await Promise.all(
      removedMedia.map(item =>
        cocktailLogsMediaService.softDeleteMedia(item.url),
      ),
    );
  }

  private async revalidateStats() {
    await mutate(CACHE_KEYS.USER_STATS);
  }

  async createLog(
    cocktailId: string,
    userId: string,
    comments?: string | null,
    location?: LocationData | null,
    drinkDate?: Date | null,
    media?:
      | { url: string; type: 'image' | 'video' }[]
      | null,
    visibility: 'public' | 'private' | 'friends' = 'public',
  ): Promise<CocktailLog> {
    const placeId = await this.handleLocationData(location);

    const { data: logData, error: createError } =
      await supabase
        .from('cocktail_logs')
        .insert([
          {
            cocktail_id: cocktailId,
            user_id: userId,
            comments,
            place_id: placeId,
            drink_date: drinkDate,
            visibility,
          },
        ])
        .select()
        .single();

    if (createError) throw createError;

    try {
      if (media?.length) {
        await this.handleMediaUpload(
          media,
          userId,
          logData.id,
        );
      }

      const updatedLog = await this.getLogById(logData.id);
      if (!updatedLog)
        throw new Error('Failed to retrieve created log');

      await this.revalidateStats();
      return updatedLog;
    } catch (error) {
      await this.deleteLog(logData.id);
      throw error;
    }
  }

  async updateLog(
    id: string,
    cocktailId: string,
    comments?: string | null,
    location?: LocationData | null,
    drinkDate?: Date | null,
    media?:
      | { url: string; type: 'image' | 'video' }[]
      | null,
    visibility?: 'public' | 'private' | 'friends',
  ): Promise<CocktailLog> {
    const placeId = await this.handleLocationData(location);
    const existingLog = await this.getLogById(id);
    if (!existingLog) throw new Error('Log not found');

    if (media) {
      try {
        if (existingLog.media) {
          await this.handleMediaDeletion(
            media,
            existingLog.media,
            id,
          );
        }

        const newMedia = media.filter(item =>
          item.url.startsWith('blob:'),
        );
        if (newMedia.length) {
          await this.handleMediaUpload(
            newMedia,
            existingLog.userId,
            id,
          );
        }
      } catch (error) {
        console.error(
          'Error handling media changes:',
          error,
        );
        throw error;
      }
    }

    const { error } = await supabase
      .from('cocktail_logs')
      .update({
        cocktail_id: cocktailId,
        comments,
        place_id: placeId,
        drink_date: drinkDate,
        updated_at: new Date(),
        visibility: visibility || undefined,
      })
      .eq('id', id);

    if (error) throw error;

    const updatedLog = await this.getLogById(id);
    if (!updatedLog)
      throw new Error('Failed to retrieve updated log');

    await this.revalidateStats();
    return updatedLog;
  }

  async deleteLog(id: string): Promise<void> {
    const { data: log, error: fetchError } = await supabase
      .from('cocktail_logs')
      .select(
        `
        media_items (
          id,
          status
        )
      `,
      )
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (log.media_items?.length) {
      const mediaIds = log.media_items.map(
        (item: any) => item.id,
      );
      await cocktailLogsMediaService.softDeleteMultipleMedia(
        mediaIds,
      );
    }

    const { error } = await supabase
      .from('cocktail_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await this.revalidateStats();
  }

  private async queryLogsFeed(
    viewName: string,
    page: number,
    pageSize: number,
    additionalFilters?: { [key: string]: any },
    single?: boolean,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    const user = await AuthService.getCurrentSession();
    if (!user) return { logs: [], hasMore: false };

    const offset = (page - 1) * pageSize;
    const to = offset + pageSize - 1;

    let query = supabase
      .from(viewName)
      .select(
        `
        log_id,
        log_created_at,
        comments,
        drink_date,
        visibility,
        user_id,
        username,
        place_id,
        place_name,
        cocktail_id,
        cocktail_slug,
        cocktail_name,
        media_urls,
        cheers_count,
        has_cheered
      `,
        { count: 'exact' },
      )
      .order('drink_date', { ascending: false });

    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(
        ([key, value]) => {
          query = query.eq(key, value);
        },
      );
    }

    // Add range after all filters are applied
    query = query.range(offset, to);

    const { data, count, error } = await query;
    if (error) throw error;

    // If no data is returned, return empty result
    if (!data) {
      return { logs: [], hasMore: false };
    }

    const logs = data.map((log: CocktailLogViewData) =>
      this.mapLogFromViewData(log),
    );
    const hasMore = count
      ? offset + pageSize < count
      : false;

    return { logs, hasMore };
  }

  async getPublicLogs(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    return this.queryLogsFeed(
      'all_public_cocktail_logs_feed',
      page,
      pageSize,
    );
  }

  async getOwnLogs(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    return this.queryLogsFeed(
      'my_cocktail_logs_feed',
      page,
      pageSize,
      { user_id: userId },
    );
  }

  async getLogsByCocktailId(
    cocktailId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    return this.queryLogsFeed(
      'all_cocktail_logs_feed',
      page,
      pageSize,
      {
        cocktail_id: cocktailId,
      },
    );
  }

  async getLogsByPlaceId(
    placeId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    return this.queryLogsFeed(
      'all_public_cocktail_logs_feed',
      page,
      pageSize,
      {
        place_id: placeId,
      },
    );
  }

  async getPublicLogsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ logs: CocktailLog[]; hasMore: boolean }> {
    return this.queryLogsFeed(
      'all_public_cocktail_logs_feed',
      page,
      pageSize,
      { user_id: userId },
    );
  }

  async getLogById(
    logId: string,
  ): Promise<CocktailLog | null> {
    const { logs } = await this.queryLogsFeed(
      'all_cocktail_logs_feed',
      1,
      1,
      { log_id: logId },
      true,
    );
    return logs[0] || null;
  }

  private mapLog(data: any): CocktailLog {
    const locationData = data.places
      ? JSON.stringify({
          name: data.places.name,
          place_id: data.places.place_id,
          lat: data.places.lat,
          lng: data.places.lng,
          main_text: data.places.main_text,
          secondary_text: data.places.secondary_text,
        })
      : null;

    const media =
      data.media_items
        ?.filter((item: any) => item.status === 'active')
        .map((item: any) => ({
          id: item.id,
          url: item.url.startsWith('http')
            ? item.url
            : `${import.meta.env.VITE_R2_BUCKET_URL}/${item.url}`,
          type: item.content_type.startsWith('video/')
            ? 'video'
            : 'image',
          contentType: item.content_type,
          fileSize: item.file_size,
          originalName: item.original_name,
          createdAt: item.created_at,
          status: item.status,
        })) || [];

    const cocktailName =
      typeof data.cocktails?.name === 'string'
        ? JSON.parse(data.cocktails.name)
        : data.cocktails?.name || { en: '', zh: null };

    return {
      id: data.id,
      cocktail: {
        id: data.cocktails?.id || '',
        name: cocktailName,
        slug: data.cocktails?.slug || '',
        is_custom: data.cocktails?.is_custom || false,
      },
      userId: data.user_id,
      location: locationData,
      comments: data.comments,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      drinkDate: data.drink_date,
      media,
      deletedAt: data.deleted_at,
      visibility: data.visibility,
      reactions: {},
      has_cheered: data.has_cheered || false,
    };
  }

  // Update getReactionTypes to use constant
  async getReactionTypes(): Promise<ReactionType[]> {
    return [
      {
        id: '', // Not needed since we use name
        name: CHEERS_REACTION,
        icon: 'heart',
        description: 'Cheers!',
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  // Update addReaction to use name
  async addReaction(
    cocktailLogId: string,
    userId: string,
    reactionName: string = CHEERS_REACTION,
  ): Promise<Reaction> {
    // First get the reaction type ID
    const { data: reactionType, error: typeError } =
      await supabase
        .from('reaction_types')
        .select('id')
        .eq('name', reactionName)
        .single();

    if (typeError) throw typeError;

    // Then insert the reaction
    const { data, error } = await supabase
      .from('cocktail_log_reactions')
      .insert([
        {
          cocktail_log_id: cocktailLogId,
          user_id: userId,
          reaction_type_id: reactionType.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return this.mapReaction(data);
  }

  // Update removeReaction to use name
  async removeReaction(
    cocktailLogId: string,
    userId: string,
    reactionName: string = CHEERS_REACTION,
  ): Promise<void> {
    // First get the reaction type ID
    const { data: reactionType, error: typeError } =
      await supabase
        .from('reaction_types')
        .select('id')
        .eq('name', reactionName)
        .single();

    if (typeError) throw typeError;

    // Then delete the reaction
    const { error } = await supabase
      .from('cocktail_log_reactions')
      .delete()
      .match({
        cocktail_log_id: cocktailLogId,
        user_id: userId,
        reaction_type_id: reactionType.id,
      });

    if (error) throw error;
  }

  // Update getReactions to use name
  async getReactions(cocktailLogId: string): Promise<{
    reactions: Reaction[];
    counts: { [key: string]: number };
  }> {
    const { data, error } = await supabase
      .from('cocktail_log_reactions')
      .select(
        `
        *,
        reaction_types (
          id,
          name,
          icon
        )
      `,
      )
      .eq('cocktail_log_id', cocktailLogId)
      .eq('reaction_types.name', CHEERS_REACTION);

    if (error) throw error;

    // Calculate reaction counts
    const counts = {
      [CHEERS_REACTION]: data.length,
    };

    return {
      reactions: data.map(this.mapReaction),
      counts,
    };
  }

  private mapReactionType(data: any): ReactionType {
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
    };
  }

  private mapReaction(data: any): Reaction {
    return {
      id: data.id,
      userId: data.user_id,
      cocktailLogId: data.cocktail_log_id,
      reactionTypeId: data.reaction_type_id,
      createdAt: new Date(data.created_at),
    };
  }

  private mapLogFromViewData(
    log: CocktailLogViewData,
  ): CocktailLog {
    const media = this.mapMediaFromUrls(
      log.media_urls || [],
    );
    const reactions = { cheers: log.cheers_count || 0 };
    const cocktailName =
      typeof log.cocktail_name === 'string'
        ? JSON.parse(log.cocktail_name)
        : log.cocktail_name;

    return {
      id: log.log_id,
      cocktail: {
        id: log.cocktail_id,
        name: cocktailName,
        slug: log.cocktail_slug,
        is_custom: false,
      },
      userId: log.user_id,
      location: log.place_id
        ? JSON.stringify({
            name: log.place_name,
            place_id: log.place_id,
            lat: 0,
            lng: 0,
            main_text: log.place_name,
            secondary_text: '',
          })
        : null,
      comments: log.comments,
      createdAt: log.log_created_at,
      updatedAt: log.log_created_at,
      drinkDate: log.drink_date,
      media,
      deletedAt: null,
      visibility: log.visibility,
      reactions,
      has_cheered: log.has_cheered || false,
      user: {
        id: log.user_id,
        username: log.username || null,
        avatarUrl: null,
      },
    } as CocktailLog;
  }

  private mapMediaFromUrls(urls: string[]): {
    id: string;
    url: string;
    type: 'image' | 'video';
    contentType: string;
    fileSize: number;
    originalName: string;
    createdAt: Date;
    status: 'active';
  }[] {
    return (urls || []).map((url: string) => ({
      id: url,
      url: url.startsWith('http')
        ? url
        : `${import.meta.env.VITE_R2_BUCKET_URL}/${url}`,
      type: url.match(/\.(mp4|mov)$/i)
        ? 'video'
        : ('image' as const),
      contentType: url.match(/\.(mp4|mov)$/i)
        ? 'video/mp4'
        : 'image/jpeg',
      fileSize: 0,
      originalName: url.split('/').pop() || '',
      createdAt: new Date(),
      status: 'active',
    }));
  }

  async shareToThreads(
    logId: string,
    language: string,
  ): Promise<void> {
    const log = await this.getLogById(logId);
    if (!log) throw new Error('Log not found');

    // Get the log URL
    const logUrl = `${window.location.origin}/${language}/logs/${logId}`;

    // Create the text content using comments if available, otherwise use a default message
    const text = log.comments
      ? `${log.comments}\n\n${logUrl}`
      : `Just tried ${log.cocktail.name.en} at ${log.location ? JSON.parse(log.location).name : 'a secret spot'}! \n\n${logUrl}`;

    // Encode the text for URL
    const encodedText = encodeURIComponent(text);

    // Try to open Threads app first
    window.location.href = `threads://post?text=${encodedText}`;

    // Fallback to web version after a short delay
    setTimeout(() => {
      window.open(
        `https://www.threads.net/intent/post?text=${encodedText}`,
        '_blank',
      );
    }, 1000);
  }
}

export const cocktailLogService = new CocktailLogService();
