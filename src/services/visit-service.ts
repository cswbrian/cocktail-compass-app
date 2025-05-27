import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';
import { placeService } from '@/services/place-service';
import { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';
import { CocktailLog } from '@/types/cocktail-log';

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface Visit {
  id: string;
  user: {
    id: string;
    username: string;
  };
  visitDate: Date;
  location: {
    name: string;
    place_id: string;
  } | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  visibility: 'public' | 'private' | 'friends';
  logs: Array<{
    id: string;
    cocktail: {
      id: string;
      name: string;
      slug: string;
    };
    comments: string | null;
    drinkDate: Date;
    createdAt: Date;
    updatedAt: Date;
    visibility: string;
    media: Array<{
      id: string;
      url: string;
    }>;
  }>;
}

export class VisitService {
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

  private async revalidateStats() {
    await mutate(CACHE_KEYS.USER_STATS);
  }

  async createVisit(
    userId: string,
    visitDate: Date,
    location?: LocationData | null,
    comments?: string | null,
    visibility: 'public' | 'private' | 'friends' = 'public',
  ): Promise<Visit> {
    const placeId = await this.handleLocationData(location);

    const { data: visitData, error: createError } =
      await supabase
        .from('visits')
        .insert([
          {
            user_id: userId,
            visit_date: visitDate,
            place_id: placeId,
            comments,
            visibility,
          },
        ])
        .select()
        .single();

    if (createError) throw createError;

    const visit = await this.getVisitById(visitData.id);
    if (!visit)
      throw new Error('Failed to retrieve created visit');

    await this.revalidateStats();
    return visit;
  }

  async updateVisit(
    id: string,
    visitDate?: Date,
    location?: LocationData | null,
    comments?: string | null,
    visibility?: 'public' | 'private' | 'friends',
  ): Promise<Visit> {
    const placeId = await this.handleLocationData(location);
    const existingVisit = await this.getVisitById(id);
    if (!existingVisit) throw new Error('Visit not found');

    const { error } = await supabase
      .from('visits')
      .update({
        visit_date: visitDate,
        place_id: placeId,
        comments,
        updated_at: new Date(),
        visibility: visibility || undefined,
      })
      .eq('id', id);

    if (error) throw error;

    const updatedVisit = await this.getVisitById(id);
    if (!updatedVisit)
      throw new Error('Failed to retrieve updated visit');

    await this.revalidateStats();
    return updatedVisit;
  }

  async deleteVisit(id: string): Promise<void> {
    const { error } = await supabase
      .from('visits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await this.revalidateStats();
  }

  async getVisitById(id: string): Promise<Visit | null> {
    const { data, error } = await supabase
      .from('all_visits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapVisit(data);
  }

  async getVisitsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ visits: Visit[]; hasMore: boolean }> {
    const offset = (page - 1) * pageSize;
    const to = offset + pageSize - 1;

    const { data, count, error } = await supabase
      .from('my_visits')
      .select('*', { count: 'exact' })
      .order('visit_date', { ascending: false })
      .range(offset, to);

    if (error) throw error;

    const visits = data.map(this.mapVisit);
    const hasMore = count
      ? offset + pageSize < count
      : false;

    return { visits, hasMore };
  }

  async getPublicVisits(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ visits: Visit[]; hasMore: boolean }> {
    const offset = (page - 1) * pageSize;
    const to = offset + pageSize - 1;

    const { data, count, error } = await supabase
      .from('all_public_visits')
      .select('*', { count: 'exact' })
      .order('visit_date', { ascending: false })
      .range(offset, to);

    if (error) throw error;

    const visits = data.map(this.mapVisit);
    const hasMore = count
      ? offset + pageSize < count
      : false;

    return { visits, hasMore };
  }

  private mapVisit(data: any): Visit {
    return {
      id: data.id,
      user: {
        id: data.user_id,
        username: data.username,
      },
      visitDate: data.visit_date,
      location: data.place_id ? {
        name: data.place_name,
        place_id: data.place_id,
      } : null,
      comments: data.comments,
      createdAt: data.created_at,
      updatedAt: data.created_at,
      deletedAt: null,
      visibility: data.visibility,
      logs: (data.cocktail_logs || []).map((log: any) => ({
        id: log.log_id,
        cocktail: {
          id: log.cocktail_id,
          name: log.cocktail_name,
          slug: log.cocktail_slug,
        },
        comments: log.comments,
        drinkDate: log.drink_date,
        createdAt: log.log_created_at,
        updatedAt: log.log_created_at,
        visibility: 'public',
        media: log.media || [],
      })),
    };
  }
}

export const visitService = new VisitService();
