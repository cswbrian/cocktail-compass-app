"use client";

import { useState, useEffect } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { BaseCocktailLogList } from "./base-cocktail-log-list";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { cocktailService } from "@/services/cocktail-service";

interface CocktailLogListProps {
  cocktailSlug: string;
  cocktailName: string;
}

export function CocktailLogList({
  cocktailSlug,
  cocktailName,
}: CocktailLogListProps) {
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const fetchLogs = async () => {
    try {
      const cocktail = cocktailService.getCocktailBySlug(cocktailSlug);
      if (!cocktail) return;
      const fetchedLogs = await cocktailLogService.getLogsByCocktailId(cocktail.id);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: t.error,
        description: t.errorLoadingLogs,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [cocktailSlug]);

  if (loading) {
    return <div className="text-center py-4">{t.loading}</div>;
  }

  return (
    <div className="space-y-0">
      {logs.map((log) => (
        <div key={log.id} className="relative">
          <BaseCocktailLogList
            cocktailSlug={cocktailSlug}
            cocktailName={cocktailName}
            logs={[log]}
            onLogsChange={setLogs}
          />
        </div>
      ))}
    </div>
  );
} 