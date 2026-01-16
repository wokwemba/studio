
'use client';

import { TrendingUp, Users, Clock, CheckCircle, BarChart3, Building, Map, Gauge, ListFilter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell, Line, BarChart as RechartsBarChart, LineChart, PieChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Placeholder data
const requestsByMonthData = [
  { month: 'Jan', requests: 65 },
  { month: 'Feb', requests: 59 },
  { month: 'Mar', requests: 80 },
  { month: 'Apr', requests: 81 },
  { month: 'May', requests: 56 },
  { month: 'Jun', requests: 55 },
  { month: 'Jul', requests: 40 },
];

const requestsByIndustryData = [
  { industry: 'Technology', value: 400 },
  { industry: 'Finance', value: 300 },
  { industry: 'Healthcare', value: 200 },
  { industry: 'Retail', value: 278 },
  { industry: 'Education', value: 189 },
];

const requestsByCountryData = [
  { name: 'USA', value: 400 },
  { name: 'Kenya', value: 300 },
  { name: 'Germany', value: 300 },
  { name: 'UK', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const leadFunnelData = [
    { stage: 'New', value: 1000, fill: 'hsl(var(--chart-1))' },
    { stage: 'Contacted', value: 650, fill: 'hsl(var(--chart-2))' },
    { stage: 'Converted', value: 150, fill: 'hsl(var(--chart-3))' },
];

const recentLeadsData = [
    { company: 'Innovate Inc.', industry: 'Technology', score: 92 },
    { company: 'FinSecure', industry: 'Finance', score: 85 },
    { company: 'HealthWell', industry: 'Healthcare', score: 78 },
    { company: 'ShopSmart', industry: 'Retail', score: 65 },
    { company: 'EduGrowth', industry: 'Education', score: 55 },
];


export default function PartnerAnalyticsPage() {

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <BarChart3 />
                        <span>Partner Analytics Dashboard</span>
                    </CardTitle>
                    <CardDescription>Insights and trends from your partner registration pipeline.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Requests</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">1,234</div><p className="text-xs text-muted-foreground">+20.1% from last month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">12.5%</div><p className="text-xs text-muted-foreground">+1.2% from last month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Time to Contact</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">2.1 days</div><p className="text-xs text-muted-foreground">-0.5 days from last month</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">High Priority Leads</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">73</div><p className="text-xs text-muted-foreground">Currently in pipeline</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><TrendingUp/>Request Volume</CardTitle><CardDescription>New partner requests per month.</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={requestsByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                                <Legend />
                                <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Building/>Top 5 Industries</CardTitle><CardDescription>Most common industries among new leads.</CardDescription></CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={requestsByIndustryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="industry" type="category" width={80} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                                <Bar dataKey="value" fill="hsl(var(--primary))" name="Requests" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Map/>Requests by Country</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={requestsByCountryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label={(entry) => entry.name}>
                                    {requestsByCountryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ListFilter/>Conversion Funnel</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                             <RechartsBarChart data={leadFunnelData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="stage" type="category" hide />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                                <Bar dataKey="value" layout="vertical" minPointSize={5}>
                                    {leadFunnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Gauge/>Lead Quality Score</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLeadsData.map((lead) => (
                                    <TableRow key={lead.company}>
                                        <TableCell>
                                            <div className="font-medium">{lead.company}</div>
                                            <div className="text-xs text-muted-foreground">{lead.industry}</div>
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <span>{lead.score}</span>
                                            <Progress value={lead.score} className="w-24" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
