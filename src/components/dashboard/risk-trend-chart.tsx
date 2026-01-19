"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RiskTrendChart() {
  // In a real app, this data would be fetched from Firestore.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Risk Trend</CardTitle>
        <CardDescription>
          Your risk score evolution over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Historical risk data coming soon.</p>
      </CardContent>
    </Card>
  );
}
