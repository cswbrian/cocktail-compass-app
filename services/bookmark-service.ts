import { db, auth } from '@/lib/firebase';
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
    addedAt: Date;
  }>;
}

export interface BookmarkList {
  id: string;
  name: string;
  items: Array<{
    cocktailId: string;
    addedAt: Date;
  }>;
}

class BookmarkService {
  private get userId() {
    return auth?.currentUser?.uid;
  }

  private get userBookmarksRef() {
    if (!this.userId) throw new Error('User not authenticated');
    return collection(db!, 'users', this.userId, 'bookmarks');
  }

  async getBookmarks(): Promise<BookmarkList[]> {
    if (!this.userId) return [];

    const bookmarksSnapshot = await getDocs(this.userBookmarksRef);
    return bookmarksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BookmarkList[];
  }

  async addBookmark(listId: string, cocktailId: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const bookmarkRef = doc(this.userBookmarksRef, listId);
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
    if (!this.userId) throw new Error('User not authenticated');

    const bookmarkRef = doc(this.userBookmarksRef, listId);
    const bookmarkDoc = await getDoc(bookmarkRef);

    if (bookmarkDoc.exists()) {
      const data = bookmarkDoc.data() as BookmarkList;
      const items = data.items.filter(item => item.cocktailId !== cocktailId);
      await updateDoc(bookmarkRef, { items });
    }
  }

  async createList(listId: string, name: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const bookmarkRef = doc(this.userBookmarksRef, listId);
    await setDoc(bookmarkRef, {
      id: listId,
      name,
      items: []
    });
  }

  async deleteList(listId: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    const bookmarkRef = doc(this.userBookmarksRef, listId);
    await deleteDoc(bookmarkRef);
  }

  async migrateFromLocalStorage(localBookmarks: BookmarkItem[]): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

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
      await setDoc(doc(this.userBookmarksRef, bookmark.id), bookmark);
    }
  }
}

export const bookmarkService = new BookmarkService(); 