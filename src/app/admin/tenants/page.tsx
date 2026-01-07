'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTenantsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenants</CardTitle>
        <CardDescription>Manage tenants (Super Admin only).</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tenant management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
