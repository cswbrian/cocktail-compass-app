import { db } from '@/lib/firebase';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  Timestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { Note, GooglePlace } from '@/types/note';

class NotesService {
  private async getUserId(): Promise<string | null> {
    const { data, error } = await getCurrentUser();
    if (error || !data?.user) return null;
    return data.user.id;
  }

  private async getUserNotesRef() {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    return collection(db!, 'users', userId, 'notes');
  }

  async getNotes(): Promise<Note[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    const userNotesRef = collection(db!, 'users', userId, 'notes');
    const notesSnapshot = await getDocs(userNotesRef);
    return notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  }

  async getNotesByCocktailSlug(cocktailSlug: string): Promise<Note[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    const userNotesRef = collection(db!, 'users', userId, 'notes');
    const q = query(
      userNotesRef, 
      where('cocktailSlug', '==', cocktailSlug),
      orderBy('lastModified', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  }

  async createNote(
    cocktailSlug: string,
    cocktailName: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[] = [],
    drinkDate?: Timestamp,
    googlePlace?: GooglePlace
  ): Promise<Note> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userNotesRef = collection(db!, 'users', userId, 'notes');
    const noteRef = doc(userNotesRef);
    const noteData = {
      id: noteRef.id,
      cocktailSlug,
      cocktailName,
      rating,
      specialIngredients,
      comments,
      location,
      bartender,
      tags: tags || [],
      lastModified: Timestamp.now(),
      userId,
      drinkDate,
      googlePlace
    };
    await setDoc(noteRef, noteData);
    return noteData;
  }

  async updateNote(
    noteId: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[],
    drinkDate?: Timestamp,
    googlePlace?: GooglePlace
  ): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userNotesRef = collection(db!, 'users', userId, 'notes');
    const noteRef = doc(userNotesRef, noteId);
    await updateDoc(noteRef, {
      rating,
      specialIngredients,
      comments,
      location,
      bartender,
      tags,
      drinkDate,
      googlePlace,
      lastModified: Timestamp.now()
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated (Supabase)');
    const userNotesRef = collection(db!, 'users', userId, 'notes');
    const noteRef = doc(userNotesRef, noteId);
    await deleteDoc(noteRef);
  }
}

export const notesService = new NotesService(); 