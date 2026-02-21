'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Loader, ShieldCheck, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { CyberGuardLogo } from '@/components/icons/cyber-guard-logo';
import { TrendingNews } from '@/components/dashboard/trending-news';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function PublicHomePage() {
    const { t } = useTranslation();

    const features = [
        {
            imageId: 'feature-ai-content',
            title: 'AI Content Generation',
            description: "Instantly generate custom training modules and quizzes on any cybersecurity topic.",
            href: '/training/module'
        },
        {
            imageId: 'feature-simulation',
            title: 'Realistic Simulations',
            description: "Test your readiness against a wide range of simulated cyber attacks, from phishing to DDoS.",
            href: '/simulations'
        },
        {
            imageId: 'feature-risk-analysis',
            title: 'Intelligent Risk Analysis',
            description: "Get a clear view of your organization's security posture with AI-driven insights.",
            href: '/risk-profile'
        },
        {
            imageId: 'feature-ai-tutor',
            title: 'AI Cybersecurity Tutor',
            description: "Get 1-on-1 help from an AI tutor to master complex cybersecurity concepts.",
            href: '/tutor'
        },
        {
            imageId: 'feature-escape-room',
            title: 'Cyber Escape Room',
            description: 'Test your problem-solving skills in a high-pressure, simulated incident scenario.',
            href: '/escape-room'
        },
        {
            imageId: 'feature-vulnerability',
            title: 'Vulnerability Challenge',
            description: 'A gamified challenge to test your ability to prioritize and manage security vulnerabilities.',
            href: '/vulnerability-challenge'
        },
        {
            imageId: 'feature-ir-playbook',
            title: 'IR Playbook Generator',
            description: 'Use AI to generate detailed Incident Response playbooks for various security scenarios.',
            href: '/incident-response-playbook'
        },
        {
            imageId: 'feature-threat-actor',
            title: 'Threat Actor Profiler',
            description: 'Generate and study profiles of known cyber threat actors and APT groups.',
            href: '/threat-intelligence/actors'
        },
        {
            imageId: 'feature-api-lab',
            title: 'API Security Lab',
            description: 'Practice finding and exploiting common API vulnerabilities in a safe, sandboxed environment.',
            href: '/api-security-lab'
        },
         {
            imageId: 'feature-threat-scenario',
            title: 'Interactive Threat Scenarios',
            description: 'Engage in realistic, story-driven security challenges to test your decision-making skills.',
            href: '/threat-scenarios'
        },
        {
            imageId: 'feature-phishing-engine',
            title: 'Phishing Detector Engine',
            description: 'Analyze suspicious SMS, email, and WhatsApp messages for fraud and phishing attempts.',
            href: '/phishing-engine/dashboard'
        },
         {
            imageId: 'feature-dark-web',
            title: 'Dark Web Monitor',
            description: 'Simulate a scan of the dark web for mentions of your company and keywords.',
            href: '/dark-web-monitor'
        },
        {
            imageId: 'feature-vapt',
            title: 'VAPT Console',
            description: 'Request professional vulnerability assessments and penetration testing.',
            href: '/vapt'
        },
        {
            imageId: 'feature-compliance',
            title: 'Compliance & Reporting',
            description: "Manage compliance requirements and generate detailed reports for your organization.",
            href: '/admin/analytics'
        },
        {
            imageId: 'feature-flashcards',
            title: 'Interactive Flashcards',
            description: 'Study key cybersecurity terms and concepts with AI-generated flashcard decks.',
            href: '/flashcards'
        },
        {
            imageId: 'feature-leaderboard',
            title: 'Gamified Leaderboard',
            description: 'Compete with your colleagues and climb the ranks based on your security score.',
            href: '/leaderboard'
        },
        {
            imageId: 'feature-certificate',
            title: 'Certificate Management',
            description: 'Earn and manage official certificates for completed training modules.',
            href: '/certificates'
        },
        {
            imageId: 'feature-ir-planning',
            title: 'Incident Response Planning',
            description: 'Submit requests for guided Incident Response tabletop exercises and drills.',
            href: '/incident-response'
        },
        {
            imageId: 'feature-campaign-builder',
            title: 'Automated Campaign Builder',
            description: "Let AI design end-to-end security awareness campaigns for your organization.",
            href: '/admin/campaigns'
        },
        {
            imageId: 'feature-custom-training',
            title: 'Custom Training',
            description: 'Request the creation of bespoke training modules tailored to your specific needs.',
            href: '/custom-training'
        },
        {
            imageId: 'feature-system-audit',
            title: 'System Audit',
            description: 'Request a formal audit of a system, application, or process against a specific framework.',
            href: '/system-audit'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-24 max-w-4xl mx-auto">
                <CyberGuardLogo className="w-24 h-24 text-primary mb-6" />
                
                <Badge variant="outline" className="mb-4 text-primary border-primary px-4 py-1 animate-pulse">
                    {t('home.hero_hook')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl font-bold font-headline mb-6 tracking-tight text-foreground">
                    {t('home.title')}
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed font-semibold">
                    {t('home.hero_problem')}
                </p>
                
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t('home.description')}
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold">
                        <Link href="/signup">{t('home.signup')}</Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold">
                        <Link href="/partner-registration">{t('home.partner_registration')}</Link>
                    </Button>
                </div>
                
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                    {t('home.differentiator')}
                </p>
            </div>

            {/* Value Props Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <ShieldCheck className="w-10 h-10 text-primary mb-2" />
                        <CardTitle className="font-headline">Prevention Through Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Stop attacks before they happen. Our interactive AI-driven training builds a culture of vigilance.</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <Zap className="w-10 h-10 text-primary mb-2" />
                        <CardTitle className="font-headline">Scalable Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">From individual freelancers to large corporations, we scale our security intelligence to your needs.</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <ShieldAlert className="w-10 h-10 text-primary mb-2" />
                        <CardTitle className="font-headline">Expert Consulting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Don't just detect—respond. Get professional VAPT, audits, and incident response playbooks.</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start border-t pt-16">
                {/* Left column for Tools */}
                <div className="lg:col-span-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-bold font-headline">{t('home.explore_tools')}</h2>
                        <Button variant="link" asChild className="p-0 h-auto text-primary">
                            <Link href="/login" className="flex items-center gap-2">
                                Already have an account? Sign In <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.sort((a,b) => a.title.localeCompare(b.title)).map((feature) => {
                            const image = PlaceHolderImages.find(p => p.id === feature.imageId);
                            if (!image) return null;
                            
                            return (
                             <Link href={feature.href} key={feature.title}>
                                <Card className="h-full hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer flex flex-col overflow-hidden group border-muted">
                                    <div className="relative w-full h-44">
                                        <Image
                                            src={image.imageUrl}
                                            alt={feature.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            data-ai-hint={image.imageHint}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                    <div className="px-6 pb-4">
                                        <div className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            LAUNCH TOOL <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        )})}
                    </div>
                </div>

                {/* Right column for Trending News */}
                <div className="w-full lg:sticky lg:top-24 space-y-8">
                    <TrendingNews />
                    <Card className="bg-muted/50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-headline">Enterprise Solutions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">Looking for managed security, employee compliance tracking, or custom simulations?</p>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/partner-registration">Contact Sales</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


export default function Home() {
  const { user, roles, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    
    if (user) {
      const isAdmin = roles?.some(r => 
          r.name === 'Domain Administrator' || 
          r.name === 'Security Administrator' ||
          r.name === 'Tenant Administrator'
      ) || false;

      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/training');
      }
    }
  }, [user, roles, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Only render the public page if not loading and no user is authenticated
  return <PublicHomePage />;
}
