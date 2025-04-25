import { Timestamp } from 'firebase/firestore';

export interface GooglePlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Note {
  id: string;
  cocktailSlug: string;
  cocktailName: string;
  rating: number;
  specialIngredients: string;
  comments: string;
  location: string;
  googlePlace?: GooglePlace; // Optional Google Place information
  bartender: string;
  tags: string[];
  lastModified: Timestamp;
  userId: string;
  drinkDate?: Timestamp; // Optional field for when the drink was consumed
} 