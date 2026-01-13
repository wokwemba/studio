
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, BarChart, BookOpenCheck, ChevronRight, Activity, TrendingDown, Star, ListTodo } from 'lucide-react';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { cn } from '@/lib/utils';


type TrainingResult = {
  id: string;
  moduleId: string; // This is the 'topic'
  score: number;
  completedAt: string; // ISO String
};

type TopicPerformance = {
  topic: string;
  averageScore: number;
  attempts: number;
};

// This is a simplified placeholder. In a real app, this would be more dynamic.
const upcomingQuizzes = [
  { id: 'uq1', title: 'Q3 Phishing Simulation', dueDate: '2024-09-01', priority: 'Required' },
  { id: 'uq2', title: 'Advanced Password Protection', dueDate: '2024-09-15', priority: 'Recommended' },
];

const recommendedActions = [
    { id: 'ra1', title: 'Retake "Social Engineering" module', reason: 'Low score (40%)', href:'/training/module' },
    { id: 'ra2', title: 'Start "Cloud Security Fundamentals"', reason: 'New company-wide requirement', href:'/training/module' },
];

const incompleteQuizzes = [
  { id: 'iq1', module: 'Data Privacy Basics', completed: 50, },
  { id: 'iq2', module: 'Secure Wi-Fi Usage', completed: 25, },
]

export default function MyTrainingPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const trainingResultsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, `users/${user.uid}/trainingResults`), orderBy('completedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: trainingResults, isLoading: isLoadingResults } = useCollection<TrainingResult>(trainingResultsQuery);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isLoadingUser } = useDoc<{risk: 'Low' | 'Medium' | 'High'}>(userDocRef);
  

  const { metrics, topicPerformance, personalBest, averageScore, weakestTopics } = useMemo(() => {
    if (!trainingResults || !userData) {
      return { metrics: [], topicPerformance: [], personalBest: 0, averageScore: 0, weakestTopics: [] };
    }

    const totalModules = trainingResults.length;
    const totalScore = trainingResults.reduce((acc, r) => acc + r.score, 0);
    const avgScore = totalModules > 0 ? totalScore / totalModules : 0;
    const bestScore = totalModules > 0 ? Math.max(...trainingResults.map(r => r.score)) : 0;
    
    const metricsData = [
        { label: 'Risk Score', value: userData.risk || 'N/A', subValue: 'Current' },
        { label: 'Modules Completed', value: totalModules, subValue: 'All time' },
        { label: 'Average Score', value: `${avgScore.toFixed(0)}%`, subValue: 'All quizzes' },
    ];

    const performance: Record<string, { totalScore: number; count: number }> = {};
    trainingResults.forEach(result => {
      if (!performance[result.moduleId]) {
        performance[result.moduleId] = { totalScore: 0, count: 0 };
      }
      performance[result.moduleId].totalScore += result.score;
      performance[result.moduleId].count++;
    });

    const topicPerf = Object.entries(performance).map(([topic, data]) => ({
      topic,
      averageScore: data.totalScore / data.count,
      attempts: data.count,
    }));
    
    const weakTopics = topicPerf.sort((a,b) => a.averageScore - b.averageScore).slice(0, 3);

    return { metrics: metricsData, topicPerformance: topicPerf, personalBest: bestScore, averageScore: avgScore, weakestTopics: weakTopics };
  }, [trainingResults, userData]);
  
  const isLoading = isLoadingResults || isLoadingUser;

  const ClickableCard = ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => (
    <Link href={href} className="block group">
      <Card className={cn("transition-all duration-200 ease-in-out hover:shadow-lg hover:border-primary/50", className)}>
        {children}
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Training</h1>
        <p className="text-muted-foreground">Your personal cybersecurity learning dashboard.</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <ClickableCard key={metric.label} href="/risk-profile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">{metric.subValue}</p>
                </CardContent>
              </ClickableCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <ClickableCard href="/training/history">
                    <CardHeader>
                        <CardTitle className="font-headline flex justify-between items-center">
                            <span>Training History</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                        </CardTitle>
                        <CardDescription>Your completed modules and quiz scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Module</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trainingResults?.slice(0, 3).map((result) => (
                            <TableRow key={result.id}>
                                <TableCell className="font-medium">{result.moduleId}</TableCell>
                                <TableCell className="text-center">
                                <Badge variant={result.score < 80 ? 'destructive' : 'success'}>
                                    {result.score.toFixed(0)}%
                                </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                {new Date(result.completedAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </CardContent>
                </ClickableCard>
                 <ClickableCard href="/risk-profile">
                    <CardHeader>
                         <CardTitle className="font-headline flex justify-between items-center">
                            <span>Risk Trend</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <RiskTrendChart />
                     </CardContent>
                 </ClickableCard>
            </div>
            
            <div className="space-y-6">
                <ClickableCard href="/training/performance">
                    <CardHeader>
                        <CardTitle className="font-headline flex justify-between items-center">
                            <span>Performance</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                            <span className="font-semibold text-sm">Personal Best</span>
                            <span className="font-bold text-lg text-primary">{personalBest.toFixed(0)}%</span>
                        </div>
                         <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                            <span className="font-semibold text-sm">Average Score</span>
                            <span className="font-bold text-lg">{averageScore.toFixed(0)}%</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2 mt-4 flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" /> Weakest Topics</h4>
                            <ul className="space-y-2">
                                {weakestTopics.map(t => (
                                    <li key={t.topic} className="text-xs text-muted-foreground flex justify-between">
                                        <span>{t.topic}</span>
                                        <span className="font-medium">{t.averageScore.toFixed(0)}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </ClickableCard>

                <ClickableCard href="/training/quizzes">
                    <CardHeader>
                        <CardTitle className="font-headline flex justify-between items-center">
                            <span>Quizzes</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><ListTodo className="h-4 w-4" /> Upcoming</h4>
                        <ul className="space-y-2 mb-4">
                            {upcomingQuizzes.map(q => (
                                <li key={q.id} className="text-xs flex justify-between items-center">
                                    <div>
                                        <p>{q.title}</p>
                                        <p className="text-muted-foreground">Due: {q.dueDate}</p>
                                    </div>
                                    <Badge variant={q.priority === 'Required' ? 'destructive' : 'secondary'}>{q.priority}</Badge>
                                </li>
                            ))}
                        </ul>
                         <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> Incomplete</h4>
                         <ul className='space-y-2'>
                           {incompleteQuizzes.map(q => (
                                <li key={q.id} className='text-xs flex justify-between items-center'>
                                     <p>{q.module}</p>
                                     <Button size="sm" variant="outline">Resume</Button>
                                 </li>
                           ))}
                         </ul>
                    </CardContent>
                </ClickableCard>
                 <ClickableCard href="/training/recommended">
                     <CardHeader>
                        <CardTitle className="font-headline flex justify-between items-center">
                            <span>Recommended Actions</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {recommendedActions.map(action => (
                                <li key={action.id} className="text-xs">
                                <p className="font-semibold">{action.title}</p>
                                <p className="text-muted-foreground">{action.reason}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                 </ClickableCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
