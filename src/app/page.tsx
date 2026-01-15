
'use client';

import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 -mt-16">
            <ShieldCheck className="w-24 h-24 text-primary mb-4" />
            <h1 className="text-5xl font-bold font-headline mb-4">Welcome to CyberGuard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                The next-generation platform for AI-powered cybersecurity training, risk management, and compliance.
            </p>
            <div className="flex gap-4">
                <Button asChild size="lg">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    );
}
