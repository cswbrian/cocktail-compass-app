import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';

export class PlaceService {
  async getOrCreatePlace(
    placeData: Omit<
      Place,
      'id' | 'created_at' | 'updated_at'
    >,
  ): Promise<Place> {
    // First try to find existing place
    const { data: existingPlace, error: findError } =
      await supabase
        .from('places')
        .select('*')
        .eq('place_id', placeData.place_id)
        .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw findError;
    }

    if (existingPlace) {
      // Compute the is_open status for existing place
      try {
        const { data: openStatus, error: statusError } = await supabase.rpc(
          'is_open_now',
          {
            opening_hours: existingPlace.opening_hours,
            tz: existingPlace.timezone || 'Asia/Hong_Kong'
          }
        );

        if (!statusError) {
          return {
            ...existingPlace,
            is_open: openStatus
          };
        }
      } catch (error) {
        console.warn('Error computing open status for existing place:', error);
      }

      return existingPlace;
    }

    // If place doesn't exist, create it
    const { data: newPlace, error: createError } =
      await supabase
        .from('places')
        .insert([placeData])
        .select('*')
        .single();

    if (createError) {
      throw createError;
    }

    // Compute the is_open status for new place
    try {
      const { data: openStatus, error: statusError } = await supabase.rpc(
        'is_open_now',
        {
          opening_hours: newPlace.opening_hours,
          tz: newPlace.timezone || 'Asia/Hong_Kong'
        }
      );

      if (!statusError) {
        return {
          ...newPlace,
          is_open: openStatus
        };
      }
    } catch (error) {
      console.warn('Error computing open status for new place:', error);
    }

    return newPlace;
  }

  async getPlaceById(id: string): Promise<Place | null> {
    // First get the place data
    const { data: placeData, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (placeError) {
      if (placeError.code === 'PGRST116') {
        return null;
      }
      throw placeError;
    }

    if (!placeData) {
      return null;
    }

    // Then compute the is_open status using the function
    try {
      const { data: openStatus, error: statusError } = await supabase.rpc(
        'is_open_now',
        {
          opening_hours: placeData.opening_hours,
          tz: placeData.timezone || 'Asia/Hong_Kong'
        }
      );

      if (statusError) {
        console.warn('Could not compute open status:', statusError);
        // Return place without open status rather than failing
        return placeData;
      }

      // Combine the place data with the computed open status
      return {
        ...placeData,
        is_open: openStatus
      };
    } catch (error) {
      console.warn('Error computing open status:', error);
      // Return place without open status rather than failing
      return placeData;
    }
  }

  async getPlaceByPlaceId(
    placeId: string,
  ): Promise<Place | null> {
    // First get the place data
    const { data: placeData, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (placeError) {
      if (placeError.code === 'PGRST116') {
        return null;
      }
      throw placeError;
    }

    if (!placeData) {
      return null;
    }

    // Then compute the is_open status using the function
    try {
      const { data: openStatus, error: statusError } = await supabase.rpc(
        'is_open_now',
        {
          opening_hours: placeData.opening_hours,
          tz: placeData.timezone || 'Asia/Hong_Kong'
        }
      );

      if (statusError) {
        console.warn('Could not compute open status:', statusError);
        // Return place without open status rather than failing
        return placeData;
      }

      // Combine the place data with the computed open status
      return {
        ...placeData,
        is_open: openStatus
      };
    } catch (error) {
      console.warn('Error computing open status:', error);
      // Return place without open status rather than failing
      return placeData;
    }
  }

  async getAllPlaces() {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return { data };
  }

  async getCocktailLogsByPlaceId(placeId: string) {
    const { data, error } = await supabase
      .from('cocktail_logs')
      .select(
        `
        *,
        places!inner (
          id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        )
      `,
      )
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }
}

export const placeService = new PlaceService();
