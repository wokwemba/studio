'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrainingHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training History</CardTitle>
        <CardDescription>A detailed view of all your completed training modules and results.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Full training history table with sorting and filtering will be here.</p>
      </CardContent>
    </Card>
  );
}
