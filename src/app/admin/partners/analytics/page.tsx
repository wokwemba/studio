'use client';

import { useMemo } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, BarChart3, Building, Map, Gauge, ListFilter, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell, Line, BarChart as RechartsBarChart, LineChart, PieChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { PartnerRequest } from '../page';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function PartnerAnalyticsPage() {
    const firestore = useFirestore();
    const partnersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'partner_requests') : null, [firestore]);
    const { data: partners, isLoading } = useCollection<PartnerRequest>(partnersQuery);

    const analyticsData = useMemo(() => {
        if (!partners) return null;

        // Group requests by month
        const requestsByMonth = partners.reduce((acc, req) => {
            try {
                const month = new Date(req.requestedAt).toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
            } catch (e) {
                console.warn("Invalid date for partner request:", req.id);
            }
            return acc;
        }, {} as Record<string, number>);

        const requestsByMonthData = Object.entries(requestsByMonth).map(([month, requests]) => ({ month, requests }));

        // Group requests by industry
        const requestsByIndustry = partners.reduce((acc, req) => {
            const industry = req.industry || 'Unknown';
            acc[industry] = (acc[industry] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const requestsByIndustryData = Object.entries(requestsByIndustry).map(([industry, value]) => ({ industry, value })).sort((a,b) => b.value - a.value).slice(0,5);

        // Group requests by country
        const requestsByCountry = partners.reduce((acc, req) => {
            const country = req.country || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const requestsByCountryData = Object.entries(requestsByCountry).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0,4);


        // Create lead funnel data
        const leadFunnel = partners.reduce((acc, req) => {
            const status = req.status || 'new';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const leadFunnelData = [
            { stage: 'New', value: leadFunnel.new || 0, fill: 'hsl(var(--chart-1))' },
            { stage: 'Contacted', value: leadFunnel.contacted || 0, fill: 'hsl(var(--chart-2))' },
            { stage: 'Closed', value: leadFunnel.closed || 0, fill: 'hsl(var(--chart-3))' },
             { stage: 'Archived', value: leadFunnel.archived || 0, fill: 'hsl(var(--chart-4))' },
        ];
        
        const totalRequests = partners.length;
        const totalClosed = leadFunnel.closed || 0;
        const conversionRate = totalRequests > 0 ? ((totalClosed) / totalRequests) * 100 : 0;


        return {
            requestsByMonthData,
            requestsByIndustryData,
            requestsByCountryData,
            leadFunnelData,
            totalRequests,
            conversionRate
        };
    }, [partners]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        )
    }
    
    if (!analyticsData) {
        return (
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2">
                        <BarChart3 />
                        <span>Partner Analytics Dashboard</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">No partner data available to generate analytics.</p>
                </CardContent>
            </Card>
        )
    }


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
                    <CardContent><div className="text-2xl font-bold">{analyticsData.totalRequests}</div><p className="text-xs text-muted-foreground">all-time partner requests</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div><p className="text-xs text-muted-foreground">of leads successfully converted</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ListFilter/>Conversion Funnel</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={100}>
                             <RechartsBarChart data={analyticsData.leadFunnelData} layout="vertical" margin={{ left: 20 }}>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }}/>
                                <Bar dataKey="value" layout="vertical" minPointSize={5} stackId="a">
                                    {analyticsData.leadFunnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Gauge/>Lead Quality Score</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center h-full">
                       <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><TrendingUp/>Request Volume</CardTitle><CardDescription>New partner requests per month.</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData.requestsByMonthData}>
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
                            <RechartsBarChart data={analyticsData.requestsByIndustryData} layout="vertical">
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
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Map/>Requests by Country</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={analyticsData.requestsByCountryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label={(entry) => entry.name}>
                                    {analyticsData.requestsByCountryData.map((entry, index) => (
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
                    <CardHeader>
                        <CardTitle>Partner Pipeline</CardTitle>
                        <CardDescription>A live look at the partner request pipeline statuses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analyticsData.leadFunnelData.map((lead) => (
                                    <TableRow key={lead.stage}>
                                        <TableCell>{lead.stage}</TableCell>
                                        <TableCell className="text-right font-mono">{lead.value}</TableCell>
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
