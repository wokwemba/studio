
'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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

export function DepartmentLeaderboardTable({ category }: { category: string }) {
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
                    const total = u.trainingStats?.totalModules || 1; // Avoid division by zero
                    return acc + (completed / total) * 100;
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
      return { name, userCount: data.userCount, score };
    });

    return calculated.sort((a, b) => b.score - a.score);

  }, [users, category]);
  
  const headersMap: Record<string, string[]> = {
      'risk-score': ['Rank', 'Department', 'Users', 'Average Score'],
      'training-completion': ['Rank', 'Department', 'Users', 'Avg Completion Rate'],
      'phishing-reported': ['Rank', 'Department', 'Users', 'Total Reports'],
      'compliance-score': ['Rank', 'Department', 'Users', 'Avg Compliance Score'],
  };
  const headers = headersMap[category] || ['Rank', 'Department', 'Users', 'Value'];
  
  const renderValueCell = (dept: any) => {
      switch (category) {
          case 'risk-score':
          case 'training-completion':
          case 'compliance-score':
              return <span className="font-mono">{dept.score.toFixed(0)}%</span>;
          default:
              return <span className="font-mono">{dept.score}</span>;
      }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (!leaderboardData || leaderboardData.length === 0) {
     return <div className="text-center text-muted-foreground py-16">No data available for this leaderboard.</div>
  }

  return (
    <Card>
    <CardHeader>
        <CardTitle>{headers[3] || headers[2]}</CardTitle>
    </CardHeader>
    <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            {headers.map((header, i) => (
                <TableHead key={header} className={i === 0 ? 'w-[80px]' : (i === headers.length - 1 ? 'text-right' : '')}>{header}</TableHead>
            ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {leaderboardData.map((dept, index) => (
            <TableRow key={dept.name}>
                <TableCell className="font-medium text-lg font-headline">{index + 1}</TableCell>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.userCount}</TableCell>
                <TableCell className="text-right">{renderValueCell(dept)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </CardContent>
    </Card>
  );
}

    