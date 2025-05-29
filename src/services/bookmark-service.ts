import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';
import {
  BookmarkList,
  BookmarkedItem,
} from '@/types/bookmark';

export class BookmarkService {
  private cachedUserId: string | null = null;

  private async getUserId(): Promise<string | null> {
    if (this.cachedUserId) return this.cachedUserId;

    const user = await AuthService.getCurrentSession();
    if (!user) return null;

    this.cachedUserId = user.id;
    return user.id;
  }

  async getBookmarks(): Promise<BookmarkList[]> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookmark_lists')
      .select(`
        *,
        bookmarked_items (
          id,
          cocktail_id,
          place_id,
          list_id,
          added_at,
          cocktail:cocktails!cocktail_id (
            id,
            slug,
            name
          ),
          place:places!place_id (
            id,
            place_id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getBookmarkedItems(listId: string): Promise<BookmarkedItem[]> {
    const { data, error } = await supabase
      .from('bookmarked_items')
      .select(`
        *,
        cocktail:cocktails!cocktail_id (
          id,
          slug,
          name
        ),
        place:places!place_id (
          id,
          place_id,
          name
        )
      `)
      .eq('list_id', listId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addBookmark(listId: string, cocktailId?: string, placeId?: string): Promise<void> {
    const { error } = await supabase
      .from('bookmarked_items')
      .insert({
        list_id: listId,
        cocktail_id: cocktailId || null,
        place_id: placeId || null,
      });

    if (error) throw error;
  }

  async removeBookmark(listId: string, cocktailId?: string, placeId?: string): Promise<void> {
    const { error } = await supabase
      .from('bookmarked_items')
      .delete()
      .match({
        list_id: listId,
        cocktail_id: cocktailId || null,
        place_id: placeId || null,
      });

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
        user_id: userId,
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

  async updateListName(
    listId: string,
    name: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('bookmark_lists')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId);

    if (error) throw error;
  }

  // New optimized method to get all bookmarks with their items in a single query
  async getUserBookmarksWithItems(): Promise<BookmarkList[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('bookmark_lists')
      .select(`
        id,
        name,
        name_key,
        is_default,
        user_id,
        created_at,
        updated_at,
        bookmarked_items (
          id,
          cocktail_id,
          place_id,
          list_id,
          added_at,
          cocktail:cocktails!cocktail_id (
            id,
            slug,
            name
          ),
          place:places!place_id (
            id,
            place_id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(list => ({
      id: list.id,
      name: list.name,
      name_key: list.name_key,
      is_default: list.is_default,
      user_id: list.user_id,
      created_at: list.created_at,
      updated_at: list.updated_at,
      items: list.bookmarked_items.map((item: any) => ({
        id: item.id,
        cocktail_id: item.cocktail_id,
        place_id: item.place_id,
        list_id: item.list_id,
        added_at: item.added_at,
        cocktail: item.cocktail,
        place: item.place,
      })),
    }));
  }

  // New method to get a single bookmark list with its items
  async getBookmarkListWithItems(listId: string): Promise<BookmarkList | null> {
    const { data, error } = await supabase
      .from('bookmark_lists')
      .select(`
        id,
        name,
        name_key,
        is_default,
        user_id,
        created_at,
        updated_at,
        bookmarked_items (
          id,
          cocktail_id,
          place_id,
          list_id,
          added_at,
          cocktail:cocktails!cocktail_id (
            id,
            slug,
            name
          ),
          place:places!place_id (
            id,
            place_id,
            name
          )
        )
      `)
      .eq('id', listId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      name_key: data.name_key,
      is_default: data.is_default,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      items: data.bookmarked_items.map((item: any) => ({
        id: item.id,
        cocktail_id: item.cocktail_id,
        place_id: item.place_id,
        list_id: item.list_id,
        added_at: item.added_at,
        cocktail: item.cocktail,
        place: item.place,
      })),
    };
  }
}

export const bookmarkService = new BookmarkService();
