"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  risk: {
    label: "Risk Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Dummy data as a fallback if no live data is available.
const riskTrendData = [
  { date: '2024-06-01', risk: 55 },
  { date: '2024-06-03', risk: 53 },
  { date: '2024-06-06', risk: 54 },
  { date: '2024-06-09', risk: 50 },
  { date: '2024-06-12', risk: 48 },
  { date: '2024-06-15', risk: 49 },
  { date: '2024-06-18', risk: 45 },
  { date: '2024-06-21', risk: 46 },
  { date: '2024-06-24', risk: 43 },
  { date: '2024-06-27', risk: 42 },
  { date: '2024-06-30', risk: 42 },
];


export function RiskTrendChart() {
  // In a real app, this data would be fetched from Firestore.
  // For now, we'll continue using the static data for the chart's visual representation.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Risk Trend</CardTitle>
        <CardDescription>
          Your risk score evolution over the last 30 days (static demo data).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={riskTrendData}
            margin={{
              left: -20,
              right: 12,
              top: 5
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={['dataMin - 5', 'dataMax + 5']} />
            <ChartTooltip
              cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: "3 3"}}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillRisk" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="risk"
              type="monotone"
              fill="url(#fillRisk)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
