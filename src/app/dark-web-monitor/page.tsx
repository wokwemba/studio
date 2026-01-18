'use client';
import { useState, type FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, ShieldOff, Search, KeyRound, Building, MessageCircleWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { simulateDarkWebScan, type DarkWebSimulationOutput } from '@/ai/flows/dark-web-simulation-flow';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function DarkWebMonitorPage() {
    const [companyName, setCompanyName] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<DarkWebSimulationOutput | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) {
            toast({ variant: 'destructive', title: 'Company Name Required', description: 'Please enter a company name to scan.' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
            const scanResults = await simulateDarkWebScan({ companyName, keywords: keywordList });
            setResults(scanResults);
            toast({ title: 'Scan Complete', description: 'Simulated Dark Web scan finished.' });
        } catch (err: any) {
            console.error("Dark Web Scan failed:", err);
            setError(err.message || 'The AI service may be temporarily unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <ShieldOff />
                        <span>Dark Web Monitor (Simulation)</span>
                    </CardTitle>
                    <CardDescription>
                        Simulate a scan of the dark web for mentions of your company and related keywords. This is an educational tool and does not use real-time data.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAnalyze}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input 
                                    id="companyName"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="e.g., Acme Corporation"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                                <Input 
                                    id="keywords"
                                    value={keywords}
                                    onChange={e => setKeywords(e.target.value)}
                                    placeholder="e.g., acme.com, project-titan, ceo@acme.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isLoading || !companyName}>
                            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Scanning...' : 'Run Simulated Scan'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {isLoading && (
                 <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is simulating a scan of dark web sources...</p>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Simulated Scan Results for &quot;{companyName}&quot;</CardTitle>
                        <CardDescription>{results.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Credential Leaks */}
                        <section>
                            <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><KeyRound />Simulated Credential Leaks</h3>
                             {results.credentialLeaks.length > 0 ? (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Password</TableHead><TableHead>Source Breach</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {results.credentialLeaks.map((leak, i) => (
                                            <TableRow key={i} className="bg-muted/30">
                                                <TableCell>{leak.email}</TableCell>
                                                <TableCell className="font-mono">{leak.passwordMask}</TableCell>
                                                <TableCell>{leak.sourceBreach}</TableCell>
                                                <TableCell>{leak.date}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : <p className="text-sm text-muted-foreground">No simulated credential leaks found.</p>}
                        </section>
                        {/* Brand Impersonation */}
                        <section>
                            <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><Building />Simulated Brand Impersonations</h3>
                            {results.brandImpersonations.length > 0 ? (
                                <div className="space-y-3">
                                {results.brandImpersonations.map((item, i) => (
                                    <div key={i} className="p-3 border rounded-md">
                                        <p className="font-semibold">{item.platform}: <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{item.url}</a></p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No simulated brand impersonation instances found.</p>}
                        </section>
                        {/* Threat Chatter */}
                         <section>
                            <h3 className="font-headline text-lg flex items-center gap-2 mb-2"><MessageCircleWarning />Simulated Threat Chatter</h3>
                             {results.threatChatter.length > 0 ? (
                                <div className="space-y-3">
                                {results.threatChatter.map((item, i) => (
                                    <blockquote key={i} className="p-4 border-l-4 bg-muted/50">
                                        <p className="italic">&quot;{item.snippet}&quot;</p>
                                        <footer className="text-xs text-right mt-2 text-muted-foreground">
                                            - {item.author} on {item.forum}, {item.date}
                                        </footer>
                                    </blockquote>
                                ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No simulated threat chatter found.</p>}
                        </section>
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
