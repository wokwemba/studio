
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, Wand2, BarChart, AlertTriangle, Sigma, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { detectSmsFraud } from '@/ai/flows/sms-fraud-flow';
import type { SmsFraudOutput, SmsFraudInput } from '@/ai/flows/schemas/sms-fraud-schema';

type SmsAnalysis = SmsFraudOutput & {
    id: string;
    senderId: string;
    message: string;
    analyzedAt: string; // ISO string
};

const exampleMessages = {
    legit: {
        senderId: 'Hustler Fund',
        message: 'Dear Customer, you have an overdue Hustler Fund loan of KES 1617.61 that was due on 24/11/2025. Please dial *254# to repay and grow your credit limit.'
    },
    fraud: {
        senderId: '27128',
        message: 'Dear customer, Do not forget your subscription to Baseplay Games & Apps for Ksh 20.0/day. To access your account and enjoy the service visit https://bzm.tv/s/J38ro75iw.644. Cancel? Send STOPBG to 27128. Help? support@baseplay.co'
    }
}

export default function PhishingEngineDashboard() {
    const [formData, setFormData] = useState<SmsFraudInput>({ senderId: '', message: '' });
    const [analysisResult, setAnalysisResult] = useState<SmsFraudOutput | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const analysesQuery = useMemoFirebase(
        () => (user ? query(collection(firestore, `users/${user.uid}/sms_analyses`), orderBy('analyzedAt', 'desc')) : null),
        [user, firestore]
    );
    const { data: analyses, isLoading: analysesLoading } = useCollection<SmsAnalysis>(analysesQuery);

    const metrics = useMemo(() => {
        if (!analyses) return { total: 0, highRisk: 0, avgScore: 0, potentialFraudValue: 0 };

        const total = analyses.length;
        const highRisk = analyses.filter(a => a.verdict === 'High Risk').length;
        const avgScore = total > 0 ? analyses.reduce((sum, a) => sum + a.riskScore, 0) / total : 0;
        const potentialFraudValue = analyses
            .filter(a => a.verdict === 'High Risk' && a.potentialFraudAmount)
            .reduce((sum, a) => sum + (a.potentialFraudAmount || 0), 0);

        return { total, highRisk, avgScore, potentialFraudValue };
    }, [analyses]);


    const handleAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.message.trim() || !formData.senderId.trim() || !user || !firestore) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide both Sender ID and Message text.' });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await detectSmsFraud(formData);
            setAnalysisResult(result);

            const analysisRecord = {
                ...formData,
                ...result,
                userId: user.uid,
                analyzedAt: new Date().toISOString(),
            };

            const analysesCollection = collection(firestore, `users/${user.uid}/sms_analyses`);
            await addDocumentNonBlocking(analysesCollection, analysisRecord);

            toast({ title: 'Analysis Complete', description: `The message was rated as ${result.verdict}.` });

        } catch (error: any) {
            console.error("Analysis failed:", error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message || 'The AI service may be temporarily unavailable.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const riskBadgeVariant: Record<string, 'success' | 'outline' | 'destructive'> = {
        'Low Risk': 'success',
        'Medium Risk': 'outline',
        'High Risk': 'destructive',
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">SMS Fraud Detection Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Analyzed</CardTitle><Sigma className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.total}</div><p className="text-xs text-muted-foreground">transactions analyzed</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">High-Risk Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.highRisk}</div><p className="text-xs text-muted-foreground">transactions flagged</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Average Risk Score</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.avgScore.toFixed(1)}%</div><p className="text-xs text-muted-foreground">average calculated risk</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Potential Fraud Value</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Ksh {metrics.potentialFraudValue.toLocaleString()}</div><p className="text-xs text-muted-foreground">from high-risk transactions</p></CardContent></Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Analyze SMS Message</CardTitle>
                        <CardDescription>Enter an SMS message and sender ID to check for fraud.</CardDescription>
                    </CardHeader>
                     <form onSubmit={handleAnalyze}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="senderId">Sender ID</Label>
                                <Input id="senderId" placeholder="e.g., MPESA or +254712345678" value={formData.senderId} onChange={e => setFormData({...formData, senderId: e.target.value})} disabled={isAnalyzing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message Text</Label>
                                <Textarea id="message" placeholder="Paste the SMS message here..." className="min-h-32" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} disabled={isAnalyzing} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4">
                            <Button type="submit" disabled={isAnalyzing || !formData.message || !formData.senderId}>
                                {isAnalyzing && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Analyze Message
                            </Button>
                             <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Quick Test</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setFormData(exampleMessages.legit)}>Load Legitimate Example</Button>
                                    <Button variant="outline" size="sm" onClick={() => setFormData(exampleMessages.fraud)}>Load Fraudulent Example</Button>
                                </div>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Result</CardTitle>
                        <CardDescription>The AI-powered verdict on your submitted message.</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[300px] flex items-center justify-center">
                        {isAnalyzing ? <Loader className="w-8 h-8 animate-spin" /> :
                         !analysisResult ? <p className="text-sm text-muted-foreground">Submit a message to see the analysis here.</p> :
                         <div className="space-y-4 w-full">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">{analysisResult.verdict}</h3>
                                <Badge variant={riskBadgeVariant[analysisResult.verdict] || 'secondary'}>{analysisResult.riskScore.toFixed(0)}%</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{analysisResult.explanation}</p>
                            <div>
                                <h4 className="font-semibold text-sm">Indicators:</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {analysisResult.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                                </ul>
                            </div>
                             {analysisResult.potentialFraudAmount && (
                                <p className="text-sm font-semibold">Potential Fraudulent Amount: <span className="font-bold text-destructive">{analysisResult.currency} {analysisResult.potentialFraudAmount.toLocaleString()}</span></p>
                            )}
                         </div>
                        }
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of recently analyzed transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                     {analysesLoading ? <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin" /></div> :
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sender</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="text-right">Risk</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analyses?.slice(0, 4).map(analysis => (
                                <TableRow key={analysis.id}>
                                    <TableCell className="font-medium">{analysis.senderId}</TableCell>
                                    <TableCell className="max-w-md truncate">{analysis.message}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={riskBadgeVariant[analysis.verdict] || 'secondary'}>{analysis.verdict} ({analysis.riskScore}%)</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {(!analyses || analyses.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No analyses yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                     </Table>
                    }
                </CardContent>
            </Card>
        </div>
    );
}
