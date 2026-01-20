
'use client';
import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Search, GitBranch, FileText, Globe, Users, Phone, Shield, Share2, KeyRound, FileWarning, GitCommit, ClipboardPaste, Fingerprint, CreditCard, CloudCog, Database, Router, Globe2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runRiskDetectionAnalysis, type RiskDetectionMapOutput } from '@/ai/flows/osint-mind-map-flow';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { MindMapNode } from '@/components/phishing-engine/mind-map-node';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const osintCategories = [
    'Username Search', 'Email Analysis', 'Domain WHOIS', 'Subdomain Enumeration',
    'IP Address Analysis', 'Associated Social Media', 'Data Breach Exposure',
    'Reputation Analysis', 'Associated Documents', 'Reverse Image Search',
    'Phone Number Lookup', 'Geolocation Analysis', 'Dark Web Mentions',
    'Company Information', 'Employee Lookup', 'Code Repository Search',
    'Vulnerability Scan', 'DNS Records', 'Website Technology', 'Historical Archives',
    'Leaked Credentials', 'Malware Samples', 'Git Commits', 'Pastebin / Public Leaks',
    'Personal ID Exposure', 'Credit Card Exposure', 'Exposed API Keys', 'Database Dumps',
    'Connected IoT Devices', 'Domain Typosquatting'
];

const iconMap = {
    emailAnalysis: FileText,
    domainAnalysis: Globe,
    usernameAnalysis: Users,
    phoneAnalysis: Phone,
    breachData: Shield,
    socialMedia: Share2,
    reputation: GitBranch,
    leakedCredentials: KeyRound,
    malwareSamples: FileWarning,
    gitCommits: GitCommit,
    pastebinLeaks: ClipboardPaste,
    personalIdExposure: Fingerprint,
    creditCardExposure: CreditCard,
    exposedApiKeys: CloudCog,
    databaseDumps: Database,
    connectedIotDevices: Router,
    domainTyposquatting: Globe2,
};


