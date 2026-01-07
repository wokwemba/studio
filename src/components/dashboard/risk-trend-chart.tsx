"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
              left: 0,
              right: 12,
              top: 5
            }}
          >
            <CartesianGrid vertical={false} />
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillRisk" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-risk)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-risk)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="risk"
              type="natural"
              fill="url(#fillRisk)"
              fillOpacity={0.4}
              stroke="var(--color-risk)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
