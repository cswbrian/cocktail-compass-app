import { BarChart } from '@/components/ui/bar-chart';
import { format, subMonths, startOfMonth } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

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

function generateMockData() {
  // Get the last 6 months
  const today = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, i);
    return format(startOfMonth(date), 'yyyy-MM');
  }).reverse();

  // Hardcoded numbers for each month
  const mockDrinks = [2, 5, 4, 7, 6, 10]; // Different numbers for each month
  return last6Months.map((month, index) => ({
    month: format(new Date(month), 'MMM'),
    drinks: mockDrinks[index],
  }));
}

function prepareChartData(
  drinksByMonth: Record<string, number>,
  t: {
    drinksOverTime: string;
    drinksMoreThanLastMonth: string;
    drinksLessThanLastMonth: string;
    noDataMessage: string;
  },
): PreparedChartData {
  // Get the last 6 months
  const today = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, i);
    return format(startOfMonth(date), 'yyyy-MM');
  }).reverse();

  // Create data array with zero-filling for missing months
  const data = last6Months.map(month => ({
    month: format(new Date(month), 'MMM'),
    drinks: drinksByMonth[month] || 0,
  }));

  const description = `${format(new Date(last6Months[0]), 'MMMM yyyy')} - ${format(new Date(last6Months[last6Months.length - 1]), 'MMMM yyyy')}`;

  let footerText = t.drinksOverTime;
  let trendInfo: PreparedChartData['trendInfo'] | undefined;

  if (data.length >= 2) {
    const currentCount = data[data.length - 1].drinks;
    const prevCount = data[data.length - 2].drinks;
    const difference = currentCount - prevCount;

    footerText =
      difference >= 0
        ? t.drinksMoreThanLastMonth.replace(
            '{count}',
            Math.abs(difference).toString(),
          )
        : t.drinksLessThanLastMonth.replace(
            '{count}',
            Math.abs(difference).toString(),
          );

    trendInfo = {
      value: Math.abs(difference),
      isPositive: difference >= 0,
    };
  }

  return {
    data,
    description,
    footerText,
    trendInfo,
  };
}

export function DrinksBarChart({
  drinksByMonth,
}: DrinksBarChartProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const hasData = Object.values(drinksByMonth).some(count => count > 0);
  const chartData = prepareChartData(drinksByMonth, t);
  const mockData = generateMockData();

  return (
    <div className="relative">
      <BarChart
        data={hasData ? chartData.data : mockData}
        title={t.drinksOverTime}
        description={chartData.description}
        footerText={hasData ? chartData.footerText : t.drinksOverTime}
        footerSubText={t.drinksOverTimeSubtext}
        trendInfo={hasData ? chartData.trendInfo : undefined}
      />
      {!hasData && (
        <div className="absolute inset-x-0 top-[120px] h-[200px] flex items-center justify-center backdrop-blur-sm">
          <div className="text-center px-12 py-6 max-w-md">
            <p className="font-bold text-accent-foreground">
              {t.noDataMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
