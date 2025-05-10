"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { CocktailLogForm } from "./cocktail-log-form";

export function GlobalCocktailLogForm() {
  const { isFormOpen, closeForm, selectedLog, mutate } = useCocktailData();

  return (
    <CocktailLogForm
      isOpen={isFormOpen}
      onClose={closeForm}
      cocktailSlug={selectedLog?.cocktailId || ""}
      cocktailName={selectedLog?.cocktailName || ""}
      existingLog={selectedLog}
      onLogSaved={mutate}
      onLogDeleted={mutate}
      onLogsChange={() => {}}
      onSuccess={closeForm}
    />
  );
} 