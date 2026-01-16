
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, Building, MoreVertical, Eye, Check, X, Archive, Star, MessageSquare, Briefcase, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AddNoteDialog } from '@/components/admin/partner-add-note-dialog';
import { useToast } from '@/hooks/use-toast';

export type Note = {
    text: string;
    authorName: string;
    createdAt: string;
};

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
    status: 'new' | 'contacted' | 'closed' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    requestedAt: string;
    notes?: Note[];
};

const statusVariant: Record<PartnerRequest['status'], 'secondary' | 'outline' | 'default' | 'destructive'> = {
  new: 'secondary',
  contacted: 'outline',
  closed: 'default',
  archived: 'destructive'
};

const priorityVariant: Record<string, 'secondary' | 'outline' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'destructive',
};

const PriorityIcon = ({priority}: {priority?: PartnerRequest['priority']}) => {
    if (priority === 'high') return <Star className="h-4 w-4 text-destructive fill-destructive" />;
    if (priority === 'medium') return <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
    return <Star className="h-4 w-4 text-muted" />;
}


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
                <div className="space-y-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="font-semibold">Contact Person</p><p className="text-muted-foreground">{request.contactPersonName} ({request.contactPersonTitle})</p></div>
                        <div><p className="font-semibold">Industry</p><p className="text-muted-foreground">{request.industry}</p></div>
                        <div><p className="font-semibold">Email</p><p className="text-muted-foreground">{request.email}</p></div>
                        <div><p className="font-semibold">Phone</p><p className="text-muted-foreground">{request.phone}</p></div>
                        <div><p className="font-semibold">Country</p><p className="text-muted-foreground">{request.country}</p></div>
                         <div><p className="font-semibold">Status</p><p><Badge variant={statusVariant[request.status]}>{request.status}</Badge></p></div>
                         <div><p className="font-semibold">Priority</p><p><Badge variant={priorityVariant[request.priority || 'low']}>{request.priority || 'low'}</Badge></p></div>
                    </div>
                    {request.message && (
                        <div>
                            <p className="font-semibold">Message</p>
                            <blockquote className="mt-1 border-l-2 pl-6 italic text-muted-foreground">
                                {request.message}
                            </blockquote>
                        </div>
                    )}
                     {request.notes && request.notes.length > 0 && (
                        <div>
                            <p className="font-semibold">Internal Notes</p>
                            <div className="space-y-2 mt-2">
                            {request.notes.map((note, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-xs text-muted-foreground">&quot;{note.text}&quot;</p>
                                    <p className="text-xs text-right mt-2 font-semibold"> - {note.authorName} on {format(new Date(note.createdAt), 'MMM d, yyyy')}</p>
                                </div>
                            ))}
                            </div>
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
    const [partnerForNote, setPartnerForNote] = useState<PartnerRequest | null>(null);
    const [partnerToConvert, setPartnerToConvert] = useState<PartnerRequest | null>(null);

    const firestore = useFirestore();
    const { toast } = useToast();

    const partnersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'partner_requests'), orderBy('requestedAt', 'desc')) : null, [firestore]);
    const { data: partners, isLoading } = useCollection<PartnerRequest>(partnersQuery);

    const handleUpdateStatus = (partnerId: string, status: PartnerRequest['status']) => {
        if (!firestore) return;
        const partnerDocRef = doc(firestore, 'partner_requests', partnerId);
        updateDocumentNonBlocking(partnerDocRef, { status });
    };

    const handleUpdatePriority = (partnerId: string, priority: PartnerRequest['priority']) => {
        if (!firestore) return;
        const partnerDocRef = doc(firestore, 'partner_requests', partnerId);
        updateDocumentNonBlocking(partnerDocRef, { priority });
    };

    const handleConvertToTenant = async () => {
        if (!firestore || !partnerToConvert) return;
        
        const newTenant = {
            name: partnerToConvert.companyName,
            region: partnerToConvert.country,
            status: 'trial',
            contact: {
                adminEmail: partnerToConvert.email,
                phone: partnerToConvert.phone,
            },
            createdAt: new Date().toISOString(),
        };

        try {
            await addDocumentNonBlocking(collection(firestore, 'tenants'), newTenant);
            
            // Mark partner as closed
            const partnerDocRef = doc(firestore, 'partner_requests', partnerToConvert.id);
            updateDocumentNonBlocking(partnerDocRef, { status: 'closed' });

            toast({
                title: 'Partner Converted',
                description: `${partnerToConvert.companyName} has been successfully converted to a tenant.`
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Conversion Failed',
                description: 'Could not convert partner to tenant. Please try again.'
            });
        } finally {
            setPartnerToConvert(null);
        }
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
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-center">Notes</TableHead>
                                    <TableHead>Requested On</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map(partner => (
                                    <TableRow key={partner.id} className={partner.status === 'archived' ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium">{partner.companyName}</TableCell>
                                        <TableCell>
                                            <div>{partner.contactPersonName}</div>
                                            <div className="text-xs text-muted-foreground">{partner.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[partner.status]}>{partner.status}</Badge>
                                        </TableCell>
                                         <TableCell>
                                            <Badge variant={priorityVariant[partner.priority || 'low']} className="capitalize">
                                                {partner.priority || 'low'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{partner.notes?.length || 0}</TableCell>
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
                                                    <DropdownMenuItem onSelect={() => setPartnerForNote(partner)}>
                                                        <MessageSquare className="mr-2 h-4 w-4" /> Add Note
                                                    </DropdownMenuItem>
                                                     <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger><Star className="mr-2 h-4 w-4" /> Set Priority</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onSelect={() => handleUpdatePriority(partner.id, 'low')}>Low</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleUpdatePriority(partner.id, 'medium')}>Medium</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleUpdatePriority(partner.id, 'high')}>High</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => handleUpdateStatus(partner.id, 'contacted')}>
                                                        <Check className="mr-2 h-4 w-4" /> Mark as Contacted
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(partner.id, 'closed')}>
                                                        <X className="mr-2 h-4 w-4" /> Mark as Closed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleUpdateStatus(partner.id, 'archived')}>
                                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                     <DropdownMenuItem onSelect={() => setPartnerToConvert(partner)} className="text-green-600 focus:text-green-600">
                                                        <Briefcase className="mr-2 h-4 w-4" /> Convert to Tenant
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

            <AddNoteDialog
                isOpen={!!partnerForNote}
                onOpenChange={(isOpen) => !isOpen && setPartnerForNote(null)}
                partner={partnerForNote}
            />

            {partnerToConvert && (
                <AlertDialog open={!!partnerToConvert} onOpenChange={() => setPartnerToConvert(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Convert Partner to Tenant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a new tenant account for <span className="font-bold">{partnerToConvert.companyName}</span> with a 'trial' status. The original partner request will be marked as 'closed'. Are you sure?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConvertToTenant}>
                            Convert
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}

    