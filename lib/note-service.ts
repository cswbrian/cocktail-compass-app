import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Note, GooglePlace } from '@/types/note';

export class NotesService {
  private static instance: NotesService;
  private notesCollection = 'notes';

  private constructor() {}

  public static getInstance(): NotesService {
    if (!NotesService.instance) {
      NotesService.instance = new NotesService();
    }
    return NotesService.instance;
  }

  async createNote(
    cocktailSlug: string,
    cocktailName: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[],
    userId: string,
    drinkDate?: Date,
    googlePlace?: GooglePlace
  ): Promise<string> {
    const noteData = {
      cocktailSlug,
      cocktailName,
      rating,
      specialIngredients,
      comments,
      location,
      bartender,
      tags,
      userId,
      lastModified: Timestamp.now(),
      drinkDate: drinkDate ? Timestamp.fromDate(drinkDate) : Timestamp.now(),
      googlePlace: googlePlace ? {
        placeId: googlePlace.placeId,
        name: googlePlace.name,
        address: googlePlace.address,
        lat: googlePlace.lat,
        lng: googlePlace.lng,
      } : null,
    };

    const docRef = await addDoc(collection(db!, this.notesCollection), noteData);
    return docRef.id;
  }

  async updateNote(
    noteId: string,
    rating: number,
    specialIngredients: string,
    comments: string,
    location: string,
    bartender: string,
    tags: string[],
    drinkDate?: Date,
    googlePlace?: GooglePlace
  ): Promise<void> {
    const noteRef = doc(db!, this.notesCollection, noteId);
    await updateDoc(noteRef, {
      rating,
      specialIngredients,
      comments,
      location,
      bartender,
      tags,
      lastModified: Timestamp.now(),
      drinkDate: drinkDate ? Timestamp.fromDate(drinkDate) : Timestamp.now(),
      googlePlace: googlePlace ? {
        placeId: googlePlace.placeId,
        name: googlePlace.name,
        address: googlePlace.address,
        lat: googlePlace.lat,
        lng: googlePlace.lng,
      } : null,
    });
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    const q = query(
      collection(db!, this.notesCollection),
      where('userId', '==', userId),
      orderBy('lastModified', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
  }

  async getNotesByCocktailSlug(cocktailSlug: string, userId: string): Promise<Note[]> {
    const q = query(
      collection(db!, this.notesCollection),
      where('cocktailSlug', '==', cocktailSlug),
      where('userId', '==', userId),
      orderBy('lastModified', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
  }
} 