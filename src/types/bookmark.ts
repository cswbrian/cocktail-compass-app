export interface BookmarkedItem {
  id: string;
  cocktail_id: string;
  list_id: string;
  added_at: string;
}

export interface BookmarkList {
  id: string;
  name: string;
  name_key?: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
  items?: BookmarkedItem[];
}
