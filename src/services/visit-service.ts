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
  userId: string;
  visitDate: Date;
  location: string | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  visibility: 'public' | 'private' | 'friends';
  logs: CocktailLog[];
}

export class VisitService {
  private async handleLocationData(location?: LocationData | null): Promise<string | null> {
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

    const { data: visitData, error: createError } = await supabase
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
    if (!visit) throw new Error('Failed to retrieve created visit');

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
    if (!updatedVisit) throw new Error('Failed to retrieve updated visit');

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
      .from('visits')
      .select(`
        *,
        places (
          name,
          place_id,
          lat,
          lng,
          main_text,
          secondary_text
        ),
        cocktail_logs (
          id,
          cocktail_id,
          comments,
          created_at,
          updated_at,
          deleted_at,
          visibility,
          cocktails (
            id,
            name,
            slug,
            is_custom
          )
        )
      `)
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
      .from('visits')
      .select(`
        *,
        places (
          name,
          place_id,
          lat,
          lng,
          main_text,
          secondary_text
        ),
        cocktail_logs (
          id,
          cocktail_id,
          comments,
          created_at,
          updated_at,
          deleted_at,
          visibility,
          cocktails (
            id,
            name,
            slug,
            is_custom
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false })
      .range(offset, to);

    if (error) throw error;

    const visits = data.map(this.mapVisit);
    const hasMore = count ? offset + pageSize < count : false;

    return { visits, hasMore };
  }

  private mapVisit(data: any): Visit {
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

    return {
      id: data.id,
      userId: data.user_id,
      visitDate: data.visit_date,
      location: locationData,
      comments: data.comments,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
      visibility: data.visibility,
      logs: data.cocktail_logs
        ?.filter((log: any) => !log.deleted_at)
        .map((log: any) => ({
          id: log.id,
          cocktail: {
            id: log.cocktails.id,
            name: log.cocktails.name,
            slug: log.cocktails.slug,
            is_custom: log.cocktails.is_custom,
          },
          comments: log.comments,
          createdAt: log.created_at,
          updatedAt: log.updated_at,
          visibility: log.visibility,
        })) || [],
    };
  }
}

export const visitService = new VisitService(); 