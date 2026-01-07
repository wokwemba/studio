'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s training and security posture.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            System Administration
          </CardTitle>
          <CardDescription>
            Core platform settings and management tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The previous AI campaign generation has been replaced by a live,
            interactive AI tutor on the &quot;My Training&quot; page.
            This admin panel can be extended with new management features in the future.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
