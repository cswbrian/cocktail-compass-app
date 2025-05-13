import { CocktailLog } from "@/types/cocktail-log";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailLogList } from "@/components/cocktail-log/cocktail-log-list";

interface FeedsProps {
  logs: CocktailLog[];
  isLoading: boolean;
  onLogSaved: () => Promise<void>;
  onLogDeleted: () => Promise<void>;
  onLogsChange: (logs: CocktailLog[]) => void;
}

export function Feeds({ logs, isLoading, onLogSaved, onLogDeleted }: FeedsProps) {
  const { language } = useLanguage();
  const t = translations[language];

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