"use client";

import { useState, useEffect } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { BaseCocktailLogList } from "./base-cocktail-log-list";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

interface CocktailLogSectionProps {
  cocktailSlug: string;
  cocktailName: string;
}

export function CocktailLogSection({
  cocktailSlug,
  cocktailName,
}: CocktailLogSectionProps) {
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const fetchLogs = async () => {
    try {
      const fetchedLogs = await cocktailLogService.getLogsByCocktailSlug(cocktailSlug);
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
    <BaseCocktailLogList
      cocktailSlug={cocktailSlug}
      cocktailName={cocktailName}
      logs={logs}
      onLogsChange={setLogs}
      isFromCocktailPage={true}
    />
  );
} 