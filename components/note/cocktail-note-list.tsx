"use client";

import { notesService } from "@/services/notes-service";
import { BaseNoteList } from "./base-note-list";

interface CocktailNoteListProps {
  cocktailSlug: string;
  cocktailName: string;
}

export function CocktailNoteList({ cocktailSlug }: CocktailNoteListProps) {
  const fetchNotes = () => notesService.getNotesByCocktailSlug(cocktailSlug);

  return (
    <BaseNoteList
      fetchNotesFunction={fetchNotes}
      showAddButton={false}
      isFromCocktailPage={true}
    />
  );
} 