'use client';
import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, GitBranch, Search, Share2, Users, FileText, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runRiskDetectionAnalysis, type RiskDetectionMapOutput } from '@/ai/flows/osint-mind-map-flow';
import { MindMapNode } from '@/components/phishing-engine/mind-map-node';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const iconMap = {
    emailAnalysis: FileText,
    domainAnalysis: Globe,
    usernameAnalysis: Users,
    breachData: Shield,
    socialMedia: Share2,
    reputation: GitBranch,
};

const osintCategories = [
    'Username Search', 'Email Analysis', 'Domain WHOIS', 'Subdomain Enumeration', 
    'IP Address Analysis', 'Associated Social Media', 'Data Breach Exposure', 
    'Reputation Analysis', 'Associated Documents', 'Reverse Image Search', 
    'Phone Number Lookup', 'Geolocation Analysis', 'Dark Web Mentions', 
    'Company Information', 'Employee Lookup', 'Code Repository Search', 
    'Vulnerability Scan', 'DNS Records', 'Website Technology', 'Historical Archives'
];

export default function RiskDetectionMapPage() {
    const [target, setTarget] = useState('example.com');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RiskDetectionMapOutput | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['Email Analysis', 'Domain WHOIS', 'Data Breach Exposure']));
    const { toast } = useToast();

    const handleCategoryChange = (category: string, checked: boolean | 'indeterminate') => {
        const newSelected = new Set(selectedCategories);
        if (checked) {
            newSelected.add(category);
        } else {
            newSelected.delete(category);
        }
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
        } catch (err: any) {
            console.error("OSINT Analysis failed:", err);
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
                        Risk Detection Map
                    </CardTitle>
                    <CardDescription>
                        Enter a target and select categories to generate a simulated Open-Source Intelligence report.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAnalyze}>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="osint-target">Target</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="osint-target"
                                        value={target}
                                        onChange={e => setTarget(e.target.value)}
                                        placeholder="e.g., example.com, user@test.com, or testuser"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-32">
                                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        <span className="ml-2 hidden sm:inline">Analyze</span>
                                    </Button>
                                </div>
                            </div>
                             <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Investigation Categories ({selectedCategories.size} selected)</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                                        {osintCategories.map(category => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={category}
                                                    checked={selectedCategories.has(category)}
                                                    onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                                                />
                                                <Label htmlFor={category} className="text-sm font-normal cursor-pointer">{category}</Label>
                                            </div>
                                        ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </CardContent>
                </form>
            </Card>

            {isLoading && (
                 <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is running the analysis...</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle>Analysis Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {results && (
                 <div className="relative min-h-[500px] flex items-center justify-center">
                    {/* Central Node */}
                    <MindMapNode title={target} isCentral>
                        <p className="text-xs text-center text-muted-foreground capitalize">Target: {results.targetType}</p>
                    </MindMapNode>

                    {/* Lines would be complex, so we'll arrange nodes around the center */}
                    <div className="absolute inset-0 w-full h-full">
                        {resultEntries.map(([key, value], index) => {
                            const angle = (index / resultEntries.length) * 2 * Math.PI;
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 + 35 * Math.sin(angle);
                            const Icon = (iconMap as any)[key] || GitBranch;

                            return (
                                <div
                                    key={key}
                                    className="absolute"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <MindMapNode title={key.replace(/([A-Z])/g, ' $1')} icon={Icon}>
                                        <p className="text-xs font-semibold italic text-muted-foreground mb-2">&quot;{value.summary}&quot;</p>
                                        <ul className="text-xs list-disc list-inside space-y-1">
                                            {value.data.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </MindMapNode>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
