
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, History } from 'lucide-react';

type TrainingResult = {
  id: string;
  moduleId: string;
  score: number;
  completedAt: string; // ISO String
};

export default function TrainingHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const trainingResultsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/trainingResults`), orderBy('completedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: trainingResults, isLoading } = useCollection<TrainingResult>(trainingResultsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Training History
        </CardTitle>
        <CardDescription>
          A detailed view of all your completed training modules and results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : !trainingResults || trainingResults.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p>You haven't completed any training modules yet.</p>
            <p className="text-sm">Your completed modules will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Date Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.moduleId}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={result.score < 80 ? 'destructive' : 'success'}>
                      {result.score.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(result.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
