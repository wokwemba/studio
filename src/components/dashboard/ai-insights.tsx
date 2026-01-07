'use client';

import { useState, useEffect } from 'react';
import {
  surfaceAiInsights,
  SurfaceAiInsightsOutput,
} from '@/ai/flows/surface-ai-insights';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader, Wand2 } from 'lucide-react';
import { trainingCampaigns } from '@/app/training/data';
import { leaderboardData } from '@/app/data';

export function AiInsights() {
  const [insights, setInsights] = useState<SurfaceAiInsightsOutput | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = leaderboardData.map((u) => ({
      userId: u.user.name,
      department: 'Sales', // Dummy data
      riskScore: 100 - u.score,
      phishingFailRate: Math.random() * 0.5,
      trainingCompletionRate: Math.random(),
    }));

    const modules = trainingCampaigns.flatMap((c) =>
      c.modules.map((m) => ({
        moduleId: m.id,
        category: c.title,
        difficulty: 'easy', // Dummy data
      }))
    );

    surfaceAiInsights({
      tenantId: 'demo-tenant',
      users: users,
      trainingModules: modules,
    }).then((result) => {
      setInsights(result);
      setLoading(false);
    });
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <span>AI Insights</span>
        </CardTitle>
        <CardDescription>
          AI-powered recommendations for your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center h-24">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : insights && insights.insights.length > 0 ? (
          <ul className="space-y-4">
            {insights.insights.slice(0, 2).map((insight, index) => (
              <li
                key={index}
                className="p-4 bg-accent/50 rounded-lg"
              >
                <p className="font-semibold text-sm mb-1">{insight.finding}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.recommendation}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1 flex justify-center items-center text-sm text-muted-foreground">
            <p>Could not load AI insights at the moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
