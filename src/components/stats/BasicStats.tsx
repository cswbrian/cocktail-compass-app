import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div>
      <p className="text-2xl">{value}</p>
      <h3 className="text-sm text-muted-foreground mb-2">
        {title}
      </h3>
    </div>
  );
}

interface BasicStatsProps {
  stats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniquePlaces: number;
  };
}

export function BasicStats({ stats }: BasicStatsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex gap-6">
      <StatCard
        title={t.totalCocktailsDrunk}
        value={stats.totalCocktailsDrunk}
      />
      <StatCard
        title={t.totalPlacesVisited}
        value={stats.uniquePlaces}
      />
      <StatCard
        title={t.uniqueCocktails}
        value={stats.uniqueCocktails}
      />
    </div>
  );
}
