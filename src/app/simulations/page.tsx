'use client';

import { useState } from 'react';
import {
  explainSimulationFailure,
  ExplainSimulationFailureOutput,
} from '@/ai/flows/explain-simulation-failure';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Wand2 } from 'lucide-react';

const emailContent = `
    From: IT Support <it-support@example-corp.com>
    Subject: Urgent: Action Required - Your account will be suspended
    
    Dear Employee,
    
    We have detected unusual activity on your account. To protect your account, we need you to verify your login credentials immediately.
    
    Please click the link below to verify your account:
    http://example-corp-login.com/verify
    
    If you do not verify your account within 24 hours, it will be permanently suspended.
    
    Thank you,
    IT Support
  `;

export default function SimulationsPage() {
  const [explanation, setExplanation] =
    useState<ExplainSimulationFailureOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    explainSimulationFailure({
      emailContent: emailContent,
      userDepartment: 'Marketing',
    })
      .then((result) => {
        setExplanation(result);
      })
      .catch((err) => {
        console.error('Simulations Page Error:', err);
        setError('Could not load AI analysis. The service may be temporarily unavailable due to high demand.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Simulations</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Phishing Simulation Analysis</CardTitle>
          <CardDescription>
            Analysis of a failed phishing simulation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg font-headline">Phishing Email Content</h3>
              <pre className="bg-muted p-4 rounded-lg mt-2 font-code text-sm whitespace-pre-wrap">{emailContent}</pre>
            </div>
            <div>
              <h3 className="font-semibold text-lg font-headline">AI Explanation</h3>
              <div className="min-h-[8rem] mt-2 flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                {loading ? (
                  <Loader className="h-8 w-8 animate-spin" />
                ) : error ? (
                   <p className="text-destructive text-sm">{error}</p>
                ) : explanation ? (
                  <p className="text-muted-foreground text-sm">{explanation.explanation}</p>
                ) : (
                   <p className="text-muted-foreground text-sm">Click the button to analyze why this simulation might succeed.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {loading ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
