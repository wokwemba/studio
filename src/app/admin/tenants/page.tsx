'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, PlusCircle, Building } from 'lucide-react';
import { AddTenantDialog } from '@/components/admin/add-tenant-dialog';

export type Tenant = {
    id: string;
    name: string;
    region: string;
};

export default function AdminTenantsPage() {
    const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
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
                            <TableHead>Region</TableHead>
                            <TableHead>Tenant ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants?.map(tenant => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">{tenant.name}</TableCell>
                                    <TableCell>{tenant.region}</TableCell>
                                    <TableCell className="font-mono text-xs">{tenant.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setIsAddTenantOpen} />
        </>
    );
}
