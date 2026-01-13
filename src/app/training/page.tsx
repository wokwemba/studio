'use client';

import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader, BarChart, History, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

type TrainingResult = {
  id: string;
  moduleId: string; // This is the topic, e.g., "Recognizing Phishing Emails"
  score: number;
  completedAt: string; // ISO String
};

type TopicPerformance = {
  topic: string;
  averageScore: number;
  attempts: number;
};

const PASSING_SCORE = 80;

const MetricCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function MyTrainingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const trainingResultsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/trainingResults`)) : null),
    [user, firestore]
  );
  const { data: trainingResults, isLoading: isResultsLoading } = useCollection<TrainingResult>(trainingResultsQuery);

  const isLoading = isUserLoading || isResultsLoading;

  // --- Data Processing ---
  const totalModules = trainingResults?.length || 0;
  const averageScore = totalModules > 0 
    ? (trainingResults!.reduce((acc, r) => acc + r.score, 0) / totalModules)
    : 0;

  const bestScore = totalModules > 0
    ? Math.max(...trainingResults!.map(r => r.score))
    : 0;
  
  const topicPerformance = trainingResults
    ? Object.values(
        trainingResults.reduce((acc, result) => {
          const { moduleId, score } = result;
          if (!acc[moduleId]) {
            acc[moduleId] = { topic: moduleId, totalScore: 0, attempts: 0 };
          }
          acc[moduleId].totalScore += score;
          acc[moduleId].attempts++;
          return acc;
        }, {} as Record<string, { topic: string; totalScore: number; attempts: number }>)
      ).map(({ topic, totalScore, attempts }) => ({
        topic,
        averageScore: totalScore / attempts,
        attempts,
      })).sort((a, b) => a.averageScore - b.averageScore) // Sort from worst to best
    : [];

  const topWeakestTopic = topicPerformance.length > 0 ? topicPerformance[0] : null;
  const topStrongestTopic = topicPerformance.length > 0 ? topicPerformance[topicPerformance.length - 1] : null;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <p>Please log in to see your training console.</p>
  }
  
  if (totalModules === 0) {
      return (
          <Card>
            <CardHeader>
                <CardTitle className='font-headline'>My Training Console</CardTitle>
                <CardDescription>Your personal cybersecurity learning dashboard.</CardDescription>
            </CardHeader>
            <CardContent className='text-center py-12'>
                <p className='text-lg text-muted-foreground'>You haven't completed any training modules yet.</p>
                <p className='text-sm mt-2'>Start your learning journey by generating an AI module or taking an assigned course.</p>
            </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Training Console</h1>

      {/* Core Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Modules Completed" value={totalModules} icon={BarChart} />
        <MetricCard title="Average Score" value={`${averageScore.toFixed(0)}%`} icon={TrendingUp} />
        <MetricCard title="Best Score" value={`${bestScore.toFixed(0)}%`} icon={Star} />
      </div>

       {/* Topic Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingDown className="text-destructive" />
                    <span>Area for Improvement</span>
                </CardTitle>
                <CardDescription>Based on your average scores, focus on this topic to boost your security skills.</CardDescription>
            </CardHeader>
            <CardContent>
                {topWeakestTopic ? (
                    <div>
                        <p className="text-lg font-semibold">{topWeakestTopic.topic}</p>
                        <div className='flex items-center gap-4 mt-2'>
                           <Progress value={topWeakestTopic.averageScore} className="w-full" />
                           <span className='font-mono font-bold'>{topWeakestTopic.averageScore.toFixed(0)}%</span>
                        </div>
                        <p className='text-xs text-muted-foreground mt-1'>Across {topWeakestTopic.attempts} attempt(s)</p>
                    </div>
                ): <p className="text-muted-foreground">Not enough data.</p>}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="text-success" />
                    <span>Strongest Area</span>
                </CardTitle>
                <CardDescription>You've consistently performed well in this topic. Keep it up!</CardDescription>
            </CardHeader>
            <CardContent>
                 {topStrongestTopic ? (
                    <div>
                        <p className="text-lg font-semibold">{topStrongestTopic.topic}</p>
                        <div className='flex items-center gap-4 mt-2'>
                           <Progress value={topStrongestTopic.averageScore} className="w-full bg-success/20" />
                           <span className='font-mono font-bold text-success'>{topStrongestTopic.averageScore.toFixed(0)}%</span>
                        </div>
                        <p className='text-xs text-muted-foreground mt-1'>Across {topStrongestTopic.attempts} attempt(s)</p>
                    </div>
                ): <p className="text-muted-foreground">Not enough data.</p>}
            </CardContent>
        </Card>
      </div>

      {/* Completed Quizzes/Modules */}
      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <History />
                <span>Training History</span>
            </CardTitle>
            <CardDescription>A log of all your completed training modules and quiz results.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Module / Topic</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Completion Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trainingResults?.map(result => (
                        <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.moduleId}</TableCell>
                            <TableCell className="text-center font-mono">{result.score.toFixed(0)}%</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={result.score >= PASSING_SCORE ? 'success' : 'destructive'}>
                                    {result.score >= PASSING_SCORE ? 'Pass' : 'Fail'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{format(new Date(result.completedAt), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
