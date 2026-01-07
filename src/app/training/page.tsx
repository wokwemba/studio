'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateTrainingModule,
  GenerateTrainingModuleOutput,
} from '@/ai/flows/generate-training-module';
import { Loader } from 'lucide-react';

export default function TrainingPage() {
  const [trainingModule, setTrainingModule] =
    useState<GenerateTrainingModuleOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateTrainingModule({
      topic: 'Phishing Awareness',
      difficulty: 'easy',
      targetRole: 'Employee',
    }).then((module) => {
      setTrainingModule(module);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Training</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : trainingModule ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{trainingModule.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 font-headline">Module Content</h2>
                <p className="text-muted-foreground">{trainingModule.content}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 font-headline">Scenario</h2>
                <p className="text-muted-foreground">{trainingModule.scenario}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 font-headline">Quiz</h2>
                <p className="text-muted-foreground">{trainingModule.quiz}</p>
              </div>
              <Button>Start Quiz</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p>No training module available.</p>
      )}
    </div>
  );
}
