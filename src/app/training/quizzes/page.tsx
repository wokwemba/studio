'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListTodo, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Placeholder data - in a real app, this would come from Firestore
const upcomingQuizzes = [
  { id: 'uq1', title: 'Q3 Phishing Simulation', dueDate: '2024-09-01', priority: 'Required', type: 'Simulation' },
  { id: 'uq2', title: 'Advanced Password Protection', dueDate: '2024-09-15', priority: 'Recommended', type: 'Quiz' },
  { id: 'uq3', title: 'Cloud Security Fundamentals', dueDate: '2024-10-01', priority: 'Required', type: 'Quiz' },
];

const incompleteQuizzes = [
  { id: 'iq1', module: 'Data Privacy Basics', completed: 50 },
  { id: 'iq2', module: 'Secure Wi-Fi Usage', completed: 25 },
  { id: 'iq3', module: 'Social Engineering Red Flags', completed: 75 },
];

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.type}</TableCell>
                  <TableCell>{quiz.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={quiz.priority === 'Required' ? 'destructive' : 'secondary'}>{quiz.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Start</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incompleteQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.module}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={quiz.completed} className="w-40" />
                      <span className="text-xs text-muted-foreground">{quiz.completed}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">Resume</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
