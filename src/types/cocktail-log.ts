export interface CocktailLog {
  id: string;
  cocktail: {
    id: string;
    slug: string;
    is_custom: boolean;
    name: {
      en: string;
      zh: string;
    };
  };
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
  media: MediaItem[] | null;
  deletedAt: string | null;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  contentType: string;
  fileSize: number;
  originalName: string;
  createdAt: string;
  status: 'active' | 'deleted';
}

export interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
} 