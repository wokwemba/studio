'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AiInsights } from '@/components/dashboard/ai-insights';

export default function AdminPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Welcome to the admin panel. Here you can manage users, campaigns, and system settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is the main dashboard for administrators. Use the navigation above to access different sections.</p>
                </CardContent>
            </Card>
        </div>
        <AiInsights />
    </div>
  );
}
