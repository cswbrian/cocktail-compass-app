export interface Place {
  id: string;
  place_id: string;
  name: string;
  main_text: string;
  secondary_text: string | null;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}
