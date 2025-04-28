import { db } from '@/lib/firebase';
import { AuthService } from '@/services/auth-service';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface BookmarkItem {
  key: string;
  items: Array<{
    cocktailId: string;
    addedAt: Timestamp;
  }>;
}

export interface BookmarkList {
  id: string;
  name: string;
  items: Array<{
    cocktailId: string;
    addedAt: Timestamp;
  }>;
}

class BookmarkService {
  private async getUserId(): Promise<string | null> {
    const user = await AuthService.getCurrentUser();
    if (!user) return null;
    return user.id;
  }

  private async getUserBookmarksRef() {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    return collection(db!, 'users', userId, 'bookmarks');
  }

  async getBookmarks(): Promise<BookmarkList[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    const bookmarksSnapshot = await getDocs(userBookmarksRef);
    return bookmarksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BookmarkList[];
  }

  async addBookmark(listId: string, cocktailId: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    const bookmarkRef = doc(userBookmarksRef, listId);
    const bookmarkDoc = await getDoc(bookmarkRef);
    if (!bookmarkDoc.exists()) {
      // Create new list
      await setDoc(bookmarkRef, {
        id: listId,
        name: listId,
        items: [{
          cocktailId,
          addedAt: Timestamp.now()
        }]
      });
    } else {
      // Add to existing list
      const data = bookmarkDoc.data() as BookmarkList;
      const items = [...data.items, {
        cocktailId,
        addedAt: Timestamp.now()
      }];
      await updateDoc(bookmarkRef, { items });
    }
  }

  async removeBookmark(listId: string, cocktailId: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    const bookmarkRef = doc(userBookmarksRef, listId);
    const bookmarkDoc = await getDoc(bookmarkRef);
    if (bookmarkDoc.exists()) {
      const data = bookmarkDoc.data() as BookmarkList;
      const items = data.items.filter(item => item.cocktailId !== cocktailId);
      await updateDoc(bookmarkRef, { items });
    }
  }

  async createList(listId: string, name: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    const bookmarkRef = doc(userBookmarksRef, listId);
    await setDoc(bookmarkRef, {
      id: listId,
      name,
      items: []
    });
  }

  async deleteList(listId: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    const bookmarkRef = doc(userBookmarksRef, listId);
    await deleteDoc(bookmarkRef);
  }

  async migrateFromLocalStorage(localBookmarks: BookmarkItem[]): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userBookmarksRef = collection(db!, 'users', userId, 'bookmarks');
    // Convert localStorage format to Firestore format
    const bookmarksToMigrate = localBookmarks.map(list => ({
      id: list.key,
      name: list.key,
      items: list.items.map(item => ({
        cocktailId: item.cocktailId,
        addedAt: Timestamp.now() // Use current time for migrated items
      }))
    }));
    // Save each list to Firestore
    for (const bookmark of bookmarksToMigrate) {
      await setDoc(doc(userBookmarksRef, bookmark.id), bookmark);
    }
  }
}

export const bookmarkService = new BookmarkService(); 