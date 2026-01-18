'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AlertsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>High-Risk Alerts</CardTitle>
                <CardDescription>This page will allow you to review all transactions that have been flagged as high-risk.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>High-risk alerts UI coming soon.</p>
            </CardContent>
        </Card>
    );
}
