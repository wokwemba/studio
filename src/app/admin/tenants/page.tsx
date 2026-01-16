
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, PlusCircle, Building, Edit } from 'lucide-react';
import { AddTenantDialog } from '@/components/admin/add-tenant-dialog';
import { Badge } from '@/components/ui/badge';
import { EditTenantDialog } from '@/components/admin/edit-tenant-dialog';

export type Tenant = {
    id: string;
    name: string;
    region: string;
    status: 'active' | 'suspended' | 'trial';
};

const statusVariant: Record<Tenant['status'], 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  trial: 'secondary',
  suspended: 'destructive',
};

export default function AdminTenantsPage() {
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
    const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);
    const firestore = useFirestore();

    const tenantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tenants') : null, [firestore]);
    const { data: tenants, isLoading } = useCollection<Tenant>(tenantsQuery);

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Building />
                            <span>Manage Tenants</span>
                        </CardTitle>
                        <CardDescription>View, add, and manage all corporate tenants on the platform.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddTenantOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Tenant ID</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants?.map(tenant => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">{tenant.name}</TableCell>
                                    <TableCell><Badge variant={statusVariant[tenant.status]}>{tenant.status}</Badge></TableCell>
                                    <TableCell>{tenant.region}</TableCell>
                                    <TableCell className="font-mono text-xs">{tenant.id}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => setTenantToEdit(tenant)}>
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit Tenant</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setIsAddTenantOpen} />

        {tenantToEdit && (
            <EditTenantDialog 
                isOpen={!!tenantToEdit}
                onOpenChange={(isOpen) => {
                    if(!isOpen) setTenantToEdit(null)
                }}
                tenant={tenantToEdit}
            />
        )}
        </>
    );
}

    
