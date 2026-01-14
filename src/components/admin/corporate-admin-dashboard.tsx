
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { type UserProfile } from '@/app/admin/users/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Users, CheckCircle, Percent, Shield, Activity, BarChart, Calendar, MessageSquare, AlertTriangle, ShieldCheck, ShieldClose, ShieldQuestion, Mail, GitPullRequest, Target, FileText, Bell, Settings } from 'lucide-react';
import { Button } from '../ui/button';

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

// Placeholder data - this would be calculated from user and training data in a real app
const departmentPerformanceData = [
    { name: 'IT Dept', completion: 95, status: 'high' },
    { name: 'Finance', completion: 88, status: 'high' },
    { name: 'Sales', completion: 65, status: 'medium' },
    { name: 'HR', completion: 92, status: 'high' },
    { name: 'Marketing', completion: 45, status: 'low' },
];

const quickActions = [
    { label: "Invite Users", icon: Mail, href: "/admin/users"},
    { label: "Assign Training", icon: GitPullRequest, href: "/admin/campaigns"},
    { label: "Run Phishing Test", icon: Target, href: "/simulations"},
    { label: "Generate Report", icon: FileText, href: "/admin/analytics"},
    { label: "Send Reminder", icon: Bell, href: "#"},
    { label: "Configure Settings", icon: Settings, href: "/admin/settings"},
]

const upcomingDeadlines = [
    { text: "PCI DSS Training - 45 users pending", date: "Oct 15" },
    { text: "Phishing Simulation - Scheduled", date: "Oct 20" },
    { text: "Quarterly Compliance Report Due", date: "Nov 1" },
];

const complianceIcons: Record<string, React.ReactElement> = {
    high: <ShieldCheck className="h-5 w-5 text-success" />,
    medium: <ShieldQuestion className="h-5 w-5 text-yellow-500" />,
    low: <AlertTriangle className="h-5 w-5 text-destructive" />,
};


export function CorporateAdminDashboard() {
  const { user: currentUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const adminUserDocRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, "users", currentUser.uid) : null),
    [currentUser, firestore]
  );
  const { data: adminUserData, isLoading: isAdminUserDataLoading } = useDoc<UserProfile>(adminUserDocRef);
  
  const tenantId = adminUserData?.tenantId;

  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery, { skip: !usersQuery });

  const tenantDocRef = useMemoFirebase(
      () => (firestore && tenantId) ? doc(firestore, 'tenants', tenantId) : null,
      [firestore, tenantId]
  );
  const { data: tenantData, isLoading: tenantLoading } = useDoc<{stats?: { totalUsers: number, completionRate: number, avgScore: number}, risk: 'Low' | 'Medium' | 'High'}>(tenantDocRef);

  const isLoading = isAuthLoading || isAdminUserDataLoading || usersLoading || tenantLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const overviewMetrics = [
      { title: "Users", value: tenantData?.stats?.totalUsers || users?.length || 0, icon: Users },
      { title: "Completion Rate", value: `${tenantData?.stats?.completionRate || 0}%`, icon: CheckCircle },
      { title: "Avg. Score", value: `${tenantData?.stats?.avgScore || 0}%`, icon: Percent },
      { title: "Overall Risk", value: tenantData?.risk || 'N/A', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map(metric => (
            <AdminMetricCard key={metric.title} title={metric.title} value={metric.value} icon={metric.icon} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Department Performance</CardTitle>
                    <CardDescription>Completion rates and compliance across your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {departmentPerformanceData.map(dept => (
                            <li key={dept.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {complianceIcons[dept.status]}
                                    <div>
                                        <p className="font-semibold">{dept.name}</p>
                                        <p className="text-sm text-muted-foreground">{dept.completion}% Completion</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    {quickActions.map(action => (
                        <Button key={action.label} variant="outline" className="justify-start" asChild>
                            <Link href={action.href}>
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.label}
                            </Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-3">
                        {upcomingDeadlines.map(item => (
                            <li key={item.text} className="flex items-center gap-3 text-sm">
                                <span className="font-mono text-xs bg-secondary text-secondary-foreground rounded-md px-2 py-1 w-14 text-center">{item.date}</span>
                                <span>{item.text}</span>
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
