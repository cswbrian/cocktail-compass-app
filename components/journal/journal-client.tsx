"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogCard } from "@/components/cocktail-log/cocktail-log-card";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarIcon, ListIcon, NotebookPenIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { Button } from "@/components/ui/button";
import { CocktailLogDrawer } from "@/components/cocktail-log/cocktail-log-drawer";

interface Stats {
  totalLogs: number;
  averageRating: number;
  favoriteCocktails: { name: string; count: number }[];
  mostLoggedSpirits: { name: string; count: number }[];
}

const DEFAULT_STATS: Stats = {
  totalLogs: 0,
  averageRating: 0,
  favoriteCocktails: [],
  mostLoggedSpirits: [],
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
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
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
        const fetchedStats = await cocktailLogService.getUserStats();
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
    const updatedStats = await cocktailLogService.getUserStats();
    setStats(updatedStats || DEFAULT_STATS);
  };

  const handleLogDeleted = async () => {
    const updatedLogs = await cocktailLogService.getLogsByUserId();
    setLogs(updatedLogs);
    const updatedStats = await cocktailLogService.getUserStats();
    setStats(updatedStats || DEFAULT_STATS);
  };

  if (!user) {
    return null;
  }

  const renderLogs = () => {
    if (isLoadingLogs) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    if (!logs || logs.length === 0) {
      return <div className="text-center py-8">{t.noLogs}</div>;
    }

    return (
      <div className="space-y-4">
        {logs.map((log) => (
          <CocktailLogCard
            key={log.id}
            log={log}
            cocktailName={log.cocktailName}
            onClick={() => {
              setSelectedLog(log);
              setIsDrawerOpen(true);
            }}
          />
        ))}
      </div>
    );
  };

  const renderHighlights = () => {
    if (isLoadingStats) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>{t.loading}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.totalLogs}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.totalLogs}</p>
              <p className="text-2xl font-bold">{stats.totalLogs}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.averageRating}</p>
              <p className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.favoriteCocktails}</h3>
          <div className="space-y-2">
            {stats.favoriteCocktails.map((cocktail) => (
              <div
                key={cocktail.name}
                className="flex justify-between items-center"
              >
                <span>{cocktail.name}</span>
                <span className="text-muted-foreground">
                  {cocktail.count} {t.times}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">{t.mostLoggedSpirits}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.mostLoggedSpirits.map((spirit) => (
              <div
                key={spirit.name}
                className="flex justify-between items-center"
              >
                <span>{spirit.name}</span>
                <span className="text-muted-foreground">
                  {spirit.count} {t.times}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto pb-20">
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ListIcon className="w-4 h-4" />
            {t.yourLogs}
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <StarIcon className="w-4 h-4" />
            {t.highlights}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {renderLogs()}
        </TabsContent>

        <TabsContent value="highlights" className="space-y-6">
          {renderHighlights()}
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

      <CocktailLogDrawer
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
