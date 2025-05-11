"use client";

import { Button } from "@/components/ui/button";
import { NotebookPenIcon } from "lucide-react";
import { useCocktailData } from "@/context/CocktailLogContext";

export function AddLogButton() {
  const { openForm } = useCocktailData();

  return (
    <Button
      className="h-10 w-10 rounded-full shadow-lg"
      onClick={openForm}
    >
      <NotebookPenIcon className="h-5 w-5" />
    </Button>
  );
} 