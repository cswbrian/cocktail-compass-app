import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import useSWR from 'swr';
import { fetchers, swrConfig } from '@/lib/swr-config';

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

export function BasicStats() {
  const { language } = useLanguage();
  const t = translations[language];

  const { data: stats } = useSWR(
    'user-stats',
    () => fetchers.getUserStats(),
    swrConfig
  );

  if (!stats?.basicStats) {
    return null;
  }

  return (
    <div className="flex gap-6">
      <StatCard
        title={t.totalCocktailsDrunk}
        value={stats.basicStats.totalCocktailsDrunk}
      />
      <StatCard
        title={t.totalPlacesVisited}
        value={stats.basicStats.uniquePlaces}
      />
      <StatCard
        title={t.uniqueCocktails}
        value={stats.basicStats.uniqueCocktails}
      />
    </div>
  );
}
