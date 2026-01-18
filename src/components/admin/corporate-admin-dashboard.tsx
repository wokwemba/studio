
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { type UserProfile } from '@/app/admin/users/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Users, CheckCircle, Percent, Shield, Activity, BarChart, Calendar, MessageSquare, AlertTriangle, ShieldCheck, ShieldQuestion, Mail, GitPullRequest, Target, FileText, Bell, Settings, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, BarChart as RechartsBarChart, LineChart } from 'recharts';
import { AiInsights } from '../dashboard/ai-insights';

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

const phishingSusceptibilityData = [
  { month: 'May', rate: 28 },
  { month: 'Jun', rate: 22 },
  { month: 'Jul', rate: 15 },
  { month: 'Aug', rate: 12 },
];


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
  
  const departmentCompletionData = useMemo(() => {
    if (!users) return [];
    const depts: Record<string, { totalCompletion: number; userCount: number }> = {};
    users.forEach(user => {
      const deptName = user.department || 'Unassigned';
      if (!depts[deptName]) depts[deptName] = { totalCompletion: 0, userCount: 0 };
      
      const stats = user.trainingStats;
      const completionRate = (stats && stats.totalModules && stats.completedModules && stats.totalModules > 0)
        ? (stats.completedModules / stats.totalModules) * 100
        : 0;

      depts[deptName].userCount++;
      depts[deptName].totalCompletion += completionRate;
    });

    return Object.entries(depts)
      .map(([name, data]) => ({
        name,
        avgCompletion: data.userCount > 0 ? data.totalCompletion / data.userCount : 0,
      }))
      .sort((a, b) => b.avgCompletion - a.avgCompletion);
  }, [users]);


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
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Department Training Completion</CardTitle>
                    <CardDescription>Average training completion rates across departments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={departmentCompletionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="avgCompletion" fill="hsl(var(--primary))" name="Avg. Completion" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Phishing Susceptibility</CardTitle>
                        <CardDescription>Tenant-wide click rate on phishing simulations over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={phishingSusceptibilityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Line type="monotone" dataKey="rate" stroke="hsl(var(--destructive))" name="Click Rate" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Training Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={phishingSusceptibilityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend />
                                <Line type="monotone" dataKey="modules" stroke="hsl(var(--primary))" name="Modules Completed" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="space-y-6">
            <AiInsights />
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
