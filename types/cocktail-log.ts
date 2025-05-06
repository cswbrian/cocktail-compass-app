import { Timestamp } from 'firebase/firestore';

export interface CocktailLog {
  id: string;
  user_id: string;
  cocktail_id: string;
  rating: number;
  special_ingredients: string | null;
  comments: string | null;
  location: string | null;
  bartender: string | null;
  tags: string[];
  drink_date: string | null;
  created_at: string;
  updated_at: string;
} 