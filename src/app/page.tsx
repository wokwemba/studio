'use client';

import { useUser } from '@/firebase';
import { MetricCard } from '@/components/dashboard/metric-card';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { metrics } from '@/app/data';
import { Loader, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RiskTrendChart />
        </div>
        <div className="lg:col-span-2">
           <AiInsights />
        </div>
      </div>
      <LeaderboardTable />
    </div>
  );
}

function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
            <ShieldCheck className="w-24 h-24 text-primary mb-4" />
            <h1 className="text-5xl font-bold font-headline mb-4">Welcome to CyberAegis</h1>
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
