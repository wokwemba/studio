'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { Loader, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { doc } from 'firebase/firestore';

type UserData = {
  risk: 'Low' | 'Medium' | 'High';
  trainingResults?: any[]; // Simplified for this example
  name?: string;
  email?: string;
  tenantId?: string;
}

function Dashboard() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const isDataLoading = isAuthLoading || isUserDataLoading;

  const metrics = [
    {
      label: 'Risk Score',
      value: userData?.risk || 'N/A',
      subValue: 'Current Risk Level',
    },
    {
      label: 'Training Completed',
      value: `${userData?.trainingResults?.length || 0} modules`,
      subValue: 'All time',
    },
    {
      label: 'Global Rank',
      value: 'N/A', // This would require a more complex query or pre-calculated ranks
      subValue: 'Coming soon',
    },
  ];

  if (isDataLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  // Enhance the user object with tenantId for the leaderboard
  const enhancedUser = user && userData?.tenantId ? { ...user, tenantId: userData.tenantId } : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <RiskTrendChart />
        </div>
        <div className="lg:col-span-1">
             {enhancedUser && <LeaderboardTable currentUser={enhancedUser} />}
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
            <ShieldCheck className="w-24 h-24 text-primary mb-4" />
            <h1 className="text-5xl font-bold font-headline mb-4">Welcome to Cyber-UP</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                The next-generation platform for AI-powered cybersecurity training, risk management, and compliance.
            </p>
            <div className="flex gap-4">
                <Button asChild size="lg">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    );
}

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}
