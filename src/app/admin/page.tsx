'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import { AiInsights } from '@/components/dashboard/ai-insights';

type Campaign = {
    id: string;
    title: string;
    type: 'phishing' | 'training' | 'fraud';
    status: 'draft' | 'active' | 'completed';
}

type Incident = {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_to: string;
}

const severityVariant: Record<Incident['severity'], 'destructive' | 'secondary' | 'outline' | 'default'> = {
    'high': 'destructive',
    'critical': 'destructive',
    'medium': 'secondary',
    'low': 'outline',
};

const statusVariant: Record<Incident['status'], 'destructive' | 'secondary' | 'outline' | 'default'> = {
    'open': 'destructive',
    'in_progress': 'secondary',
    'resolved': 'default',
    'closed': 'default',
};

export default function AdminPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: currentUserData } = useDoc<{ roleId: string; tenantId: string }>(userDocRef);
  const tenantId = currentUserData?.tenantId;

  const userRoleDocRef = useMemoFirebase(
    () => (firestore && currentUserData?.roleId ? doc(firestore, 'roles', currentUserData.roleId) : null),
    [firestore, currentUserData]
  );
  const { data: roleData } = useDoc<{ name: 'User' | 'Admin' | 'SuperAdmin' }>(userRoleDocRef);

  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin';
  
  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId && userIsAdmin) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null, 
    [firestore, tenantId, userIsAdmin]
  );
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery, { skip: !userIsAdmin });
  
  const highRiskUsersQuery = useMemoFirebase(
    () => (firestore && tenantId && userIsAdmin) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId), where('risk', '==', 'High')) : null, 
    [firestore, tenantId, userIsAdmin]
  );
  const { data: highRiskUsers, isLoading: highRiskUsersLoading } = useCollection(highRiskUsersQuery, { skip: !userIsAdmin });

  const campaignsQuery = useMemoFirebase(() => (firestore && tenantId) ? query(collection(firestore, `tenants/${tenantId}/campaigns`)) : null, [firestore, tenantId]);
  const { data: activeCampaigns, isLoading: campaignsLoading } = useCollection<Campaign>(campaignsQuery, { skip: !tenantId });

  const incidentsQuery = useMemoFirebase(() => (firestore && tenantId) ? query(collection(firestore, `tenants/${tenantId}/incidents`), limit(5)) : null, [firestore, tenantId]);
  const { data: recentIncidents, isLoading: incidentsLoading } = useCollection<Incident>(incidentsQuery, { skip: !tenantId });

  const kpiData = [
    { title: 'Total Users', value: users ? users.length : '...', description: 'Across all tenants' },
    { title: 'High-Risk Users', value: highRiskUsers ? highRiskUsers.length : '...', description: 'Users with "High" risk profile' },
    { title: 'Active Campaigns', value: activeCampaigns ? activeCampaigns.filter(c => c.status === 'active').length : '...', description: 'Currently running campaigns' },
    { title: 'Open Incidents', value: recentIncidents ? recentIncidents.filter(i => i.status === 'open').length : '...', description: 'Incidents requiring attention' },
  ];

  const isLoading = usersLoading || highRiskUsersLoading || campaignsLoading || incidentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization's training and security posture.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Loader className="h-6 w-6 animate-spin" /> : kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <AiInsights />
        </div>
        {/* Active Campaigns */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className='font-headline'>Active Campaigns</CardTitle>
            <CardDescription>
              Overview of current and scheduled campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? <div className='flex justify-center items-center h-40'><Loader className='w-8 h-8 animate-spin' /></div> : (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className='text-right'>Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {activeCampaigns?.map((campaign) => (
                          <TableRow key={campaign.id}>
                              <TableCell className='font-medium'>{campaign.title}</TableCell>
                              <TableCell>{campaign.type}</TableCell>
                              <TableCell className='text-right'>
                                  <Badge variant={campaign.status === 'active' ? 'secondary' : 'outline'}>
                                      {campaign.status}
                                  </Badge>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className='font-headline'>Recent Incidents</CardTitle>
            <CardDescription>
                Track and manage security incidents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? <div className='flex justify-center items-center h-40'><Loader className='w-8 h-8 animate-spin' /></div> : (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentIncidents?.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell className='font-medium'>{incident.category}</TableCell>
                            <TableCell>
                                <Badge variant={severityVariant[incident.severity] || 'default'}>{incident.severity}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[incident.status] || 'default'}>{incident.status}</Badge>
                            </TableCell>
                            <TableCell>{incident.assigned_to}</TableCell>
                             <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Reassign</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
