
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import type { User as AuthUser } from "firebase/auth";

type User = {
    id: string;
    name: string;
    email: string;
    risk: 'Low' | 'Medium' | 'High';
    avatarId?: string;
    tenantId: string;
};

const riskScore: Record<User['risk'], number> = {
    'High': 20,
    'Medium': 50,
    'Low': 100,
}

const riskBadgeVariant: Record<
  User["risk"],
  "success" | "outline" | "destructive"
> = {
  Low: "success",
  Medium: "outline",
  High: "destructive",
};

export function LeaderboardTable({ currentUser }: { currentUser: AuthUser & { tenantId?: string } | null }) {
  const firestore = useFirestore();
  
  // Only query for users within the same tenant.
  const usersQuery = useMemoFirebase(() => 
    (firestore && currentUser?.tenantId) ? query(
        collection(firestore, 'users'), 
        where('tenantId', '==', currentUser.tenantId),
        orderBy('risk', 'desc'), 
        limit(10)
    ) : null,
    [firestore, currentUser]
  );

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const getImage = (id?: string) => {
    if (!id) return PlaceHolderImages.find((p) => p.id === 'user-avatar-1')?.imageUrl || '';
    return PlaceHolderImages.find((p) => p.id === id)?.imageUrl || PlaceHolderImages.find((p) => p.id === 'user-avatar-1')?.imageUrl || '';
  }

  const sortedUsers = users?.sort((a, b) => riskScore[b.risk] - riskScore[a.risk]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Leaderboard</CardTitle>
        <CardDescription>
          See how you rank against colleagues in your organization based on risk score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-center">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers?.map((user, index) => (
              <TableRow
                key={user.id}
                className={cn(currentUser?.uid === user.id && "bg-accent/50")}
              >
                <TableCell className="font-medium text-lg font-headline">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getImage(user.avatarId)}
                        alt={user.name}
                        data-ai-hint="person avatar"
                      />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{currentUser?.uid === user.id ? 'You' : user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{riskScore[user.risk]}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={riskBadgeVariant[user.risk]}>{user.risk}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
