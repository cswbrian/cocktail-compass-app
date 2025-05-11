import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogCard } from "@/components/cocktail-log/cocktail-log-card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface FeedsProps {
  logs: CocktailLog[];
  isLoading: boolean;
  onLogSaved: () => Promise<void>;
  onLogDeleted: () => Promise<void>;
  onLogsChange: (logs: CocktailLog[]) => void;
}

export function Feeds({ logs, isLoading, onLogSaved, onLogDeleted, onLogsChange }: FeedsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (isLoading) {
    return null; // Loading state is now handled by AuthWrapper
  }

  if (!logs || logs.length === 0) {
    return <div className="text-center py-8">{t.noLogs}</div>;
  }

  return (
    <div>
      {logs.map((log) => (
        <CocktailLogCard
          key={log.id}
          log={log}
          onLogSaved={onLogSaved}
          onLogDeleted={onLogDeleted}
          onLogsChange={onLogsChange}
        />
      ))}
    </div>
  );
} 