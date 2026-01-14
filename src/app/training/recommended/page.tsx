
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecommendedActionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Actions</CardTitle>
        <CardDescription>All AI-driven recommendations to improve your security posture.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A full list of recommended actions and modules will be here.</p>
      </CardContent>
    </Card>
  );
}
