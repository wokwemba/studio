'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Loader } from 'lucide-react';
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
            <div className="flex flex-col items-center text-center mb-20">
                <CyberGuardLogo className="w-24 h-24 text-primary mb-4" />
                <h1 className="text-5xl font-bold font-headline mb-4">{t('home.title')}</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mb-8">
                    {t('home.description')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/login">{t('home.login')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/signup">{t('home.signup')}</Link>
                    </Button>
                     <Button asChild variant="secondary" size="lg">
                        <Link href="/partner-registration">{t('home.partner_registration')}</Link>
                    </Button>
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
                {/* Left column for Tools */}
                <div className="lg:col-span-3">
                    <h2 className="text-3xl font-bold font-headline mb-8 text-center lg:text-left">{t('home.explore_tools')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.sort((a,b) => a.title.localeCompare(b.title)).map((feature) => {
                            const image = PlaceHolderImages.find(p => p.id === feature.imageId);
                            if (!image) return null;
                            
                            return (
                             <Link href={feature.href} key={feature.title}>
                                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex flex-col overflow-hidden group">
                                    <div className="relative w-full h-40">
                                        <Image
                                            src={image.imageUrl}
                                            alt={feature.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={image.imageHint}
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="font-headline">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )})}
                    </div>
                </div>

                {/* Right column for Trending News */}
                <div className="w-full lg:sticky lg:top-24">
                    <TrendingNews />
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
