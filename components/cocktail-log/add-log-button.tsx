"use client";

import { Button } from "@/components/ui/button";
import { NotebookPenIcon } from "lucide-react";
import { useCocktailData } from "@/context/CocktailLogContext";

export function AddLogButton() {
  const { openForm } = useCocktailData();

  return (
    <Button
      className="h-12 w-12 rounded-full shadow-lg"
      onClick={openForm}
    >
      <NotebookPenIcon className="h-6 w-6" />
    </Button>
  );
} 