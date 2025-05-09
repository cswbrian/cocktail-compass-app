import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface TopBarsProps {
  bars: { name: string; count: number }[];
}

export function TopBars({ bars }: TopBarsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t.topBarsWithMostDrinks}</h3>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.name} className="flex justify-between items-center">
            <span>{bar.name}</span>
            <span className="text-muted-foreground">
              {bar.count} {t.times}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
} 