import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';

export interface BookmarkList {
  id: string;  // UUID
  user_id: string;  // UUID
  name: string;
  name_key: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  items?: BookmarkedItem[];  // Added for bulk fetching
}

export interface BookmarkedItem {
  id: string;  // UUID
  list_id: string;  // UUID
  cocktail_id: string;
  added_at: string;
}

class BookmarkService {
  private readonly DEFAULT_LISTS = [
    { id: "want-to-try", nameKey: "wantToTry" },
    { id: "favorites", nameKey: "favorites" },
    { id: "dont-like", nameKey: "dontLike" },
  ];

  private cachedUserId: string | null = null;

  private async getUserId(): Promise<string | null> {
    if (this.cachedUserId) return this.cachedUserId;
    
    const user = await AuthService.getCurrentUser();
    if (!user) return null;
    
    this.cachedUserId = user.id;
    return user.id;
  }

  async initializeDefaultLists(): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Check if user already has default lists
    const { data: existingLists } = await supabase
      .from('bookmark_lists')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true);

    if (existingLists && existingLists.length > 0) {
      return; // User already has default lists
    }

    // Create default lists
    const { error } = await supabase
      .from('bookmark_lists')
      .insert(
        this.DEFAULT_LISTS.map(list => ({
          name: list.nameKey, // Store the key as name
          name_key: list.nameKey,
          is_default: true,
          user_id: userId
        }))
      );

    if (error) throw error;
  }

  async getBookmarks(): Promise<BookmarkList[]> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    // Fetch lists with their items in a single query
    const { data: lists, error } = await supabase
      .from('bookmark_lists')
      .select(`
        *,
        items:bookmarked_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return lists || [];
  }

  async getBookmarkedItems(listId: string): Promise<BookmarkedItem[]> {
    const { data: items, error } = await supabase
      .from('bookmarked_items')
      .select('*')
      .eq('list_id', listId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return items || [];
  }

  async addBookmark(listId: string, cocktailId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmarked_items')
      .insert({
        list_id: listId,
        cocktail_id: cocktailId
      });

    if (error) throw error;
  }

  async removeBookmark(listId: string, cocktailId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmarked_items')
      .delete()
      .eq('list_id', listId)
      .eq('cocktail_id', cocktailId);

    if (error) throw error;
  }

  async createList(name: string): Promise<BookmarkList> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookmark_lists')
      .insert({ 
        name,
        is_default: false,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmark_lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  }

  async updateListName(listId: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('bookmark_lists')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', listId);

    if (error) throw error;
  }
}

export const bookmarkService = new BookmarkService(); 