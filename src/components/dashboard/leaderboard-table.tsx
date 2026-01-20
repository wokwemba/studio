
'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader, Crown, Medal, Gem } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { collection, query, where } from "firebase/firestore";
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

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

const headersMap: Record<string, string> = {
      'risk-score': 'Overall Risk Score',
      'training-completion': 'Training Completion',
      'quiz-score': 'Average Quiz Score',
      'compliance-score': 'Compliance Score',
      'phishing-reported': 'Phishing Reports Filed',
      'challenges-completed': 'Challenges Completed',
};

const PodiumCard = ({ user, rank }: { user: any; rank: number }) => {
    const podiumStyles = [
        { icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/50" },
        { icon: Medal, color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/50" },
        { icon: Gem, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/50" },
    ];
    const style = podiumStyles[rank - 1];
    const Icon = style.icon;

    return (
        <div className={cn("relative rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 h-full", style.bg)}>
            <div className="absolute top-2 right-2 p-2 rounded-full bg-background/50">
                <Icon className={cn("w-6 h-6", style.color)} />
            </div>
            <p className={cn("text-4xl font-bold font-headline", style.color)}>{rank}</p>
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                 <AvatarImage src={user.photoURL || PlaceHolderImages.find((p: any) => p.id === (user.avatarId || 'user-avatar-1'))?.imageUrl || ''} alt={user.name} data-ai-hint="person avatar" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{user.name}</p>
            <p className="text-2xl font-bold">{user.score.toFixed(0)}</p>
        </div>
    );
};


export function IndividualLeaderboard({ category }: { category: string }) {
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
            const rate = (total > 0) ? (completed / total) * 100 : 0;
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
              return <><span className="font-mono text-lg">{user.score}</span> <Badge variant={riskBadgeVariant[user.risk]}>{user.risk}</Badge></>;
          case 'training-completion':
              return <div className="flex items-center justify-end gap-2"><Progress value={user.score} className="w-24" /> <span className="font-mono text-xs w-12 text-left">{user.score.toFixed(0)}%</span></div>;
          case 'quiz-score':
          case 'compliance-score':
              return <span className="font-mono text-lg">{user.score.toFixed(0)}%</span>;
          case 'phishing-reported':
          case 'challenges-completed':
              return <span className="font-mono text-lg">{user.score}</span>;
          default:
              return <span className="font-mono text-lg">{user.score}</span>;
      }
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (!leaderboardData || leaderboardData.length === 0) {
     return <div className="text-center text-muted-foreground py-16">No data available for this leaderboard.</div>
  }

  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <Card>
    <CardHeader>
        <CardTitle>{headersMap[category] || 'Leaderboard'}</CardTitle>
        <CardDescription>Top performers for the selected category.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
        {topThree.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {topThree.map((user, index) => (
                <PodiumCard key={user.id} user={user} rank={index+1} />
            ))}
        </div>}
        {rest.length > 0 && (
            <div>
                 <h3 className="text-lg font-headline mb-4">Ranks 4 - 20</h3>
                <Table>
                    <TableBody>
                        {rest.slice(0,17).map((user, index) => (
                            <TableRow key={user.id} className={cn(currentUser?.uid === user.id && "bg-accent")}>
                                <TableCell className="font-medium text-lg text-muted-foreground w-12">{index + 4}</TableCell>
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
            </div>
        )}
    </CardContent>
    </Card>
  );
}
