
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader, FlaskConical, MoreHorizontal, Check, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type Simulation = {
    type: string;
    details: string;
}

type SimulationRequest = {
    id: string;
    userId: string;
    userName: string;
    simulations: Simulation[];
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    requestedAt: string; // ISO Date string
}

const statusVariant: Record<SimulationRequest['status'], 'secondary' | 'outline' | 'success' | 'destructive'> = {
  Pending: 'secondary',
  'In Progress': 'outline',
  Completed: 'success',
  Cancelled: 'destructive',
};

const statusIcon: Record<SimulationRequest['status'], React.ReactNode> = {
    Pending: <Clock className="h-3 w-3" />,
    'In Progress': <Loader className="h-3 w-3 animate-spin" />,
    Completed: <Check className="h-3 w-3" />,
    Cancelled: <XCircle className="h-3 w-3" />,
};

export default function AdminSimulationsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const tenantId = (user as any)?.tenantId;

    const simulationRequestsQuery = useMemoFirebase(
        () => (firestore && tenantId) 
            ? query(
                collection(firestore, `tenants/${tenantId}/simulationRequests`), 
                orderBy('requestedAt', 'desc')
              ) 
            : null,
        [firestore, tenantId]
    );
    const { data: requests, isLoading } = useCollection<SimulationRequest>(simulationRequestsQuery);

    return (
        <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
            <FlaskConical />
            <span>Simulation Requests</span>
            </CardTitle>
            <CardDescription>
            Review and manage simulation requests submitted by users in your tenant.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="w-8 h-8 animate-spin" />
                </div>
            ) : !requests || requests.length === 0 ? (
                 <div className="text-center text-muted-foreground py-16">
                    <p>No simulation requests found.</p>
                    <p className="text-sm">When users request simulations, they will appear here.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead># of Sims</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.userName}</TableCell>
                                <TableCell>{format(new Date(req.requestedAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell className="text-center">{req.simulations.length}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[req.status]}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Set to 'In Progress'</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
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

// Add XCircle icon for the status map
const XCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );

