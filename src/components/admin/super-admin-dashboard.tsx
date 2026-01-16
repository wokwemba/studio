
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Building, Users, Activity, BarChart, Calendar, MessageSquare, AlertTriangle, ShieldCheck, ShieldClose, ShieldQuestion } from 'lucide-react';
import type { Tenant } from '@/app/admin/tenants/page';
import type { UserProfile } from '@/app/admin/users/page';
import { Badge } from '../ui/badge';
import Link from 'next/link';

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
    high: <ShieldCheck className="h-5 w-5 text-success" />,
    medium: <ShieldQuestion className="h-5 w-5 text-yellow-500" />,
    low: <AlertTriangle className="h-5 w-5 text-destructive" />,
};

// Placeholder data
const tenantHealthData = [
    { name: 'Safaricom PLC', region: 'Africa', compliance: 92, status: 'high' },
    { name: 'TechCorp', region: 'North America', compliance: 88, status: 'high' },
    { name: 'GlobalBank', region: 'Europe', compliance: 65, status: 'medium' },
    { name: 'StartupXYZ', region: 'Asia', compliance: 42, status: 'low' },
];

const complianceCalendarData = [
    { date: 'Oct 15', event: 'PCI DSS Training Due', tenants: 5 },
    { date: 'Oct 31', event: 'GDPR Refresher Due', tenants: 8 },
    { date: 'Nov 15', event: 'Phishing Simulation', tenants: 'All' },
];

const recentActivityData = [
    { text: 'Tenant "Safaricom PLC" added 50 new users' },
    { text: '3 tenants renewed Enterprise subscription' },
    { text: 'New training module "AI Security" published' },
    { text: 'Critical vulnerability alert sent to all admins' },
];

export function SuperAdminDashboard() {
  const firestore = useFirestore();

  const tenantsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'tenants')) : null, [firestore]);
  const { data: tenants, isLoading: tenantsLoading } = useCollection<Tenant>(tenantsQuery);
  
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const isLoading = tenantsLoading || usersLoading;

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
        <SuperAdminMetricCard title="Completion Rate" value="78%" icon={BarChart} />
        <SuperAdminMetricCard title="Satisfaction" value="92%" icon={Activity} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Tenant Health</CardTitle>
                <CardDescription>Overview of tenant compliance and activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {tenantHealthData.map(tenant => (
                        <li key={tenant.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {complianceIcons[tenant.status]}
                                <div>
                                    <p className="font-semibold">{tenant.name} <span className="text-xs text-muted-foreground">({tenant.region})</span></p>
                                    <p className="text-sm">Compliance: {tenant.compliance}%</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild><Link href="/admin/partners">View</Link></Button>
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
                    <CardDescription>Upcoming global deadlines and events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {complianceCalendarData.map(item => (
                            <li key={item.event} className="flex items-center gap-4">
                                <Badge variant="secondary" className="w-16 justify-center">{item.date}</Badge>
                                <div>
                                    <p className="font-medium text-sm">{item.event}</p>
                                    <p className="text-xs text-muted-foreground">{item.tenants} tenants</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {recentActivityData.map(item => (
                            <li key={item.text} className="flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                <p className="text-sm text-muted-foreground">{item.text}</p>
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


