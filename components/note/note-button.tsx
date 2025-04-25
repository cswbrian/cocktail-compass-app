"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NoteDrawer } from "./note-drawer";
import { Note } from "@/types/note";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface NoteButtonProps {
  cocktailSlug: string;
  cocktailName: string;
  onNoteSaved: (note: Note) => void;
  isFromCocktailPage?: boolean;
}

export function NoteButton({ 
  cocktailSlug, 
  cocktailName, 
  onNoteSaved,
  isFromCocktailPage = false 
}: NoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        {t.addNote}
      </Button>
      <NoteDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cocktailSlug={cocktailSlug}
        cocktailName={cocktailName}
        onNoteSaved={onNoteSaved}
        isFromCocktailPage={isFromCocktailPage}
      />
    </>
  );
} 