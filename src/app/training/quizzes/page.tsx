'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListTodo, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function QuizzesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            Upcoming Quizzes & Simulations
          </CardTitle>
          <CardDescription>
            These are your scheduled assessments. Required items should be completed by their due date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-16">
            <p>No upcoming quizzes or simulations found.</p>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Incomplete Quizzes
          </CardTitle>
          <CardDescription>
            You started these quizzes but haven't finished them yet. Pick up where you left off!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground py-16">
                <p>You have no incomplete quizzes.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
