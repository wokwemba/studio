'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminContentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses &amp; Content</CardTitle>
        <CardDescription>Manage training modules and course content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
