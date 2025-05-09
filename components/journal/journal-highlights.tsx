import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { BasicStats } from "./basic-stats";
import { TopBars } from "./top-bars";
import { DrinksBarChart } from "./drinks-bar-chart";
import { PhotoSnapshot } from "./photo-snapshot";

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

interface JournalHighlightsProps {
  stats: EnhancedStats;
  isLoading: boolean;
}

export function JournalHighlights({ stats, isLoading }: JournalHighlightsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (isLoading) {
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
    <div className="space-y-8">
      {/* Basic Stats */}
      <BasicStats stats={stats.basicStats} />

      {/* Drinks Over Time */}
      <DrinksBarChart drinksByMonth={stats.drinksByMonth} />

      {/* Top Bars */}
      <TopBars bars={stats.topBarsWithMostDrinks} />

      {/* Photo Snapshot */}
      <PhotoSnapshot photos={stats.recentPhotos} />
    </div>
  );
} 