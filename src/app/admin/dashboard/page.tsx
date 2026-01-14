
'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { type UserProfile, type Role } from '@/app/admin/users/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Users, UserCheck, UserPlus, UserCog } from 'lucide-react';
import { AiInsights } from '@/components/dashboard/ai-insights';

function AdminMetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const tenantId = (currentUser as any)?.tenantId;

  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const rolesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'roles') : null, [firestore]);
  const { data: roles, isLoading: rolesLoading } = useCollection<Role>(rolesQuery);

  const isLoading = usersLoading || rolesLoading;

  const userMetrics = useMemo(() => {
    if (!users || !roles) return null;

    const rolesCount = users.reduce((acc, user) => {
      const roleName = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      invited: users.filter(u => u.status === 'Invited').length,
      admins: rolesCount['Admin'] || 0,
    };
  }, [users, roles]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard title="Total Users" value={userMetrics?.total ?? 0} icon={Users} />
        <AdminMetricCard title="Active Users" value={userMetrics?.active ?? 0} icon={UserCheck} />
        <AdminMetricCard title="Invited Users" value={userMetrics?.invited ?? 0} icon={UserPlus} />
        <AdminMetricCard title="Admins" value={userMetrics?.admins ?? 0} icon={UserCog} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Admin Panel</CardTitle>
                    <CardDescription>Here you can manage users, campaigns, and system settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is the main dashboard for administrators. Use the navigation above to access different sections.</p>
                </CardContent>
            </Card>
        </div>
        <AiInsights />
      </div>
    </div>
  );
}
