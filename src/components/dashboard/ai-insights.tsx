'use client';

import { useState } from 'react';
import {
  surfaceAiInsights,
  SurfaceAiInsightsOutput,
} from '@/ai/flows/surface-ai-insights';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Wand2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function AiInsights() {
  const [insights, setInsights] = useState<SurfaceAiInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const tenantId = (user as any)?.tenantId;

  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery, { skip: !usersQuery });

  const modulesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'trainingModules')) : null, [firestore]);
  const { data: trainingModules, isLoading: modulesLoading } = useCollection(modulesQuery);


  const handleGenerateInsights = () => {
    if (!users || !trainingModules) {
      setError("User and training data is not available yet. Please try again in a moment.");
      return;
    }
    setLoading(true);
    setError(null);
    setInsights(null);

    const insightUsers = users.map((u) => ({
      userId: u.id,
      department: 'N/A', // This would come from the user profile if available
      riskScore: u.risk === 'High' ? 85 : u.risk === 'Medium' ? 50 : 20,
      phishingFailRate: Math.random() * 0.5, // Placeholder
      trainingCompletionRate: Math.random(), // Placeholder
    }));
    
    const insightModules = trainingModules.map((m) => ({
        moduleId: m.id,
        category: m.category,
        difficulty: m.difficulty,
    }));


    surfaceAiInsights({
      tenantId: tenantId || 'default-tenant-ccyberguard',
      users: insightUsers,
      trainingModules: insightModules,
    })
      .then((result) => {
        setInsights(result);
      })
      .catch((err) => {
        console.error('AI Insights Error:', err);
        setError('Could not load AI insights. The service may be temporarily unavailable.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
      <CardContent className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-sm text-destructive">{error}</div>
        ) : insights ? (
          <ul className="space-y-4">
            {insights.insights.slice(0, 2).map((insight, index) => (
              <li key={index} className="p-4 bg-accent/50 rounded-lg">
                <p className="font-semibold text-sm mb-1">{insight.finding}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.recommendation}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            {usersLoading || modulesLoading ? <div className='flex items-center gap-2 justify-center'><Loader className='w-4 h-4 animate-spin' /> <span>Loading data...</span></div> : 'Click the button to generate AI-powered insights.'}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={loading || usersLoading || modulesLoading} className="w-full">
          {loading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Generating...' : 'Generate Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}
