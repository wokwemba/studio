'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, BarChart, Trophy, Percent, TrendingDown } from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { MetricCard } from '@/components/dashboard/metric-card';

type TrainingResult = {
  id: string;
  moduleId: string;
  score: number;
  completedAt: string;
};

type TopicPerformance = {
  topic: string;
  averageScore: number;
  attempts: number;
};

type ScoreBracket = {
  name: string;
  count: number;
};

export default function PerformancePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const trainingResultsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/trainingResults`), orderBy('completedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: trainingResults, isLoading } = useCollection<TrainingResult>(trainingResultsQuery);

  const { topicPerformance, scoreDistribution, personalBest, averageScore } = useMemo(() => {
    if (!trainingResults) {
      return { topicPerformance: [], scoreDistribution: [], personalBest: 0, averageScore: 0 };
    }

    // Calculate Topic Performance
    const performance: Record<string, { totalScore: number; count: number }> = {};
    trainingResults.forEach(result => {
      if (!performance[result.moduleId]) {
        performance[result.moduleId] = { totalScore: 0, count: 0 };
      }
      performance[result.moduleId].totalScore += result.score;
      performance[result.moduleId].count++;
    });

    const topicPerf = Object.entries(performance)
      .map(([topic, data]) => ({
        topic,
        averageScore: data.totalScore / data.count,
        attempts: data.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    // Calculate Score Distribution
    const brackets: ScoreBracket[] = [
      { name: '0-49%', count: 0 },
      { name: '50-69%', count: 0 },
      { name: '70-79%', count: 0 },
      { name: '80-89%', count: 0 },
      { name: '90-100%', count: 0 },
    ];

    trainingResults.forEach(result => {
      if (result.score < 50) brackets[0].count++;
      else if (result.score < 70) brackets[1].count++;
      else if (result.score < 80) brackets[2].count++;
      else if (result.score < 90) brackets[3].count++;
      else brackets[4].count++;
    });

    const totalModules = trainingResults.length;
    const bestScore = totalModules > 0 ? Math.max(...trainingResults.map(r => r.score)) : 0;
    const avgScore = totalModules > 0 ? trainingResults.reduce((acc, r) => acc + r.score, 0) / totalModules : 0;


    return { topicPerformance: topicPerf, scoreDistribution: brackets, personalBest: bestScore, averageScore: avgScore };
  }, [trainingResults]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  const weakestTopic = topicPerformance.length > 0 ? topicPerformance[topicPerformance.length - 1] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            Performance Details
          </CardTitle>
          <CardDescription>
            An in-depth look at your performance across all topics and quizzes.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Personal Best" value={`${personalBest.toFixed(0)}%`} subValue="Highest score achieved" />
        <MetricCard label="Average Score" value={`${averageScore.toFixed(0)}%`} subValue="Across all completed modules" />
        {weakestTopic && <MetricCard label="Weakest Area" value={weakestTopic.topic} subValue={`Avg. ${weakestTopic.averageScore.toFixed(0)}%`} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Score Distribution
          </CardTitle>
          <CardDescription>
            How your quiz scores are distributed across different ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Topic Performance
          </CardTitle>
          <CardDescription>Your average scores for each topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead className="text-right">Average Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topicPerformance.map((item) => (
                <TableRow key={item.topic}>
                  <TableCell className="font-medium">{item.topic}</TableCell>
                  <TableCell className="text-center">{item.attempts}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.averageScore < 80 ? 'destructive' : 'success'}>
                      {item.averageScore.toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
