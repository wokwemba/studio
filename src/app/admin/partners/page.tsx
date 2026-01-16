
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, Building, MoreVertical, Eye, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type PartnerRequest = {
    id: string;
    companyName: string;
    industry: string;
    country: string;
    contactPersonName: string;
    contactPersonTitle: string;
    email: string;
    phone: string;
    message?: string;
    status: 'new' | 'contacted' | 'closed';
    requestedAt: string;
};

const statusVariant: Record<PartnerRequest['status'], 'secondary' | 'outline' | 'default'> = {
  new: 'secondary',
  contacted: 'outline',
  closed: 'default',
};

function PartnerDetailsDialog({ request, isOpen, onOpenChange }: { request: PartnerRequest | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{request.companyName}</DialogTitle>
                    <DialogDescription>
                        Partnership request from {request.contactPersonName} submitted on {format(new Date(request.requestedAt), 'PPP p')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="font-semibold">Contact Person</p><p className="text-muted-foreground">{request.contactPersonName} ({request.contactPersonTitle})</p></div>
                        <div><p className="font-semibold">Industry</p><p className="text-muted-foreground">{request.industry}</p></div>
                        <div><p className="font-semibold">Email</p><p className="text-muted-foreground">{request.email}</p></div>
                        <div><p className="font-semibold">Phone</p><p className="text-muted-foreground">{request.phone}</p></div>
                        <div><p className="font-semibold">Country</p><p className="text-muted-foreground">{request.country}</p></div>
                         <div><p className="font-semibold">Status</p><p><Badge variant={statusVariant[request.status]}>{request.status}</Badge></p></div>
                    </div>
                    {request.message && (
                        <div>
                            <p className="font-semibold">Message</p>
                            <blockquote className="mt-1 border-l-2 pl-6 italic text-muted-foreground">
                                {request.message}
                            </blockquote>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminPartnersPage() {
    const [partnerToView, setPartnerToView] = useState<PartnerRequest | null>(null);
    const firestore = useFirestore();

    const partnersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'partner_requests'), orderBy('requestedAt', 'desc')) : null, [firestore]);
    const { data: partners, isLoading } = useCollection<PartnerRequest>(partnersQuery);

    const handleUpdateStatus = (partnerId: string, status: PartnerRequest['status']) => {
        if (!firestore) return;
        const partnerDocRef = doc(firestore, 'partner_requests', partnerId);
        updateDocumentNonBlocking(partnerDocRef, { status });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Building />
                        <span>Manage Partners</span>
                    </CardTitle>
                    <CardDescription>Review and manage all incoming partnership requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
                    ) : !partners || partners.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No partnership requests found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested On</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map(partner => (
                                    <TableRow key={partner.id}>
                                        <TableCell className="font-medium">{partner.companyName}</TableCell>
                                        <TableCell>
                                            <div>{partner.contactPersonName}</div>
                                            <div className="text-xs text-muted-foreground">{partner.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[partner.status]}>{partner.status}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(partner.requestedAt), 'yyyy-MM-dd')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => setPartnerToView(partner)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleUpdateStatus(partner.id, 'contacted')}>
                                                        <Check className="mr-2 h-4 w-4" /> Mark as Contacted
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(partner.id, 'closed')}>
                                                        <X className="mr-2 h-4 w-4" /> Mark as Closed
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

            <PartnerDetailsDialog
                isOpen={!!partnerToView}
                onOpenChange={(isOpen) => !isOpen && setPartnerToView(null)}
                request={partnerToView}
            />
        </>
    );
}
