"use client";

import { useState } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogForm } from "@/components/cocktail-log/cocktail-log-form";
import { CocktailLogCard } from "@/components/cocktail-log/cocktail-log-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const { user } = useAuth();
  const router = useRouter();
  const t = translations[language as keyof typeof translations];

  const handleAddLog = () => {
    if (!user) {
      // Store the current path for redirect after login
      localStorage.setItem('returnUrl', window.location.pathname);
      router.push(`/${language}/login`);
      return;
    }
    setSelectedLog(null);
    setIsDrawerOpen(true);
  };

  const handleEditLog = (log: CocktailLog) => {
    if (!user) {
      // Store the current path for redirect after login
      localStorage.setItem('returnUrl', window.location.pathname);
      router.push(`/${language}/login`);
      return;
    }
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleLogSaved = async () => {
    if (!user) return;
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
    if (!user) return;
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

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t.yourLogs}</h2>
          <Button onClick={handleAddLog}>{t.addLog}</Button>
        </div>
        <p className="text-muted-foreground">{t.pleaseLoginToViewLogs}</p>
      </div>
    );
  }

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
            <CocktailLogCard
              key={log.id}
              log={log}
              cocktailName={cocktailName}
              onClick={() => handleEditLog(log)}
            />
          ))}
        </div>
      )}

      <CocktailLogForm
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