'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerformancePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Details</CardTitle>
        <CardDescription>An in-depth look at your performance across all topics and quizzes.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Detailed charts and analysis of topic performance, personal bests, and trends will be here.</p>
      </CardContent>
    </Card>
  );
}
