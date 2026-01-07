'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminUsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users &amp; Roles</CardTitle>
        <CardDescription>Manage users, roles, and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>User management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
