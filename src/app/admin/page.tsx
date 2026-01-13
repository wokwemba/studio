'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>Welcome to the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main dashboard for administrators.</p>
      </CardContent>
    </Card>
  );
}
