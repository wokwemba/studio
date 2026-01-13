'use client';

import { useState } from 'react';
import {
  provideAiRiskAdvice,
  ProvideAiRiskAdviceOutput,
} from '@/ai/flows/provide-ai-risk-advice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Wand2 } from 'lucide-react';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { MetricCard } from '@/components/dashboard/metric-card';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type UserData = {
  risk: 'Low' | 'Medium' | 'High';
  trainingResults?: any[];
  name?: string;
  email?: string;
};

export default function RiskProfilePage() {
  const [advice, setAdvice] = useState<ProvideAiRiskAdviceOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const riskProfile =
    'This user has a high phishing detection failure rate and low multi-factor authentication (MFA) awareness. They have completed only 50% of their assigned training modules.';

  const handleGetAdvice = () => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    provideAiRiskAdvice({ riskProfile })
      .then((result) => {
        setAdvice(result);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load AI-driven advice. The service may be temporarily unavailable.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const metrics = [
    {
      label: 'Risk Score',
      value: userData?.risk || 'N/A',
      subValue: 'Current Risk Level',
    },
    {
      label: 'Training Completed',
      value: `${userData?.trainingResults?.length || 0} modules`,
      subValue: 'All time',
    },
    {
      label: 'Global Rank',
      value: 'N/A', // This would require a more complex query or pre-calculated ranks
      subValue: 'Coming soon',
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Risk Profile</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>AI Risk Advisor</span>
            </CardTitle>
            <CardDescription>
              Personalized advice to improve your security posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[8rem]">
            {loading ? (
              <Loader className="h-8 w-8 animate-spin" />
            ) : error ? (
              <p className="text-destructive text-sm text-center">{error}</p>
            ) : advice ? (
              <p className="text-muted-foreground text-center">{advice.advice}</p>
            ) : (
              <p className="text-muted-foreground text-sm text-center">Click the button to get personalized AI advice.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleGetAdvice} disabled={loading} className="w-full">
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {loading ? 'Getting Advice...' : 'Get AI Advice'}
            </Button>
          </CardFooter>
        </Card>
        <RiskTrendChart />
      </div>
    </div>
  );
}
