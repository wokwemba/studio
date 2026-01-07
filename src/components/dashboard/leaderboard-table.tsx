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
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { leaderboardData, type LeaderboardUser } from "@/app/data";
import { cn } from "@/lib/utils";

const trendIcons = {
  up: <ArrowUp className="h-4 w-4 text-success" />,
  down: <ArrowDown className="h-4 w-4 text-destructive" />,
  same: <Minus className="h-4 w-4 text-muted-foreground" />,
};

const riskBadgeVariant: Record<
  LeaderboardUser["risk"],
  "success" | "outline" | "destructive"
> = {
  Low: "success",
  Med: "outline",
  High: "destructive",
};

export function LeaderboardTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Leaderboard</CardTitle>
        <CardDescription>
          See how you rank against your colleagues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-center">Risk</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow
                key={entry.rank}
                className={cn(entry.user.isCurrentUser && "bg-accent/50")}
              >
                <TableCell className="font-medium text-lg font-headline">
                  {entry.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={entry.user.avatarUrl}
                        alt={entry.user.name}
                        data-ai-hint="person avatar"
                      />
                      <AvatarFallback>
                        {entry.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{entry.score}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={riskBadgeVariant[entry.risk]}>{entry.risk}</Badge>
                </TableCell>
                <TableCell className="flex justify-end pt-5">
                  {trendIcons[entry.trend]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
