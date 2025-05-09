"use client";

import { ReactNode } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ChartConfig = Record<string, {
  label: string
  color: string
}>

interface ChartContainerProps {
  children: ReactNode
  config: ChartConfig
}

function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <div className="w-full">
      <style jsx global>{`
        :root {
          ${Object.entries(config).map(
            ([key, { color }]) => `--color-${key}: ${color};`
          ).join("\n")}
        }
      `}</style>
      {children}
    </div>
  )
}

interface ChartTooltipProps {
  children: ReactNode
  cursor?: boolean
  content?: ReactNode
}

function ChartTooltip({ children, cursor = true, content }: ChartTooltipProps) {
  return (
    <div className={`relative ${cursor ? "cursor-pointer" : ""}`}>
      {children}
      {content && (
        <div className="absolute z-50 hidden group-hover:block">
          {content}
        </div>
      )}
    </div>
  )
}

function ChartTooltipContent() {
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium">Value</span>
          </div>
          <span className="text-sm font-medium">123</span>
        </div>
      </div>
    </div>
  )
}

interface BarChartProps {
  data: {
    month: string;
    drinks: number;
  }[];
  title: string;
  description: string;
  footerText: string;
}

const chartConfig = {
  drinks: {
    label: "Drinks",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function BarChart({ data, title, description, footerText }: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <RechartsBarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false}>
              <ChartTooltipContent />
            </ChartTooltip>
            <Bar dataKey="drinks" fill="var(--color-drinks)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {footerText} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {footerText}
        </div>
      </CardFooter>
    </Card>
  )
} 