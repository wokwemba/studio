'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminNotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure email and system notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Notification management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
