import { CocktailLog } from "@/types/cocktail-log";
import { PublicCocktailLogCard } from "./PublicCocktailLogCard";
import { PrivateCocktailLogCard } from "./PrivateCocktailLogCard";

interface CocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  variant?: "public" | "private";
}

export function CocktailLogCard({
  log,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  variant = "private",
}: CocktailLogCardProps) {
  console.log("variant", variant, log.visibility, log);
  if (variant === "public") {
    return (
      <PublicCocktailLogCard
        log={log}
        onLogSaved={onLogSaved}
        onLogDeleted={onLogDeleted}
        onLogsChange={onLogsChange}
      />
    );
  }

  return (
    <PrivateCocktailLogCard
      log={log}
      onLogSaved={onLogSaved}
      onLogDeleted={onLogDeleted}
      onLogsChange={onLogsChange}
    />
  );
}
