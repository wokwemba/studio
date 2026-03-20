'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
    Loader, 
    ShieldCheck, 
    Zap, 
    ArrowRight, 
    ShieldAlert, 
    Wand2, 
    BrainCircuit, 
    Blocks, 
    GitPullRequest, 
    Award, 
    BarChart3, 
    BookUser, 
    Key, 
    GitBranch, 
    Trophy, 
    ClipboardList, 
    Activity, 
    Copy, 
    ShieldQuestion, 
    FileText, 
    ScanLine, 
    FlaskConical, 
    ClipboardCheck, 
    Users,
    Monitor,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { CyberGuardLogo } from '@/components/icons/cyber-guard-logo';
import { TrendingNews } from '@/components/dashboard/trending-news';
import { cn } from '@/lib/utils';

function PricingSection() {
    const plans = [
        {
            name: "Individual",
            price: "Free",
            description: "Essential training for anyone looking to stay safe online.",
            features: [
                "AI Module Generator (3/mo)",
                "Basic Phishing Simulations",
                "Community Leaderboard",
                "Digital Certificates",
                "AI Tutor Support"
            ],
            cta: "Get Started",
            href: "/signup",
            variant: "outline" as const
        },
        {
            name: "Pro",
            price: "$19.99",
            description: "Deep dive for security enthusiasts and professionals.",
            features: [
                "Unlimited AI Modules",
                "Priority AI Tutor Access",
                "Advanced Threat Scenarios",
                "Detailed Risk Analytics",
                "Downloadable IR Playbooks",
                "Early Beta Access"
            ],
            cta: "Upgrade Now",
            href: "/checkout/paypal",
            variant: "default" as const,
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Managed security and compliance for your organization.",
            features: [
                "Full Tenant Management",
                "Professional VAPT Audits",
                "SSO & API Integrations",
                "24/7 Dedicated Support",
                "Custom Audit Reports",
                "On-site Training Options"
            ],
            cta: "Contact Sales",
            href: "/partner-registration",
            variant: "outline" as const
        }
    ];

    return (
        <section className="py-32 border-t border-primary/10">
            <div className="text-center mb-20 max-w-2xl mx-auto">
                <Badge variant="outline" className="mb-4 text-primary border-primary/30 font-mono uppercase">PLANS & PRICING</Badge>
                <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6 tracking-tight">Invest in Your Protection</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">Whether you're a student or a CEO, we have a protection plan tailored to your needs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card key={plan.name} className={cn(
                        "relative flex flex-col h-full transition-all duration-500 hover:translate-y-[-8px]",
                        plan.popular ? "border-primary shadow-2xl shadow-primary/10 bg-primary/[0.02]" : "bg-card/30 border-primary/5"
                    )}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary text-primary-foreground px-4 py-1 font-bold shadow-lg">
                                    MOST POPULAR
                                </Badge>
                            </div>
                        )}
                        <CardHeader className="pb-8">
                            <CardTitle className="font-headline text-2xl mb-2">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                                {plan.price !== "Custom" && plan.price !== "Free" && <span className="text-muted-foreground font-medium">/mo</span>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <Separator className="bg-primary/10" />
                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm group">
                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                                        <span className="text-foreground/90">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-8">
                            <Button asChild variant={plan.variant} size="lg" className="w-full font-bold h-14 text-lg rounded-xl shadow-xl shadow-primary/5">
                                <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function PublicHomePage() {
    const { t } = useTranslation();

    const features = [
        { icon: Wand2, title: 'AI Content Generation', description: "Instantly generate custom training modules and quizzes on any cybersecurity topic.", href: '/training/module' },
        { icon: FlaskConical, title: 'Realistic Simulations', description: "Test your readiness against a wide range of simulated cyber attacks, from phishing to DDoS.", href: '/simulations' },
        { icon: Activity, title: 'Intelligent Risk Analysis', description: "Get a clear view of your organization's security posture with AI-driven insights.", href: '/risk-profile' },
        { icon: BrainCircuit, title: 'AI Cybersecurity Tutor', description: "Get 1-on-1 help from an AI tutor to master complex cybersecurity concepts.", href: '/tutor' },
        { icon: Key, title: 'Cyber Escape Room', description: 'Test your problem-solving skills in a high-pressure, simulated incident scenario.', href: '/escape-room' },
        { icon: ShieldAlert, title: 'Vulnerability Challenge', description: 'A gamified challenge to test your ability to prioritize and manage security vulnerabilities.', href: '/vulnerability-challenge' },
        { icon: FileText, title: 'IR Playbook Generator', description: 'Use AI to generate detailed Incident Response playbooks for various security scenarios.', href: '/incident-response-playbook' },
        { icon: Users, title: 'Threat Actor Profiler', description: 'Generate and study profiles of known cyber threat actors and APT groups.', href: '/threat-intelligence/actors' },
        { icon: Blocks, title: 'API Security Lab', description: 'Practice finding and exploiting common API vulnerabilities in a safe, sandboxed environment.', href: '/api-security-lab' },
        { icon: ShieldQuestion, title: 'Interactive Threat Scenarios', description: 'Engage in realistic, story-driven security challenges to test your decision-making skills.', href: '/threat-scenarios' },
        { icon: ScanLine, title: 'Phishing Detector Engine', description: 'Analyze suspicious SMS, email, and WhatsApp messages for fraud and phishing attempts.', href: '/phishing-engine/dashboard' },
        { icon: GitBranch, title: 'Dark Web Monitor', description: 'Simulate a scan of the dark web for mentions of your company and keywords.', href: '/dark-web-monitor' },
        { icon: Monitor, title: 'VAPT Console', description: 'Request professional vulnerability assessments and penetration testing.', href: '/vapt' },
        { icon: BarChart3, title: 'Compliance & Reporting', description: "Manage compliance requirements and generate detailed reports for your organization.", href: '/admin/analytics' },
        { icon: Copy, title: 'Interactive Flashcards', description: 'Study key cybersecurity terms and concepts with AI-generated flashcard decks.', href: '/flashcards' },
        { icon: Trophy, title: 'Gamified Leaderboard', description: 'Compete with your colleagues and climb the ranks based on your security score.', href: '/leaderboard' },
        { icon: Award, title: 'Certificate Management', description: 'Earn and manage official certificates for completed training modules.', href: '/certificates' },
        { icon: ClipboardList, title: 'Incident Response Planning', description: 'Submit requests for guided Incident Response tabletop exercises and drills.', href: '/incident-response' },
        { icon: GitPullRequest, title: 'Automated Campaign Builder', description: "Let AI design end-to-end security awareness campaigns for your organization.", href: '/admin/campaigns' },
        { icon: BookUser, title: 'Custom Training', description: 'Request the creation of bespoke training modules tailored to your specific needs.', href: '/custom-training' },
        { icon: ClipboardCheck, title: 'System Audit', description: 'Request a formal audit of a system, application, or process against a specific framework.', href: '/system-audit' }
    ];

    return (
        <div className="container mx-auto px-4 py-12 md:py-24">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-32 max-w-4xl mx-auto">
                <div className="relative mb-8">
                    <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
                    <CyberGuardLogo className="relative w-28 h-28 text-primary" />
                </div>
                
                <Badge variant="outline" className="mb-6 text-primary border-primary/50 bg-primary/5 px-6 py-1.5 text-sm font-mono tracking-tight uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {t('home.hero_hook')}
                </Badge>
                
                <h1 className="text-6xl md:text-7xl font-bold font-headline mb-8 tracking-tighter text-foreground leading-[1.1]">
                    {t('home.title')}
                </h1>
                
                <p className="text-2xl md:text-3xl text-foreground font-semibold mb-6 max-w-3xl leading-snug">
                    {t('home.hero_problem')}
                </p>
                
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t('home.description')}
                </p>

                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <Button asChild size="lg" className="h-16 px-10 text-xl font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        <Link href="/signup">{t('home.signup')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl font-bold rounded-xl border-2 hover:bg-accent transition-colors">
                        <Link href="/partner-registration">{t('home.partner_registration')}</Link>
                    </Button>
                </div>
                
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]">
                    {t('home.differentiator')}
                </p>
            </div>

            {/* Value Props Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-colors shadow-2xl">
                    <CardHeader>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Prevention Through Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-lg leading-relaxed">Stop attacks before they happen. Our interactive AI-driven training builds a culture of continuous vigilance.</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-colors shadow-2xl">
                    <CardHeader>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Scalable Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-lg leading-relaxed">From individual freelancers to large corporations, we scale our security intelligence to meet your specific needs.</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-colors shadow-2xl">
                    <CardHeader>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldAlert className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Expert Consulting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-lg leading-relaxed">Don't just detect — respond. Access professional VAPT, system audits, and automated incident response playbooks.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pricing Section */}
            <PricingSection />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start border-t border-primary/10 pt-24">
                <div className="lg:col-span-3">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-4xl font-bold font-headline tracking-tight mb-2">{t('home.explore_tools')}</h2>
                            <p className="text-muted-foreground text-lg">Deploy enterprise-grade security tools from your personal console.</p>
                        </div>
                        <Button variant="link" asChild className="p-0 h-auto text-primary font-bold">
                            <Link href="/login" className="flex items-center gap-2">
                                Already have an account? Sign In <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.sort((a,b) => a.title.localeCompare(b.title)).map((feature) => (
                             <Link href={feature.href} key={feature.title}>
                                <Card className="h-full hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer flex flex-col group border-primary/5 bg-card/30">
                                    <CardHeader className="pb-4">
                                        <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{feature.description}</p>
                                    </CardContent>
                                    <div className="px-6 pb-6">
                                        <div className="text-xs font-mono font-bold text-primary flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                            <Lock className="w-3 h-3" />
                                            LAUNCH MODULE <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:sticky lg:top-24 space-y-8">
                    <TrendingNews />
                    <Card className="bg-primary/5 border-2 border-primary/20 border-dashed relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
                        <CardHeader>
                            <CardTitle className="text-lg font-headline">Enterprise Solutions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <p className="text-sm text-muted-foreground">Looking for managed security, employee compliance tracking, or custom high-fidelity simulations?</p>
                            <Button asChild variant="outline" size="lg" className="w-full font-bold border-2">
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
    if (loading) return;
    
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

  return <PublicHomePage />;
}
