'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TransactionsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>This page will allow you to browse and inspect all analyzed transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Full transaction history UI coming soon.</p>
            </CardContent>
        </Card>
    );
}
