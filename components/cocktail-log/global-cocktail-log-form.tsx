"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { CocktailLogForm } from "./cocktail-log-form";

export function GlobalCocktailLogForm() {
  const { formState, closeForm, mutate } = useCocktailData();
  const { isOpen, mode, selectedLog } = formState;

  return (
    <CocktailLogForm
      isOpen={isOpen}
      onClose={closeForm}
      cocktailSlug={selectedLog?.cocktailId || ""}
      cocktailName={selectedLog?.cocktailName || ""}
      existingLog={mode === 'edit' ? selectedLog : null}
      onLogSaved={(log) => {
        mutate();
        closeForm();
      }}
      onLogDeleted={(logId) => {
        mutate();
        closeForm();
      }}
      onLogsChange={() => {}}
      onSuccess={closeForm}
    />
  );
} 