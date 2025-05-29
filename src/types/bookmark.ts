import { Cocktail } from './cocktail';
import { Place } from './place';

export interface BookmarkedItem {
  id: string;
  cocktail_id: string | null;
  place_id: string | null;
  list_id: string;
  added_at: string;
  cocktail?: Cocktail | null;
  place?: Place | null;
}

export interface BookmarkList {
  id: string;
  name: string;
  name_key?: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: BookmarkedItem[];
}
