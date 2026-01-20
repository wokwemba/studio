
'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { collection, query, where } from "firebase/firestore";
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Augment UserProfile type locally for new stats
type UserProfile = {
    id: string;
    name: string;
    email: string;
    risk: 'Low' | 'Medium' | 'High';
    avatarId?: string;
    photoURL?: string;
    tenantId: string;
    trainingStats?: {
        completedModules?: number;
        totalModules?: number;
        avgScore?: number;
        complianceScore?: number;
    };
    phishingStats?: {
        simulatedReceived?: number;
        clicked?: number;
        reported?: number;
    };
    challengeStats?: {
        totalCompleted?: number;
        avgScore?: number;
    }
};


const riskScoreMap: Record<UserProfile['risk'], number> = { 'High': 20, 'Medium': 50, 'Low': 100 };
const riskBadgeVariant: Record<UserProfile["risk"], "success" | "outline" | "destructive"> = { Low: "success", Medium: "outline", High: "destructive" };

export function LeaderboardTable({ category }: { category: string }) {
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
    
    let processedUsers: any[] = users;

    switch (category) {
      case 'risk-score':
        processedUsers = users.map(u => ({ ...u, score: riskScoreMap[u.risk] || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);
      
      case 'training-completion':
        processedUsers = users.map(u => {
            const completed = u.trainingStats?.completedModules || 0;
            const total = u.trainingStats?.totalModules || 1; // Avoid division by zero
            const rate = (completed / total) * 100;
            return { ...u, score: rate, completed, total };
        });
        return processedUsers.sort((a, b) => b.score - a.score);

      case 'quiz-score':
        processedUsers = users.map(u => ({ ...u, score: u.trainingStats?.avgScore || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);

      case 'compliance-score':
        processedUsers = users.map(u => ({ ...u, score: u.trainingStats?.complianceScore || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);

      case 'phishing-reported':
        processedUsers = users.map(u => ({ ...u, score: u.phishingStats?.reported || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);
      
      case 'challenges-completed':
        processedUsers = users.map(u => ({ ...u, score: u.challengeStats?.totalCompleted || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);

      default:
        // Default to risk score
        processedUsers = users.map(u => ({ ...u, score: riskScoreMap[u.risk] || 0 }));
        return processedUsers.sort((a, b) => b.score - a.score);
    }
  }, [users, category]);
  
  const getImage = (user: UserProfile) => {
    return user.photoURL || PlaceHolderImages.find((p) => p.id === (user.avatarId || 'user-avatar-1'))?.imageUrl || '';
  }

  const renderValueCell = (user: any) => {
      switch (category) {
          case 'risk-score':
              return <><span className="font-mono">{user.score}</span> <Badge variant={riskBadgeVariant[user.risk]}>{user.risk}</Badge></>;
          case 'training-completion':
              return <div className="flex items-center justify-end gap-2"><Progress value={user.score} className="w-24" /> <span className="font-mono text-xs w-12 text-left">{user.score.toFixed(0)}%</span></div>;
          case 'quiz-score':
          case 'compliance-score':
              return <span className="font-mono">{user.score.toFixed(0)}%</span>;
          case 'phishing-reported':
          case 'challenges-completed':
              return <span className="font-mono">{user.score}</span>;
          default:
              return <span className="font-mono">{user.score}</span>;
      }
  }
  
  const headersMap: Record<string, string[]> = {
      'risk-score': ['Rank', 'User', 'Score / Risk'],
      'training-completion': ['Rank', 'User', 'Completion Rate'],
      'quiz-score': ['Rank', 'User', 'Average Score'],
      'compliance-score': ['Rank', 'User', 'Compliance Score'],
      'phishing-reported': ['Rank', 'User', 'Reports Filed'],
      'challenges-completed': ['Rank', 'User', 'Challenges Done'],
  };
  const headers = headersMap[category] || ['Rank', 'User', 'Value'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (!leaderboardData || leaderboardData.length === 0) {
     return <div className="text-center text-muted-foreground py-16">No data available for this leaderboard.</div>
  }

  return (
    <Card>
    <CardHeader>
        <CardTitle>{headersMap[category][2] || 'Leaderboard'}</CardTitle>
    </CardHeader>
    <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            {headers.map((header, i) => (
                <TableHead key={header} className={cn(
                    i === 0 && "w-[80px]",
                    i === headers.length - 1 && "text-right"
                )}>{header}</TableHead>
            ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {leaderboardData.slice(0, 20).map((user, index) => (
            <TableRow key={user.id} className={cn(currentUser?.uid === user.id && "bg-accent")}>
                <TableCell className="font-medium text-lg font-headline">{index + 1}</TableCell>
                <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={getImage(user)} alt={user.name} data-ai-hint="person avatar" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                    <span className="font-medium">{currentUser?.uid === user.id ? 'You' : user.name}</span>
                </div>
                </TableCell>
                <TableCell className="text-right">{renderValueCell(user)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </CardContent>
    </Card>
  );
}

    