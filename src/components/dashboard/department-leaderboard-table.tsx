
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Users } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";

type User = {
    id: string;
    department?: string;
    risk: 'Low' | 'Medium' | 'High';
};

const riskScore: Record<User['risk'], number> = {
    'High': 20,
    'Medium': 50,
    'Low': 100,
};

type DepartmentScore = {
    name: string;
    userCount: number;
    averageScore: number;
};

export function DepartmentLeaderboardTable() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const tenantId = (currentUser as any)?.tenantId;
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return query(
        collection(firestore, 'users'), 
        where('tenantId', '==', tenantId)
    );
  }, [firestore, tenantId]);

  const { data: users, isLoading } = useCollection<User>(usersQuery, { skip: !usersQuery });

  const departmentScores = useMemo((): DepartmentScore[] => {
    if (!users) return [];

    const departments: Record<string, { totalScore: number, userCount: number }> = {};

    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      if (!departments[dept]) {
        departments[dept] = { totalScore: 0, userCount: 0 };
      }
      departments[dept].totalScore += riskScore[user.risk] || 0;
      departments[dept].userCount += 1;
    });

    const scores = Object.entries(departments).map(([name, data]) => ({
      name,
      userCount: data.userCount,
      averageScore: data.totalScore / data.userCount,
    }));
    
    return scores.sort((a, b) => b.averageScore - a.averageScore);

  }, [users]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Department Leaderboard</CardTitle>
        <CardDescription>
          See how departments rank based on their average user risk score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        ) : !departmentScores || departmentScores.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
            No department data available for the leaderboard.
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Users</TableHead>
              <TableHead className="text-right">Average Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentScores.map((dept, index) => (
              <TableRow key={dept.name}>
                <TableCell className="font-medium text-lg font-headline">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell className="text-center">{dept.userCount}</TableCell>
                <TableCell className="text-right font-mono">{dept.averageScore.toFixed(0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
