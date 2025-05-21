"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  LabelList,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface ChartContainerProps {
  children: ReactNode;
  config: ChartConfig;
}

function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <div className="w-full">
      <style jsx global>{`
        :root {
          ${Object.entries(config)
            .map(([key, { color }]) => `--color-${key}: ${color};`)
            .join("\n")}
        }
      `}</style>
      {children}
    </div>
  );
}
interface BarChartProps {
  data: {
    month: string;
    drinks: number;
  }[];
  title: string;
  description: string;
  footerText: string;
  footerSubText: string;
  trendInfo?: {
    value: number;
    isPositive: boolean;
  };
}

const chartConfig = {
  drinks: {
    label: "Drinks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function BarChart({
  data,
  title,
  description,
  footerText,
  footerSubText,
  trendInfo,
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={data}
                margin={{
                  top: 20,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Bar
                  dataKey="drinks"
                  fill="var(--primary)"
                  radius={[10, 10, 10, 10]}
                  barSize={40}
                >
                  <LabelList
                    dataKey="drinks"
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {trendInfo && (
          <div className="flex gap-2 font-medium leading-none">
            {footerText}{" "}
            {trendInfo.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          {footerSubText}
        </div>
      </CardFooter>
    </Card>
  );
}
