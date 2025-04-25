"use client";

import { notesService } from "@/services/notes-service";
import { BaseNoteList } from "@/components/note/base-note-list";

export function LibraryNoteList() {
  const fetchNotes = () => notesService.getNotes();

  return (
    <BaseNoteList
      fetchNotesFunction={fetchNotes}
      showAddButton={true}
    />
  );
} 