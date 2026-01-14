'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { Loader, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UserData = {
  risk: 'Low' | 'Medium' | 'High';
  trainingResults?: any[]; // Simplified for this example
  name?: string;
  email?: string;
  tenantId?: string;
}

function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
            <ShieldCheck className="w-24 h-24 text-primary mb-4" />
            <h1 className="text-5xl font-bold font-headline mb-4">Welcome to CyberAegis AI</h1>
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

  // This is now a public landing page. Authenticated users are redirected
  // by the layout component.
  return <LandingPage />;
}
