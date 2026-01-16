
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, History, User, Lock, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { AuditLog } from '@/docs/backend-schema';

const actionColors: Record<string, string> = {
    USER_LOGIN: 'bg-green-500/20 text-green-400',
    USER_LOGOUT: 'bg-gray-500/20 text-gray-400',
    USER_SIGNUP: 'bg-blue-500/20 text-blue-400',
    USER_ROLE_CHANGE: 'bg-yellow-500/20 text-yellow-400',
    USER_INVITED: 'bg-purple-500/20 text-purple-400',
    IMPERSONATION_START: 'bg-orange-500/20 text-orange-400',
    IMPERSONATION_STOP: 'bg-orange-500/20 text-orange-400',
};

export default function AuditLogPage() {
    const firestore = useFirestore();

    const auditLogsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100)) : null,
        [firestore]
    );

    const { data: logs, isLoading } = useCollection<AuditLog>(auditLogsQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <History />
                    <span>Audit Logs</span>
                </CardTitle>
                <CardDescription>A real-time stream of important security events occurring across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
                ) : !logs || logs.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No audit events have been recorded yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge className={cn("font-semibold", actionColors[log.action] || 'bg-secondary')}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs">{log.actorEmail}</span>
                                                <span className="font-mono text-xs text-muted-foreground">{log.actorUid}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        {log.targetId ? (
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs">{log.targetType}</span>
                                                    <span className="font-mono text-xs text-muted-foreground">{log.targetId}</span>
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <div className="flex items-center justify-end gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
