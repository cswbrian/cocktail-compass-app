import { Card } from "@/components/ui/card";
import { BarChart } from "@/components/ui/bar-chart";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { BasicStats } from "./basic-stats";
import { TopBars } from "./top-bars";

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
      <BarChart
        data={Object.entries(stats.drinksByMonth).map(([month, count]) => ({
          month: format(new Date(month), 'MMM'),
          drinks: count
        }))}
        title={t.drinksOverTime}
        description={`${format(new Date(Object.keys(stats.drinksByMonth)[0] || new Date()), 'MMMM yyyy')} - ${format(new Date(Object.keys(stats.drinksByMonth).slice(-1)[0] || new Date()), 'MMMM yyyy')}`}
        footerText={t.drinksOverTime}
      />

      {/* Top Bars */}
      <TopBars bars={stats.topBarsWithMostDrinks} />

      {/* Photo Snapshot */}
      {stats.recentPhotos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.recentPhotos}</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.recentPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Cocktail photo ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 