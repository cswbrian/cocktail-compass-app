import { BarChart } from "@/components/ui/bar-chart";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface DrinksBarChartProps {
  drinksByMonth: Record<string, number>;
}

export function DrinksBarChart({ drinksByMonth }: DrinksBarChartProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <BarChart
      data={Object.entries(drinksByMonth)
        .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime())
        .map(([month, count]) => ({
          month: format(new Date(month), 'MMM'),
          drinks: count
        }))}
      title={t.drinksOverTime}
      description={`${format(new Date(Object.keys(drinksByMonth)[0] || new Date()), 'MMMM yyyy')} - ${format(new Date(Object.keys(drinksByMonth).slice(-1)[0] || new Date()), 'MMMM yyyy')}`}
      footerText={(() => {
        const months = Object.entries(drinksByMonth);
        if (months.length < 2) return t.drinksOverTime;
        
        const [, currentCount] = months[months.length - 1];
        const [, prevCount] = months[months.length - 2];
        const difference = currentCount - prevCount;
        
        return difference >= 0
          ? t.drinksMoreThanLastMonth.replace('{count}', Math.abs(difference).toString())
          : t.drinksLessThanLastMonth.replace('{count}', Math.abs(difference).toString());
      })()}
      footerSubText={t.drinksOverTimeSubtext}  
      trendInfo={(() => {
        const months = Object.entries(drinksByMonth);
        if (months.length < 2) return undefined;
        
        const [, currentCount] = months[months.length - 1];
        const [, prevCount] = months[months.length - 2];
        const difference = currentCount - prevCount;
        
        return {
          value: Math.abs(difference),
          isPositive: difference >= 0
        };
      })()}
    />
  );
} 