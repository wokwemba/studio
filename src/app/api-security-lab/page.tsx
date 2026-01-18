'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Blocks } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ApiSecurityLabPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Blocks />
                        <span>API Security Lab</span>
                    </CardTitle>
                    <CardDescription>
                        A hands-on environment to learn about and exploit common API vulnerabilities based on the OWASP API Security Top 10.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-semibold">Coming Soon!</p>
                        <p>This interactive lab will allow you to test your skills against a real (but safe) API.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function ProtectedApiSecurityLabPage() {
    return (
        <ProtectedRoute>
            <ApiSecurityLabPage />
        </ProtectedRoute>
    );
}
