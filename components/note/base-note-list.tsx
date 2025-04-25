"use client";

import { useState, useEffect } from "react";
import { Pencil, Star } from "lucide-react";
import { Note } from "@/types/note";
import { translations } from "@/translations";
import { NoteDrawer } from "./note-drawer";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BaseNoteListProps {
  fetchNotesFunction: () => Promise<Note[]>;
  showAddButton?: boolean;
  onNoteSaved?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
  isFromCocktailPage?: boolean;
}

export function BaseNoteList({ 
  fetchNotesFunction, 
  showAddButton = true,
  onNoteSaved,
  onNoteDeleted,
  isFromCocktailPage = false
}: BaseNoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const fetchNotes = async () => {
    try {
      const notes = await fetchNotesFunction();
      setNotes(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorLoadingNotes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotesFunction]);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsNoteDrawerOpen(true);
  };

  const handleNoteSaved = async (savedNote: Note) => {
    if (editingNote) {
      // Update existing note in the list
      setNotes(notes.map(note => 
        note.id === editingNote.id ? savedNote : note
      ));
    } else {
      // Add new note to the list
      setNotes([savedNote, ...notes]);
    }
    await fetchNotes(); // Refresh the list to get the correct order
    onNoteSaved?.(savedNote);
  };

  if (loading) {
    return <div className="text-center py-4">{t.loading}</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {showAddButton && (
        <Button
          variant="default"
          onClick={() => setIsNoteDrawerOpen(true)}
          className="w-full"
        >
          {t.addNote}
        </Button>
      )}
      {notes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">{t.noNotes}</div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="relative border border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] group">
              <div className="relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-white/60 hover:text-blue-400 transition-colors"
                    aria-label={t.editNote}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {!isFromCocktailPage && (
                    <Link
                      href={`/${language}/cocktail/${note.cocktailSlug}`}
                      className="text-xl font-semibold text-white/90 hover:text-blue-400 transition-colors block"
                    >
                      {note.cocktailName}
                    </Link>
                  )}
                  {note.location && (
                    <p className={`${isFromCocktailPage ? 'text-xl' : 'text-lg'} text-white/80`}>
                      {note.location}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= note.rating ? "text-yellow-400 fill-current" : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {note.specialIngredients && (
                  <p className="text-sm text-white/80 mt-4">
                    <span className="font-semibold text-white/90">{t.specialIngredients}:</span> {note.specialIngredients}
                  </p>
                )}
                <p className="text-white/80 whitespace-pre-wrap mt-4">{note.comments}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(note.tags || []).map((tag) => (
                    <Button
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="cursor-default bg-white/10 hover:bg-white/20 text-white/80"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-white/60 space-y-1 mt-4">
                  {note.bartender && (
                    <p>
                      <span className="font-semibold text-white/80">{t.bartender}:</span> {note.bartender}
                    </p>
                  )}
                  {note.drinkDate && (
                    <p>
                      <span className="font-semibold text-white/80">{t.drinkDate}:</span>{" "}
                      {note.drinkDate.toDate().toLocaleDateString(language)}
                    </p>
                  )}
                  <p className="mt-2 text-white/50">
                    {note.lastModified.toDate().toLocaleDateString(language)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <NoteDrawer
        isOpen={isNoteDrawerOpen}
        onClose={() => {
          setIsNoteDrawerOpen(false);
          setEditingNote(null);
        }}
        cocktailSlug={editingNote?.cocktailSlug || ""}
        cocktailName={editingNote?.cocktailName || ""}
        onNoteSaved={handleNoteSaved}
        existingNote={editingNote}
        onNoteDeleted={(noteId) => {
          setNotes(notes.filter(note => note.id !== noteId));
          onNoteDeleted?.(noteId);
        }}
      />
    </div>
  );
} 