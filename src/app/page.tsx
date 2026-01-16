'use client';

import { ShieldCheck, Wand2, FlaskConical, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const features = [
    {
        icon: Wand2,
        title: 'AI-Powered Training',
        description: 'Generate custom cybersecurity training modules and quizzes instantly with our advanced AI.',
        href: '/training/module'
    },
    {
        icon: FlaskConical,
        title: 'Realistic Simulations',
        description: 'Test your team\'s readiness with a wide range of simulated cyber attacks, from phishing to DDoS.',
        href: '/simulations'
    },
    {
        icon: BarChart3,
        title: 'Intelligent Risk Analysis',
        description: 'Get a clear view of your organization\'s security posture with AI-driven insights and analytics.',
        href: '/risk-profile'
    }
];

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center text-center px-4 bg-background">
            <div className="py-20 min-h-screen flex flex-col justify-center">
                <ShieldCheck className="w-24 h-24 text-primary mb-4 mx-auto" />
                <h1 className="text-5xl font-bold font-headline mb-4">Welcome to CyberGuard</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                    The next-generation platform for AI-powered cybersecurity training, risk management, and compliance.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/login">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/partner-registration">Register as Partner</Link>
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto py-16">
                <h2 className="text-3xl font-bold font-headline mb-2">Platform Features</h2>
                <p className="text-muted-foreground mb-12">Clicking any feature will require you to log in.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                         <Link href={feature.href} key={feature.title}>
                            <Card className="text-left h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                                <CardHeader>
                                    <div className="p-3 bg-primary/10 rounded-md w-fit mb-4">
                                        <feature.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
