export interface CocktailLog {
  id: string;
  cocktail: {
    id: string;
    name: {
      en: string;
      zh: string | null;
    };
    slug: string;
    is_custom: boolean;
  };
  userId: string;
  location: string | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
  drinkDate: Date | null;
  media: {
    id: string;
    url: string;
    type: 'image' | 'video';
    contentType: string;
    fileSize: number;
    originalName: string;
    createdAt: Date;
    status: string;
  }[] | null;
  deletedAt: Date | null;
  visibility: 'public' | 'private' | 'friends';
  user?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  reactions?: { [key: string]: number };
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