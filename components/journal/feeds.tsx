import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogCard } from "@/components/cocktail-log/cocktail-log-card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Skeleton } from "@/components/ui/skeleton";

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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
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