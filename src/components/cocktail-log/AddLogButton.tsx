"use client";

import { Button } from "@/components/ui/button";
import { NotebookPenIcon } from "lucide-react";
import { useCocktailData } from "@/context/CocktailLogContext";
import { useLanguage } from "@/context/LanguageContext";

export function AddLogButton() {
  const { openCreateForm } = useCocktailData();
  const { language } = useLanguage();

  const handleClick = () => {
    window.history.pushState({}, '', `/${language}/logs/new`);
    openCreateForm();
  };

  return (
    <Button
      className="h-10 w-10 rounded-full shadow-lg"
      onClick={handleClick}
    >
      <NotebookPenIcon className="h-5 w-5" />
    </Button>
  );
} 