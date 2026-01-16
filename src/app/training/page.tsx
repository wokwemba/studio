
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection, useAuth, signInAnonymously } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, AlertTriangle, ShieldCheck, FileText, Lightbulb, Bell, Clock, Check, Wand2, FlaskConical, BarChart3, BrainCircuit, ScanLine, FileBadge, Copy, Trophy, ClipboardList, GitPullRequest } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/metric-card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type TrainingResult = {
  id: string;
  moduleId: string; // This is the 'topic'
  score: number;
  completedAt: string; // ISO String
};

const requiredTraining = [
    { id: 'rt1', title: 'Phishing Awareness', dueDate: '2 days', status: 'in-progress', icon: AlertTriangle, href: '/training/module' },
    { id: 'rt2', title: 'Password Security', dueDate: '1 week', status: 'not-started', icon: Clock, href: '/training/module' },
    { id: 'rt3', title: 'Data Privacy', dueDate: 'Completed', status: 'completed', icon: Check, href: '/training/module' },
];

const securityTip = {
    title: "Security Tip of the Day",
    content: "Never share your password via email, even with IT support. Legitimate requests will be handled through official channels."
};

function PublicTrainingLanding() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleAnonymousLogin = async () => {
        if (!auth) {
             toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not available.' });
            return;
        };
        setIsLoading(true);
        const result = await signInAnonymously(auth);
        if (result.success) {
            router.push('/flashcards');
        } else {
            toast({ variant: 'destructive', title: 'Could not log in', description: result.error });
            setIsLoading(false);
        }
    };

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
            icon: ScanLine,
            title: 'VAPT & Audit Services',
            description: 'Request professional vulnerability assessments, penetration testing, and system audits.',
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
            icon: ScanLine, // Reusing icon, it fits well
            title: 'Phishing Detector Engine',
            description: 'Analyze suspicious SMS messages for fraud and phishing attempts with our AI engine.',
            href: '/phishing-engine/dashboard'
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
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center text-center px-4 bg-background py-20">
            <ShieldCheck className="w-24 h-24 text-primary mb-4 mx-auto" />
            <h1 className="text-5xl font-bold font-headline mb-4">Cybersecurity Training AND CONSULTANCY</h1>
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
                 <Button variant="secondary" size="lg" onClick={handleAnonymousLogin} disabled={isLoading}>
                     {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Explore Flashcards
                </Button>
            </div>
            
             <div className="w-full max-w-7xl mx-auto py-16 mt-10">
                <h2 className="text-3xl font-bold font-headline mb-12">Explore Our Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

function UserTrainingDashboard() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const trainingResultsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/trainingResults`),
      orderBy('completedAt', 'desc')
    );
  }, [user, firestore]);
  
  const { data: trainingResults, isLoading: isLoadingResults } = useCollection<TrainingResult>(
    trainingResultsQuery,
    { skip: !trainingResultsQuery }
  );

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isLoadingUser } = useDoc<{risk: 'Low' | 'Medium' | 'High', trainingStats?: { completedModules?: number, totalModules?: number, avgScore?: number, complianceScore?: number }}>(userDocRef);

  const metrics = useMemo(() => {
    const stats = userData?.trainingStats || {};
    return [
        { label: 'Compliance', value: `${stats.complianceScore || 85}%`, subValue: 'Overall' },
        { label: 'Completed', value: `${stats.completedModules || 0}/${stats.totalModules || 0}`, subValue: 'Modules' },
        { label: 'Avg Score', value: `${stats.avgScore || 0}%`, subValue: 'All quizzes' },
        { label: 'Risk', value: userData?.risk || 'N/A', subValue: 'Current Level' },
    ];
  }, [userData]);
  
  const isLoading = isLoadingResults || isLoadingUser || isAuthLoading;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96"><Loader className="w-8 h-8 animate-spin" /></div>
    );
  }

  const ClickableCard = ({ children, href, className }: { children: React.ReactNode, href?: string, className?: string }) => {
    const content = <Card className={cn("transition-all duration-200 ease-in-out h-full", href && "hover:shadow-lg hover:border-primary/50", className)}>{children}</Card>;
    if (href) {
        return <Link href={href} className="block group h-full">{content}</Link>;
    }
    return content;
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-start">
         <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName || 'User'}!</h1>
            <p className="text-muted-foreground">Your personal cybersecurity learning dashboard.</p>
         </div>
         <Button><Bell className="mr-2 h-4 w-4" />View Notifications</Button>
       </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric: any) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Required Training */}
            <div className="lg:col-span-2">
                <ClickableCard href='/training/quizzes'>
                    <CardHeader>
                        <CardTitle className='font-headline'>Required Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {requiredTraining.map(item => (
                                <li key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-1.5 rounded-full",
                                            item.status === 'in-progress' && "bg-yellow-500/20 text-yellow-500",
                                            item.status === 'not-started' && "bg-red-500/20 text-red-500",
                                            item.status === 'completed' && "bg-green-500/20 text-green-500",
                                        )}>
                                            <item.icon className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant={item.status === 'completed' ? 'outline' : 'default'}>
                                        {item.status === 'in-progress' ? 'Continue' : item.status === 'completed' ? 'Review' : 'Start'}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </ClickableCard>
            </div>
            
            <div className="space-y-6">
                {/* Security Tip */}
                 <ClickableCard>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Lightbulb className="text-primary"/>{securityTip.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{securityTip.content}</p>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">Report Suspicious Email</Button>
                            <Button variant="ghost" size="sm">More Tips</Button>
                        </div>
                    </CardContent>
                </ClickableCard>

                {/* Recent Certificates */}
                <ClickableCard href='/certificates'>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><FileText className="text-primary"/>Recent Certificates</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <ul className="space-y-2 text-sm">
                            {trainingResults?.slice(0, 3).map(cert => (
                                <li key={cert.id} className="flex justify-between items-center hover:bg-muted p-2 rounded-md">
                                    <span>{cert.moduleId}</span>
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/certificates">Download</Link>
                                    </Button>
                                </li>
                            ))}
                             {(!trainingResults || trainingResults.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-4">No certificates earned yet.</p>
                            )}
                        </ul>
                    </CardContent>
                </ClickableCard>
            </div>
        </div>
    </div>
  );
}

export default function MyTrainingPage() {
    const { user, isUserLoading } = useUser();
    
    if (isUserLoading) {
        return (
            <div className="flex justify-center items-center h-96"><Loader className="w-8 h-8 animate-spin" /></div>
        );
    }
    
    if (!user) {
        return <PublicTrainingLanding />;
    }

    return <UserTrainingDashboard />;
}
