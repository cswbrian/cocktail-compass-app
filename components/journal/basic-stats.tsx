import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}

interface BasicStatsProps {
  stats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniqueBars: number;
  };
}

export function BasicStats({ stats }: BasicStatsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="grid gap-2 grid-cols-3">
      <StatCard title={t.totalCocktailsDrunk} value={stats.totalCocktailsDrunk} />
      <StatCard title={t.uniqueCocktails} value={stats.uniqueCocktails} />
      <StatCard title={t.totalBarsVisited} value={stats.uniqueBars} />
    </div>
  );
} 