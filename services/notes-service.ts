import { db, auth } from '@/lib/firebase';
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
  private get userId() {
    return auth?.currentUser?.uid;
  }

  private get userNotesRef() {
    if (!this.userId) throw new Error('User not authenticated');
    return collection(db!, 'users', this.userId, 'notes');
  }

  async getNotes(): Promise<Note[]> {
    if (!this.userId) return [];

    const notesSnapshot = await getDocs(this.userNotesRef);
    return notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  }

  async getNotesByCocktailSlug(cocktailSlug: string): Promise<Note[]> {
    if (!this.userId) return [];

    const q = query(
      this.userNotesRef, 
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
    if (!this.userId) throw new Error('User not authenticated');

    const noteRef = doc(this.userNotesRef);
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
      userId: this.userId,
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
    if (!this.userId) throw new Error('User not authenticated');

    const noteRef = doc(this.userNotesRef, noteId);
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
    if (!this.userId) throw new Error('User not authenticated');

    const noteRef = doc(this.userNotesRef, noteId);
    await deleteDoc(noteRef);
  }
}

export const notesService = new NotesService(); 