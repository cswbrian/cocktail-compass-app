import { Timestamp } from 'firebase/firestore';

export interface CocktailLog {
  id: string;
  cocktailSlug: string;
  cocktailName: string;
  rating: number;
  specialIngredients: string;
  comments: string;
  location: string;
  bartender: string;
  tags: string[];
  lastModified: Timestamp;
  userId: string;
  drinkDate?: Timestamp; // Optional field for when the drink was consumed
} 