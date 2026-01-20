
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Wand2, FlaskConical, BarChart3, BrainCircuit, ScanLine, FileBadge, Copy, Trophy, ClipboardList, GitPullRequest, FileText, BookUser, ClipboardCheck, ShieldOff, Key, Users, ShieldAlert, Blocks, ShieldQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const features = [
        {
            icon: Wand2,
            title: 'AI Content Generation',
            description: 'Instantly generate custom training modules and quizzes on any cybersecurity topic.',
            href: '/training/module'
        },
        {
            icon: FlaskConical,
            title: 'Realistic Simulations',
            description: 'Test your readiness against a wide range of simulated cyber attacks, from phishing to DDoS.',
            href: '/simulations'
        },
        {
            icon: BarChart3,
            title: 'Intelligent Risk Analysis',
            description: 'Get a clear view of your organization\'s security posture with AI-driven insights.',
            href: '/risk-profile'
        },
        {
            icon: BrainCircuit,
            title: 'AI Cybersecurity Tutor',
            description: 'Get 1-on-1 help from an AI tutor to master complex cybersecurity concepts.',
            href: '/tutor'
        },
        {
            icon: Key,
            title: 'Cyber Escape Room',
            description: 'Test your problem-solving skills in a high-pressure, simulated incident scenario.',
            href: '/escape-room'
        },
        {
            icon: ShieldAlert,
            title: 'Vulnerability Challenge',
            description: 'A gamified challenge to test your ability to prioritize and manage security vulnerabilities.',
            href: '/vulnerability-challenge'
        },
        {
            icon: ClipboardList,
            title: 'IR Playbook Generator',
            description: 'Use AI to generate detailed Incident Response playbooks for various security scenarios.',
            href: '/incident-response-playbook'
        },
        {
            icon: Users,
            title: 'Threat Actor Profiler',
            description: 'Generate and study profiles of known cyber threat actors and APT groups.',
            href: '/threat-intelligence/actors'
        },
        {
            icon: Blocks,
            title: 'API Security Lab',
            description: 'Practice finding and exploiting common API vulnerabilities in a safe, sandboxed environment.',
            href: '/api-security-lab'
        },
         {
            icon: ShieldQuestion,
            title: 'Interactive Threat Scenarios',
            description: 'Engage in realistic, story-driven security challenges to test your decision-making skills.',
            href: '/threat-scenarios'
        },
        {
            icon: ScanLine,
            title: 'Phishing Detector Engine',
            description: 'Analyze suspicious SMS, email, and WhatsApp messages for fraud and phishing attempts.',
            href: '/phishing-engine/dashboard'
        },
         {
            icon: ShieldOff,
            title: 'Dark Web Monitor',
            description: 'Simulate a scan of the dark web for mentions of your company and keywords.',
            href: '/dark-web-monitor'
        },
        {
            icon: ScanLine,
            title: 'VAPT Console',
            description: 'Request professional vulnerability assessments and penetration testing.',
            href: '/vapt'
        },
        {
            icon: FileBadge,
            title: 'Compliance & Reporting',
            description: 'Manage compliance requirements and generate detailed reports for your organization.',
            href: '/admin/analytics'
        },
        {
            icon: Copy,
            title: 'Interactive Flashcards',
            description: 'Study key cybersecurity terms and concepts with AI-generated flashcard decks.',
            href: '/flashcards'
        },
        {
            icon: Trophy,
            title: 'Gamified Leaderboard',
            description: 'Compete with your colleagues and climb the ranks based on your security score.',
            href: '/leaderboard'
        },
        {
            icon: FileText,
            title: 'Certificate Management',
            description: 'Earn and manage official certificates for completed training modules.',
            href: '/certificates'
        },
        {
            icon: ClipboardList,
            title: 'Incident Response Planning',
            description: 'Submit requests for guided Incident Response tabletop exercises and drills.',
            href: '/incident-response'
        },
        {
            icon: GitPullRequest,
            title: 'Automated Campaign Builder',
            description: 'Let AI design end-to-end security awareness campaigns for your organization.',
            href: '/admin/campaigns'
        },
        {
            icon: BookUser,
            title: 'Custom Training',
            description: 'Request the creation of bespoke training modules tailored to your specific needs.',
            href: '/custom-training'
        },
        {
            icon: ClipboardCheck,
            title: 'System Audit',
            description: 'Request a formal audit of a system, application, or process against a specific framework.',
            href: '/system-audit'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center text-center px-4 bg-background py-20">
            <ShieldCheck className="w-24 h-24 text-primary mb-4 mx-auto" />
            <h1 className="text-5xl font-bold font-headline mb-4">Cybersecurity Training and Consultancy</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Sharpen your skills with AI-powered training modules, realistic simulations, and personalized learning paths.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/signup">Sign Up</Link>
                </Button>
                 <Button asChild variant="secondary" size="lg">
                    <Link href="/partner-registration">Register as Partner</Link>
                </Button>
            </div>
            
             <div className="w-full max-w-7xl mx-auto py-16 mt-10">
                <h2 className="text-3xl font-bold font-headline mb-12 text-center">Explore Our Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.sort((a,b) => a.title.localeCompare(b.title)).map((feature) => (
                         <Link href={feature.href} key={feature.title}>
                            <Card className="text-center h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center">
                                <CardHeader className="items-center">
                                    <div className="p-3 bg-primary/10 rounded-md w-fit mb-4">
                                        <feature.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
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
