'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { recentAttacksData, type RecentAttack, type AttackType } from './data';
import { format, parseISO } from 'date-fns';

const attackColors: Record<AttackType, 'destructive' | 'secondary' | 'default' | 'outline'> = {
    'DDoS': 'destructive',
    'SQL Injection': 'secondary',
    'Cross-Site Scripting': 'default',
    'Phishing': 'outline',
    'Malware': 'destructive',
    'Ransomware': 'destructive',
    'Zero-day Exploit': 'secondary',
};

export default function RecentAttacksPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Recent Cyberattacks</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Global Incidents</CardTitle>
          <CardDescription>
            A list of the 20 most significant cyberattacks reported in the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[120px]'>Date</TableHead>
                  <TableHead>Attack Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttacksData.map((attack) => (
                  <TableRow key={attack.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {format(parseISO(attack.date), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={attackColors[attack.type]}>{attack.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{attack.source}</TableCell>
                    <TableCell className="font-medium">{attack.target}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{attack.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
