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

const kpiData = [
  { title: 'Overall Risk Score', value: '68', change: -3, unit: '', description: 'Medium' },
  { title: 'Phish Failure %', value: '12%', change: 1.5, unit: '%', description: 'vs. last month' },
  { title: 'Fraud Alerts', value: '25', change: 5, unit: '', description: 'in last 7 days' },
  { title: 'Compliance %', value: '92%', change: 0, unit: '%', description: 'ISO 27001' },
];

const activeCampaigns = [
  { name: 'Phishing Q1', type: 'Phishing', status: 'Running' },
  { name: 'Fraud Drill', type: 'Fraud', status: 'Scheduled' },
  { name: 'Security Awareness 2024', type: 'Training', status: 'Completed' },
];

const recentIncidents = [
    { type: 'Phishing', severity: 'High', status: 'Open', assigned: 'J. Doe' },
    { type: 'Malware', severity: 'Critical', status: 'In Progress', assigned: 'A. Smith' },
    { type: 'Data Leak', severity: 'Medium', status: 'Resolved', assigned: 'C. Brown' },
];

const severityVariant: Record<string, 'destructive' | 'secondary' | 'outline' | 'default'> = {
    'High': 'destructive',
    'Critical': 'destructive',
    'Medium': 'secondary',
    'Low': 'outline',
};

const statusVariant: Record<string, 'destructive' | 'secondary' | 'outline' | 'default'> = {
    'Open': 'destructive',
    'In Progress': 'secondary',
    'Resolved': 'default',
};

export default function AdminPage() {
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
              <div className="text-2xl font-bold">{kpi.value}{kpi.unit}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Campaigns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className='font-headline'>Active Campaigns</CardTitle>
            <CardDescription>
              Overview of current and scheduled campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className='text-right'>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activeCampaigns.map((campaign) => (
                        <TableRow key={campaign.name}>
                            <TableCell className='font-medium'>{campaign.name}</TableCell>
                            <TableCell>{campaign.type}</TableCell>
                            <TableCell className='text-right'>
                                <Badge variant={campaign.status === 'Running' ? 'secondary' : 'outline'}>
                                    {campaign.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className='font-headline'>Recent Incidents</CardTitle>
            <CardDescription>
                Track and manage security incidents.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    {recentIncidents.map((incident) => (
                        <TableRow key={incident.type + incident.severity}>
                            <TableCell className='font-medium'>{incident.type}</TableCell>
                            <TableCell>
                                <Badge variant={severityVariant[incident.severity] || 'default'}>{incident.severity}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[incident.status] || 'default'}>{incident.status}</Badge>
                            </TableCell>
                            <TableCell>{incident.assigned}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
