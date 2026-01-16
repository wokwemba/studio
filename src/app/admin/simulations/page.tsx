
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { Loader, ClipboardList, MoreVertical, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type SimulationRequest = {
    id: string;
    userId: string;
    userName: string;
    tenantId: string;
    simulations: {
        type: string;
        details: Record<string, any>;
    }[];
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    requestedAt: string;
};

const statusVariant: Record<SimulationRequest['status'], 'secondary' | 'outline' | 'success' | 'destructive'> = {
  Pending: 'secondary',
  'In Progress': 'outline',
  Completed: 'success',
  Cancelled: 'destructive',
};


function RequestDetailsDialog({ request, isOpen, onOpenChange }: { request: SimulationRequest, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!request) return null;
    
    const formatLabel = (key: string) => {
        if (!key) return '';
        const result = key.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Request from {request.userName}</DialogTitle>
                    <DialogDescription>
                        Submitted on {format(new Date(request.requestedAt), 'PPP p')}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                    <div className="space-y-6 my-4">
                        {request.simulations.map((sim, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle>{sim.type}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {Object.entries(sim.details).map(([key, value]) => (
                                            <div key={key} className="p-2 bg-muted/50 rounded-md">
                                                <dt className="font-semibold">{formatLabel(key)}</dt>
                                                <dd className="text-muted-foreground whitespace-pre-wrap break-words">
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No')
                                                     : Array.isArray(value) ? value.join(', ')
                                                     : (value || 'N/A')}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminSimulationsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const tenantId = (user as any)?.tenantId;
    const [requestToView, setRequestToView] = useState<SimulationRequest | null>(null);

    const requestsQuery = useMemoFirebase(
        () => (firestore && tenantId) ? query(collection(firestore, `tenants/${tenantId}/simulationRequests`), orderBy('requestedAt', 'desc')) : null,
        [firestore, tenantId]
    );

    const { data: requests, isLoading } = useCollection<SimulationRequest>(requestsQuery, { skip: !requestsQuery });

    const handleUpdateStatus = (request: SimulationRequest, status: SimulationRequest['status']) => {
        if (!firestore) return;
        const docRef = doc(firestore, `tenants/${request.tenantId}/simulationRequests`, request.id);
        updateDocumentNonBlocking(docRef, { status });
    }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span>Service Requests</span>
        </CardTitle>
        <CardDescription>Review, approve, and manage all user-submitted service and simulation requests.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
        ) : !requests || requests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
                <p>No service requests found.</p>
            </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Items Requested</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map(request => (
                        <TableRow key={request.id}>
                            <TableCell>{request.userName}</TableCell>
                            <TableCell>{request.simulations.length}</TableCell>
                            <TableCell>{format(new Date(request.requestedAt), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[request.status]}>{request.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setRequestToView(request)}>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleUpdateStatus(request, 'In Progress')}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleUpdateStatus(request, 'Cancelled')}>
                                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
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
    {requestToView && (
        <RequestDetailsDialog
            request={requestToView}
            isOpen={!!requestToView}
            onOpenChange={() => setRequestToView(null)}
        />
    )}
    </>
  );
}
