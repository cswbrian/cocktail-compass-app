export interface CocktailLog {
  id: string;
  cocktailId: string;
  cocktailName: string;
  userId: string;
  rating: number | null;
  specialIngredients: string | null;
  comments: string | null;
  location: string | null; // JSON string of LocationData
  bartender: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  drinkDate: string | null;
  media: { url: string; type: 'image' | 'video' }[] | null;
  deletedAt: string | null;
}

export interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
} 