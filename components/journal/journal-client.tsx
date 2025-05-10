"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListIcon, BarChart3Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCocktailData } from "@/context/CocktailLogContext";
import { JournalHighlights } from "./journal-highlights";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";

export function JournalClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const { logs, stats, isLoading, mutate } = useCocktailData();

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
    </div>
  );
}
