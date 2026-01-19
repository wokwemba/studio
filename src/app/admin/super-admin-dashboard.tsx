
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Building, Users, Activity, BarChart, Calendar, MessageSquare, AlertTriangle, ShieldCheck, ShieldClose, ShieldQuestion } from 'lucide-react';
import type { Tenant } from '@/app/admin/tenants/page';
import type { UserProfile } from '@/app/admin/users/page';
import type { AuditLog } from '@/docs/backend-schema';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, BarChart as RechartsBarChart, LineChart } from 'recharts';


function SuperAdminMetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
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

const complianceIcons: Record<string, React.ReactElement> = {
    active: <ShieldCheck className="h-5 w-5 text-success" />,
    trial: <ShieldQuestion className="h-5 w-5 text-yellow-500" />,
    suspended: <ShieldClose className="h-5 w-5 text-destructive" />,
};

const popularModulesData = [
  { name: 'Phishing 101', assignments: 5200, fill: 'hsl(var(--chart-1))' },
  { name: 'Password Security', assignments: 4100, fill: 'hsl(var(--chart-2))' },
  { name: 'Social Engineering', assignments: 3500, fill: 'hsl(var(--chart-3))' },
  { name: 'GDPR Basics', assignments: 2800, fill: 'hsl(var(--chart-4))' },
];


export function SuperAdminDashboard() {
  const firestore = useFirestore();

  const tenantsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'tenants')) : null, [firestore]);
  const { data: tenants, isLoading: tenantsLoading } = useCollection<Tenant>(tenantsQuery);
  
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const auditLogsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'audit_logs'), orderBy('timestamp', 'desc'), limit(4)) : null, [firestore]);
  const { data: auditLogs, isLoading: auditLogsLoading } = useCollection<AuditLog>(auditLogsQuery);


  const isLoading = tenantsLoading || usersLoading || auditLogsLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Super Admin Dashboard</CardTitle>
                <CardDescription>Platform-wide overview and management tools.</CardDescription>
            </CardHeader>
        </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SuperAdminMetricCard title="Total Tenants" value={tenants?.length ?? 0} icon={Building} />
        <SuperAdminMetricCard title="Total Users" value={users?.length ?? 0} icon={Users} />
        <SuperAdminMetricCard title="Avg. Completion" value="N/A" icon={BarChart} />
        <SuperAdminMetricCard title="Recent Signups (7d)" value="N/A" icon={Activity} />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>A summary of platform entities.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Live growth chart coming soon. This requires historical data snapshots.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Modules</CardTitle>
          </CardHeader>
           <CardContent>
            <p>Popular modules chart coming soon. This requires aggregation of assignment data.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Tenant Health</CardTitle>
                <CardDescription>Overview of tenant status and activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {tenants?.map(tenant => (
                        <li key={tenant.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {complianceIcons[tenant.status]}
                                <div>
                                    <p className="font-semibold">{tenant.name} <span className="text-xs text-muted-foreground">({tenant.region})</span></p>
                                    <p className="text-sm capitalize">{tenant.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild><Link href="/admin/tenants">View</Link></Button>
                                <Button variant="secondary" size="sm"><MessageSquare className="h-4 w-4" /></Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">Compliance calendar coming soon.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {auditLogs?.map(log => (
                            <li key={log.id} className="flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{log.actorEmail || 'System'}</span> performed action <Badge variant="secondary">{log.action}</Badge>
                                </p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
