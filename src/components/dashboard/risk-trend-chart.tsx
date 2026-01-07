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
import { riskTrendData } from "@/app/data";

const chartConfig = {
  risk: {
    label: "Risk Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function RiskTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Risk Trend</CardTitle>
        <CardDescription>
          Your risk score evolution over the last 30 days.
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