function DarkWebMonitorPage() {
    const [target, setTarget] = useState('example.com');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RiskDetectionMapOutput | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['Email Analysis', 'Domain WHOIS', 'Data Breach Exposure', 'Phone Number Lookup']));
    const { toast } = useToast();
    
    const containerRef = useRef<HTMLDivElement>(null);
    const centerNodeRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lineCoords, setLineCoords] = useState<{ x1: number, y1: number, x2: number, y2: number }[]>([]);

    useEffect(() => {
        nodeRefs.current = [];
    }, [results]);

    useEffect(() => {
        const calculateLines = () => {
            if (!results || !containerRef.current || !centerNodeRef.current || nodeRefs.current.length === 0) {
                setLineCoords([]);
                return;
            };

            const containerRect = containerRef.current.getBoundingClientRect();
            const centerRect = centerNodeRef.current.getBoundingClientRect();
            const centerX = (centerRect.left - containerRect.left) + (centerRect.width / 2);
            const centerY = (centerRect.top - containerRect.top) + (centerRect.height / 2);

            const coords = nodeRefs.current.map(nodeEl => {
                if (!nodeEl) return null;
                const nodeRect = nodeEl.getBoundingClientRect();
                const nodeX = (nodeRect.left - containerRect.left) + (nodeRect.width / 2);
                const nodeY = (nodeRect.top - containerRect.top) + (nodeRect.height / 2);
                return { x1: centerX, y1: centerY, x2: nodeX, y2: nodeY };
            }).filter((c): c is { x1: number, y1: number, x2: number, y2: number } => c !== null);
            
            setLineCoords(coords);
        };

        calculateLines();
        window.addEventListener('resize', calculateLines);
        const timer = setTimeout(calculateLines, 500);

        return () => {
            window.removeEventListener('resize', calculateLines);
            clearTimeout(timer);
        };
    }, [results]);


    const handleCategoryChange = (category: string, checked: boolean | 'indeterminate') => {
        const newSelected = new Set(selectedCategories);
        if (checked) newSelected.add(category);
        else newSelected.delete(category);
        setSelectedCategories(newSelected);
    };

    const handleAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!target.trim()) {
            toast({ variant: 'destructive', title: 'Target Required', description: 'Please enter a target to analyze.' });
            return;
        }
        if (selectedCategories.size === 0) {
            toast({ variant: 'destructive', title: 'Categories Required', description: 'Please select at least one category to investigate.' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const analysisResults = await runRiskDetectionAnalysis({ target, categories: Array.from(selectedCategories) });
            setResults(analysisResults);
            toast({ title: 'OSINT Scan Complete', description: 'Simulated analysis finished.' });
        } catch (err: any) {
            console.error("OSINT Scan failed:", err);
            setError(err.message || 'The AI service may be temporarily unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    const resultEntries = results ? Object.entries(results).filter(([key, value]) => key !== 'targetType' && value) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <GitBranch />
                        <span>OSINT & Dark Web Intelligence</span>
                    </CardTitle>
                    <CardDescription>
                        Simulate an OSINT investigation. Enter a target and select categories to generate a report on its public exposure.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAnalyze}>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="osint-target">Target</Label>
                                <div className="flex gap-2">
                                    <Input id="osint-target" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g., example.com, user@test.com, or +254712345678" disabled={isLoading} />
                                    <Button type="submit" disabled={isLoading} className="w-32">{isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}<span className="ml-2 hidden sm:inline">Analyze</span></Button>
                                </div>
                            </div>
                            <Accordion type="single" collapsible><AccordionItem value="item-1"><AccordionTrigger>Investigation Categories ({selectedCategories.size} selected)</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex gap-2 mb-4 px-2"><Button type="button" size="sm" variant="outline" onClick={() => setSelectedCategories(new Set(osintCategories))}>Select All</Button><Button type="button" size="sm" variant="outline" onClick={() => setSelectedCategories(new Set())}>Deselect All</Button></div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 max-h-60 overflow-y-auto">{osintCategories.map(category => (<div key={category} className="flex items-center space-x-2"><Checkbox id={category} checked={selectedCategories.has(category)} onCheckedChange={(checked) => handleCategoryChange(category, checked)} /><Label htmlFor={category} className="text-sm font-normal cursor-pointer">{category}</Label></div>))}</div>
                                </AccordionContent>
                            </AccordionItem></Accordion>
                        </div>
                    </CardContent>
                </form>
            </Card>

            {isLoading && (<Card><CardContent className="p-8 flex flex-col items-center justify-center gap-4 min-h-[500px]"><Loader className="w-10 h-10 animate-spin text-primary" /><p className="text-muted-foreground">AI is running the analysis...</p></CardContent></Card>)}
            {error && (<Card className="bg-destructive/10 border-destructive"><CardHeader><CardTitle>Analysis Failed</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>)}
            {results && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Analysis Results for &quot;{target}&quot;</CardTitle>
                        <CardDescription>A mind map of simulated intelligence findings.</CardDescription>
                    </CardHeader>
                    <CardContent ref={containerRef} className="relative min-h-[700px] flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full z-0" aria-hidden="true">
                            {lineCoords.map((coord, index) => (
                                <line key={index} {...coord} stroke="hsl(var(--border))" strokeWidth="1" />
                            ))}
                        </svg>
                        
                        <div ref={centerNodeRef} className="relative z-10">
                            <MindMapNode title={target} isCentral>
                                <p className="text-xs text-center text-muted-foreground capitalize">Target: {results.targetType}</p>
                            </MindMapNode>
                        </div>
                        
                        {resultEntries.map(([key, value], index) => {
                            const angle = (index / resultEntries.length) * 2 * Math.PI;
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 + 35 * Math.sin(angle);
                            const Icon = (iconMap as any)[key] || GitBranch;
                            return (
                                <div 
                                    key={key} 
                                    ref={el => { if(el) nodeRefs.current[index] = el; }}
                                    className="absolute z-10" 
                                    style={{left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)'}}
                                >
                                    <MindMapNode title={key.replace(/([A-Z])/g, ' $1')} icon={Icon}>
                                        <p className="text-xs font-semibold italic text-muted-foreground mb-2">&quot;{value.summary}&quot;</p>
                                        <ul className="text-xs list-disc list-inside space-y-1">{value.data.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                                    </MindMapNode>
                                </div>
                            );
                        })}
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}

export default function ProtectedDarkWebMonitorPage() {
    return (
        <ProtectedRoute>
            <DarkWebMonitorPage />
        </ProtectedRoute>
    );
}
