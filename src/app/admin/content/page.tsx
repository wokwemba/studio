
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader, BookCopy, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type TrainingModule = {
    id: string;
    title: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    aiAdaptive?: boolean;
};

const difficultyVariant: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  easy: 'secondary',
  medium: 'outline',
  hard: 'destructive',
};

export default function AdminContentPage() {
    const firestore = useFirestore();

    const modulesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'trainingModules'), orderBy('category')) : null,
        [firestore]
    );
    const { data: modules, isLoading } = useCollection<TrainingModule>(modulesQuery);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <BookCopy />
            <span>Global Content Library</span>
        </CardTitle>
        <CardDescription>Manage all training modules available on the platform. This is a global view for Super Admins.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
        ) : !modules || modules.length === 0 ? (
             <div className="text-center text-muted-foreground py-16">
                <p>No training modules found in the global library.</p>
                 <p className="text-sm">Use the AI Training Module Generator to create new content.</p>
            </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Duration (min)</TableHead>
                         <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {modules.map(module => (
                        <TableRow key={module.id}>
                            <TableCell className="font-medium">{module.title}</TableCell>
                            <TableCell>{module.category}</TableCell>
                            <TableCell>
                                <Badge variant={difficultyVariant[module.difficulty] || 'secondary'}>
                                    {module.difficulty}
                                </Badge>
                            </TableCell>
                            <TableCell>{module.duration}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit Module</DropdownMenuItem>
                                        <DropdownMenuItem>Assign to Tiers</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete Module</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
