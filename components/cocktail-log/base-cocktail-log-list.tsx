"use client";

import { useState } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogDrawer } from "./cocktail-log-drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { cocktailLogService } from "@/services/cocktail-log-service";

interface BaseCocktailLogListProps {
  cocktailSlug: string;
  cocktailName: string;
  logs: CocktailLog[];
  onLogsChange: (logs: CocktailLog[]) => void;
  isFromCocktailPage?: boolean;
}

export function BaseCocktailLogList({
  cocktailSlug,
  cocktailName,
  logs,
  onLogsChange,
  isFromCocktailPage = false,
}: BaseCocktailLogListProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CocktailLog | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const handleAddLog = () => {
    setSelectedLog(null);
    setIsDrawerOpen(true);
  };

  const handleEditLog = (log: CocktailLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleLogSaved = async () => {
    try {
      const updatedLogs = await cocktailLogService.getLogsByCocktailSlug(cocktailSlug);
      onLogsChange(updatedLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: t.error,
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  const handleLogDeleted = async () => {
    try {
      const updatedLogs = await cocktailLogService.getLogsByCocktailSlug(cocktailSlug);
      onLogsChange(updatedLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: t.error,
        description: t.errorRefreshingLogs,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.yourLogs}</h2>
        <Button onClick={handleAddLog}>{t.addLog}</Button>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground">{t.noLogs}</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => handleEditLog(log)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{cocktailName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.rating}: {log.rating}/5
                  </p>
                  {log.location && (
                    <p className="text-sm text-muted-foreground">
                      {t.location}: {log.location}
                    </p>
                  )}
                  {log.bartender && (
                    <p className="text-sm text-muted-foreground">
                      {t.bartender}: {log.bartender}
                    </p>
                  )}
                  {log.comments && (
                    <p className="text-sm mt-2">{log.comments}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {log.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-secondary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CocktailLogDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cocktailSlug={cocktailSlug}
        cocktailName={cocktailName}
        onLogSaved={handleLogSaved}
        existingLog={selectedLog}
        isFromCocktailPage={isFromCocktailPage}
        onLogDeleted={handleLogDeleted}
        onLogsChange={onLogsChange}
      />
    </div>
  );
} 