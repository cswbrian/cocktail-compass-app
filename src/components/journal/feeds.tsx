import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogList } from "@/components/cocktail-log/cocktail-log-list";

interface FeedsProps {
  logs: CocktailLog[];
  isLoading: boolean;
  onLogSaved: () => Promise<void>;
  onLogDeleted: () => Promise<void>;
  onLogsChange: (logs: CocktailLog[]) => void;
}

export function Feeds({ logs, isLoading, onLogSaved, onLogDeleted }: FeedsProps) {

  if (isLoading) {
    return null; // Loading state is now handled by AuthWrapper
  }

  return (
    <CocktailLogList
      logs={logs}
      isLoading={isLoading}
      onLogSaved={onLogSaved}
      onLogDeleted={onLogDeleted}
    />
  );
} 