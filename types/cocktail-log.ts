export interface CocktailLog {
  id: string;
  cocktailId: string;
  cocktailName: string;
  userId: string;
  rating: number;
  location?: string;
  bartender?: string;
  comments?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  drinkDate: string | null;
  specialIngredients?: string;
  media?: {
    url: string;
    type: 'image' | 'video';
  }[];
} 