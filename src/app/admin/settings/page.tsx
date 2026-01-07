'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure global platform settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>System settings interface will be here.</p>
      </CardContent>
    </Card>
  );
}
