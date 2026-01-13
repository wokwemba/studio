'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizzesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Quizzes</CardTitle>
        <CardDescription>A complete list of your upcoming, active, and incomplete quizzes.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A full dashboard for managing all assigned quizzes will be here.</p>
      </CardContent>
    </Card>
  );
}
