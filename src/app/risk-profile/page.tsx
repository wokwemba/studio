'use client';

import { useState, useEffect } from 'react';
import {
  provideAiRiskAdvice,
  ProvideAiRiskAdviceOutput,
} from '@/ai/flows/provide-ai-risk-advice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Wand2 } from 'lucide-react';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { metrics } from '@/app/data';

export default function RiskProfilePage() {
  const [advice, setAdvice] = useState<ProvideAiRiskAdviceOutput | null>(null);
  const [loading, setLoading] = useState(true);

  const riskProfile =
    'This user has a high phishing detection failure rate and low multi-factor authentication (MFA) awareness. They have completed only 50% of their assigned training modules.';

  useEffect(() => {
    provideAiRiskAdvice({ riskProfile }).then((result) => {
      setAdvice(result);
    }).catch(err => {
      console.error(err);
      // No need to set a separate error state, the null `advice` will be handled
    }).finally(() => {
        setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Risk Profile</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>AI Risk Advisor</span>
            </CardTitle>
            <CardDescription>
              Personalized advice to improve your security posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[8rem]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            ) : advice ? (
              <p className="text-muted-foreground">{advice.advice}</p>
            ) : (
              <p className="text-destructive text-sm">Could not load AI-driven advice. The service may be temporarily unavailable.</p>
            )}
          </CardContent>
        </Card>
        <RiskTrendChart />
      </div>
    </div>
  );
}
