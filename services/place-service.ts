import { supabase } from "@/lib/supabase";

interface Place {
  id: string;
  place_id: string;
  name: string;
  main_text: string;
  secondary_text: string | null;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

export class PlaceService {
  async getOrCreatePlace(placeData: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Promise<Place> {
    // First try to find existing place
    const { data: existingPlace, error: findError } = await supabase
      .from('places')
      .select('*')
      .eq('place_id', placeData.place_id)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw findError;
    }

    if (existingPlace) {
      return existingPlace;
    }

    // If place doesn't exist, create it
    const { data: newPlace, error: createError } = await supabase
      .from('places')
      .insert([placeData])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newPlace;
  }

  async getPlaceById(id: string): Promise<Place | null> {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  async getPlaceByPlaceId(placeId: string): Promise<Place | null> {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  async getCocktailLogsByPlaceId(placeId: string) {
    const { data, error } = await supabase
      .from('cocktail_logs')
      .select(`
        *,
        places!inner (
          id,
          name,
          main_text,
          secondary_text,
          lat,
          lng
        )
      `)
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }
}

export const placeService = new PlaceService(); 