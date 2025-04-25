"use client";

import { NoteButton } from "./note-button";
import { CocktailNoteList } from "./cocktail-note-list";
import { Note } from "@/types/note";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface CocktailNoteSectionProps {
  cocktailSlug: string;
  cocktailName: string;
}

export function CocktailNoteSection({ cocktailSlug, cocktailName }: CocktailNoteSectionProps) {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const t = translations[language];

  const handleNoteSaved = (note: Note) => {
    // This will trigger a re-render of the NoteList component
    window.location.reload();
  };

  const handleLoginClick = () => {
    localStorage.setItem('returnUrl', pathname || '/');
    router.push(`/${language}/login`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{t.signInToAddNotes}</p>
        <Button onClick={handleLoginClick}>
          {t.signInWithGoogle}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NoteButton
        cocktailSlug={cocktailSlug}
        cocktailName={cocktailName}
        onNoteSaved={handleNoteSaved}
        isFromCocktailPage={true}
      />
      <CocktailNoteList
        cocktailSlug={cocktailSlug}
        cocktailName={cocktailName}
      />
    </div>
  );
} 