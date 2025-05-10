import { BarChart } from "@/components/ui/bar-chart";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface DrinksBarChartProps {
  drinksByMonth: Record<string, number>;
}

interface PreparedChartData {
  data: Array<{ month: string; drinks: number }>;
  description: string;
  footerText: string;
  trendInfo?: {
    value: number;
    isPositive: boolean;
  };
}

function prepareChartData(
  drinksByMonth: Record<string, number>,
  t: { drinksOverTime: string; drinksMoreThanLastMonth: string; drinksLessThanLastMonth: string }
): PreparedChartData {
  const sortedEntries = Object.entries(drinksByMonth)
    .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime());

  const data = sortedEntries.map(([month, count]) => ({
    month: format(new Date(month), 'MMM'),
    drinks: count
  }));

  const description = `${format(new Date(sortedEntries[0]?.[0] || new Date()), 'MMMM yyyy')} - ${format(new Date(sortedEntries[sortedEntries.length - 1]?.[0] || new Date()), 'MMMM yyyy')}`;

  let footerText = t.drinksOverTime;
  let trendInfo: PreparedChartData['trendInfo'] | undefined;

  if (sortedEntries.length >= 2) {
    const [, currentCount] = sortedEntries[sortedEntries.length - 1];
    const [, prevCount] = sortedEntries[sortedEntries.length - 2];
    const difference = currentCount - prevCount;
    
    footerText = difference >= 0
      ? t.drinksMoreThanLastMonth.replace('{count}', Math.abs(difference).toString())
      : t.drinksLessThanLastMonth.replace('{count}', Math.abs(difference).toString());

    trendInfo = {
      value: Math.abs(difference),
      isPositive: difference >= 0
    };
  }

  return {
    data,
    description,
    footerText,
    trendInfo
  };
}

export function DrinksBarChart({ drinksByMonth }: DrinksBarChartProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const chartData = prepareChartData(drinksByMonth, t);

  return (
    <BarChart
      data={chartData.data}
      title={t.drinksOverTime}
      description={chartData.description}
      footerText={chartData.footerText}
      footerSubText={t.drinksOverTimeSubtext}
      trendInfo={chartData.trendInfo}
    />
  );
} 