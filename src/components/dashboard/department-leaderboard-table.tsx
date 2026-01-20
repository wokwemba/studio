
'use client';

import { useMemo } from 'react';
import { Loader } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

type UserProfile = {
    id: string;
    department?: string;
    risk: 'Low' | 'Medium' | 'High';
    trainingStats?: {
        completedModules?: number;
        totalModules?: number;
        complianceScore?: number;
    };
    phishingStats?: {
        reported?: number;
    };
};

const riskScoreMap: Record<UserProfile['risk'], number> = { 'High': 20, 'Medium': 50, 'Low': 100 };

const headersMap: Record<string, string> = {
    'risk-score': 'Average Risk Score',
    'training-completion': 'Avg Completion Rate',
    'phishing-reported': 'Total Phishing Reports',
    'compliance-score': 'Avg Compliance Score',
};

export function DepartmentLeaderboardChart({ category }: { category: string }) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const tenantId = (currentUser as any)?.tenantId;
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(collection(firestore, 'users'), where('tenantId', '==', tenantId));
  }, [firestore, tenantId]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery, { skip: !usersQuery });

  const leaderboardData = useMemo(() => {
    if (!users) return [];
    
    const departments: Record<string, { users: UserProfile[], userCount: number }> = {};
    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      if (!departments[dept]) {
        departments[dept] = { users: [], userCount: 0 };
      }
      departments[dept].users.push(user);
      departments[dept].userCount++;
    });

    const calculated = Object.entries(departments).map(([name, data]) => {
      let score = 0;
      if (data.userCount > 0) {
        switch (category) {
            case 'risk-score':
                score = data.users.reduce((acc, u) => acc + (riskScoreMap[u.risk] || 0), 0) / data.userCount;
                break;
            case 'training-completion':
                const totalRate = data.users.reduce((acc, u) => {
                    const completed = u.trainingStats?.completedModules || 0;
                    const total = u.trainingStats?.totalModules || 1;
                    return acc + (total > 0 ? (completed / total) * 100 : 0);
                }, 0);
                score = totalRate / data.userCount;
                break;
            case 'phishing-reported':
                score = data.users.reduce((acc, u) => acc + (u.phishingStats?.reported || 0), 0);
                break;
            case 'compliance-score':
                score = data.users.reduce((acc, u) => acc + (u.trainingStats?.complianceScore || 0), 0) / data.userCount;
                break;
            default:
                score = 0;
        }
      }
      return { name, score };
    });

    return calculated.sort((a, b) => a.score - b.score);

  }, [users, category]);
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (!leaderboardData || leaderboardData.length === 0) {
     return <div className="text-center text-muted-foreground py-16">No data available for this leaderboard.</div>
  }

  const categoryTitle = headersMap[category] || 'Department Performance';
  const isPercentage = category.includes('score') || category.includes('completion');

  return (
    <Card>
    <CardHeader>
        <CardTitle>{categoryTitle}</CardTitle>
        <CardDescription>Comparing departments based on the selected metric.</CardDescription>
    </CardHeader>
    <CardContent>
         <ResponsiveContainer width="100%" height={leaderboardData.length * 50}>
            <BarChart data={leaderboardData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} interval={0} />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => [`${value.toFixed(isPercentage ? 0 : 0)}${isPercentage ? '%' : ''}`, categoryTitle]}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={25} />
            </BarChart>
        </ResponsiveContainer>
    </CardContent>
    </Card>
  );
}
