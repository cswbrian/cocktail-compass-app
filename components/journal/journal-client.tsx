"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailLog } from "@/types/cocktail-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListIcon, NotebookPenIcon, BarChart3Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { Button } from "@/components/ui/button";
import { CocktailLogForm } from "@/components/cocktail-log/cocktail-log-form";
import { JournalHighlights } from "./journal-highlights";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";

interface EnhancedStats {
  basicStats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniqueBars: number;
  };
  drinksByMonth: Record<string, number>;
  topBarsWithMostDrinks: { name: string; count: number }[];
  recentPhotos: { url: string; type: string }[];
}

const DEFAULT_STATS: EnhancedStats = {
  basicStats: {
    totalCocktailsDrunk: 0,
    uniqueCocktails: 0,
    uniqueBars: 0
  },
  drinksByMonth: {},
  topBarsWithMostDrinks: [],
  recentPhotos: []
};

export function JournalClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [stats, setStats] = useState<EnhancedStats>(DEFAULT_STATS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CocktailLog | null>(null);

  useEffect(() => {
    if (!user) {
      router.push(`/${language}/login`);
      return;
    }

    // Fetch logs
    const fetchLogs = async () => {
      try {
        const fetchedLogs = await cocktailLogService.getLogsByUserId();
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast({
          title: t.error,
          description: t.errorLoadingLogs,
          variant: "destructive",
        });
      } finally {
        setIsLoadingLogs(false);
      }
    };

    // Fetch stats
    const fetchStats = async () => {
      try {
        const fetchedStats = await cocktailLogService.getEnhancedUserStats();
        setStats(fetchedStats || DEFAULT_STATS);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: t.error,
          description: t.errorLoadingStats,
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchLogs();
    fetchStats();
  }, [user, language]);

  const handleLogSaved = async () => {
    const updatedLogs = await cocktailLogService.getLogsByUserId();
    setLogs(updatedLogs);
    const updatedStats = await cocktailLogService.getEnhancedUserStats();
    setStats(updatedStats || DEFAULT_STATS);
  };

  const handleLogDeleted = async () => {
    const updatedLogs = await cocktailLogService.getLogsByUserId();
    setLogs(updatedLogs);
    const updatedStats = await cocktailLogService.getEnhancedUserStats();
    setStats(updatedStats || DEFAULT_STATS);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto pb-20">
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ListIcon className="w-4 h-4" />
            {t.yourLogs}
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <BarChart3Icon className="w-4 h-4" />
            {t.highlights}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <BasicStats stats={stats.basicStats} />
          <Feeds
            logs={logs}
            isLoading={isLoadingLogs}
            onLogSaved={handleLogSaved}
            onLogDeleted={handleLogDeleted}
            onLogsChange={setLogs}
          />
        </TabsContent>

        <TabsContent value="highlights" className="space-y-6">
          <JournalHighlights stats={stats} isLoading={isLoadingStats} />
        </TabsContent>
      </Tabs>

      <Button
        className="fixed bottom-20 right-6 h-12 w-12 rounded-full shadow-lg"
        onClick={() => {
          setSelectedLog(null);
          setIsDrawerOpen(true);
        }}
      >
        <NotebookPenIcon className="h-12 w-12" />
      </Button>

      <CocktailLogForm
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLog(null);
        }}
        cocktailSlug={selectedLog?.cocktailId || ""}
        cocktailName={selectedLog?.cocktailName || ""}
        existingLog={selectedLog}
        onLogSaved={handleLogSaved}
        onLogDeleted={handleLogDeleted}
        onLogsChange={setLogs}
      />
    </div>
  );
}
