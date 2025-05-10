"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailLog } from "@/types/cocktail-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListIcon, NotebookPenIcon, BarChart3Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CocktailLogForm } from "@/components/cocktail-log/cocktail-log-form";
import { JournalHighlights } from "./journal-highlights";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";
import { useCocktailData } from "@/context/CocktailLogContext";

export function JournalClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const { logs, stats, isLoading, mutate } = useCocktailData();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CocktailLog | null>(null);

  if (!user) {
    router.push(`/${language}/login`);
    return null;
  }

  const handleLogSaved = async () => {
    await mutate();
  };

  const handleLogDeleted = async () => {
    await mutate();
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
            <BarChart3Icon className="w-4 h-4" />
            {t.highlights}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <div className="px-6">
          <BasicStats stats={stats.basicStats} />
          </div>
          <Feeds
            logs={logs}
            isLoading={isLoading}
            onLogSaved={handleLogSaved}
            onLogDeleted={handleLogDeleted}
            onLogsChange={() => {}}
          />
        </TabsContent>

        <TabsContent value="highlights" className="space-y-6">
          <JournalHighlights stats={stats} isLoading={isLoading} />
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
        onLogsChange={() => {}}
        onSuccess={() => {
          setIsDrawerOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
