import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Metric } from "@/app/data";

const trendIcons = {
  increase: <ArrowUp className="h-4 w-4 text-success" />,
  decrease: <ArrowDown className="h-4 w-4 text-destructive" />,
  same: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export function MetricCard({ label, value, subValue, change }: Metric) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-body">{label}</CardTitle>
        {change && trendIcons[change]}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground">{subValue}</p>
      </CardContent>
    </Card>
  );
}
