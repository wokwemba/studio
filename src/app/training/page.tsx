
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, AlertTriangle, FileText, Lightbulb, Bell, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/metric-card';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/components/auth/AuthProvider';

// The UserProgress document is an aggregate of a user's progress.
type UserProgressAggregate = {
  completedModules?: Array<{
      moduleId: string;
      status: string;
      completedAt?: string;
      score?: number;
  }>;
};

function UserTrainingDashboard() {
  const { user, loading: isAuthLoading } = useAuthContext();
  const firestore = useFirestore();

  // Correctly fetch the single document for the user's progress.
  const userProgressDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'userProgress', user.uid) : null),
    [user, firestore]
  );
  const { data: userProgress, isLoading: isLoadingResults } = useDoc<UserProgressAggregate>(userProgressDocRef);

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isLoadingUser } = useDoc<{risk: 'Low' | 'Medium' | 'High', trainingStats?: { completedModules?: number, totalModules?: number, avgScore?: number, complianceScore?: number }}>(userDocRef);

  const metrics = useMemo(() => {
    const stats = userData?.trainingStats || {};
    return [
        { label: 'Compliance', value: `${stats.complianceScore || 0}%`, subValue: 'Overall' },
        { label: 'Completed', value: `${stats.completedModules || 0}/${stats.totalModules || 0}`, subValue: 'Modules' },
        { label: 'Avg Score', value: `${stats.avgScore || 0}%`, subValue: 'All quizzes' },
        { label: 'Risk', value: userData?.risk || 'N/A', subValue: 'Current Level' },
    ];
  }, [userData]);
  
  const isLoading = isLoadingResults || isLoadingUser || isAuthLoading;
  
  const recentCompletions = useMemo(() => {
    if (!userProgress?.completedModules) return [];
    // Sort by completion date descending and take top 3
    return [...userProgress.completedModules]
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 3);
  }, [userProgress]);


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96"><Loader className="w-8 h-8 animate-spin" /></div>
    );
  }

  const ClickableCard = ({ children, href, className }: { children: React.ReactNode, href?: string, className?: string }) => {
    const content = <Card className={cn("transition-all duration-200 ease-in-out h-full", href && "hover:shadow-lg hover:border-primary/50", className)}>{children}</Card>;
    if (href) {
        return <Link href={href} className="block group h-full">{content}</Link>;
    }
    return content;
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-start">
         <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName || 'User'}!</h1>
            <p className="text-muted-foreground">Your personal cybersecurity learning dashboard.</p>
         </div>
         <Button><Bell className="mr-2 h-4 w-4" />View Notifications</Button>
       </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric: any) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Required Training */}
            <div className="lg:col-span-2">
                <ClickableCard href='/training/quizzes'>
                    <CardHeader>
                        <CardTitle className='font-headline'>Required Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center text-muted-foreground py-10">
                            <p>You have no required training at the moment.</p>
                            <p className="text-sm">Assigned training will appear here.</p>
                        </div>
                    </CardContent>
                </ClickableCard>
            </div>
            
            <div className="space-y-6">
                {/* Recent Certificates */}
                <ClickableCard href='/certificates'>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><FileText className="text-primary"/>Recent Certificates</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <ul className="space-y-2 text-sm">
                            {recentCompletions.map(cert => (
                                <li key={cert.moduleId} className="flex justify-between items-center hover:bg-muted p-2 rounded-md">
                                    <span>{cert.moduleId}</span>
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/certificates">Download</Link>
                                    </Button>
                                </li>
                            ))}
                             {(!recentCompletions || recentCompletions.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-4">No certificates earned yet.</p>
                            )}
                        </ul>
                    </CardContent>
                </ClickableCard>
            </div>
        </div>
    </div>
  );
}

export default function MyTrainingPage() {
    return (
      <ProtectedRoute>
        <UserTrainingDashboard />
      </ProtectedRoute>
    );
}
