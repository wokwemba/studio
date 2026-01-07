'use client';

import { useState, useEffect } from 'react';
import {
  explainSimulationFailure,
  ExplainSimulationFailureOutput,
} from '@/ai/flows/explain-simulation-failure';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    explainSimulationFailure({
      emailContent: emailContent,
      userDepartment: 'Marketing',
    }).then((result) => {
      setExplanation(result);
      setLoading(false);
    });
  }, []);

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
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg font-headline">Phishing Email Content</h3>
                <pre className="bg-muted p-4 rounded-lg mt-2 font-code text-sm whitespace-pre-wrap">{emailContent}</pre>
              </div>
              <div>
                <h3 className="font-semibold text-lg font-headline">AI Explanation</h3>
                <p className="text-muted-foreground mt-2">{explanation.explanation}</p>
              </div>
            </div>
          ) : (
            <p>Could not load simulation analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
