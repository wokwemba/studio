
'use client';

import { useState, useMemo, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader, Wand2, BarChart, AlertTriangle, Sigma, Banknote, GitBranch, Search, Share2, Users, FileText, Globe, Shield, MessageSquare, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { detectSmsFraud, type SmsFraudOutput, type SmsFraudInput } from '@/ai/flows/sms-fraud-flow';
import { detectEmailPhishing, type EmailPhishingInput, type EmailPhishingOutput } from '@/ai/flows/email-phishing-flow';
import { detectWhatsappFraud, type WhatsappFraudInput, type WhatsappFraudOutput } from '@/ai/flows/whatsapp-fraud-flow';
import { runRiskDetectionAnalysis, type RiskDetectionMapOutput } from '@/ai/flows/osint-mind-map-flow';
import { MindMapNode } from '@/components/phishing-engine/mind-map-node';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
};

const iconMap = {
    emailAnalysis: FileText,
    domainAnalysis: Globe,
    usernameAnalysis: Users,
    phoneAnalysis: Phone,
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

export default function PhishingEngineDashboard() {
    // State for SMS Analysis
    const [smsFormData, setSmsFormData] = useState<SmsFraudInput>({ senderId: '', message: '' });
    const [smsAnalysisResult, setSmsAnalysisResult] = useState<SmsFraudOutput | null>(null);
    const [isAnalyzingSms, setIsAnalyzingSms] = useState(false);
    
    // State for Email Analysis
    const [emailFormData, setEmailFormData] = useState<EmailPhishingInput>({ sender: '', subject: '', body: '' });
    const [emailAnalysisResult, setEmailAnalysisResult] = useState<EmailPhishingOutput | null>(null);
    const [isAnalyzingEmail, setIsAnalyzingEmail] = useState(false);
    
    // State for WhatsApp Analysis
    const [whatsappFormData, setWhatsappFormData] = useState<WhatsappFraudInput>({ sender: '', message: '' });
    const [whatsappAnalysisResult, setWhatsappAnalysisResult] = useState<WhatsappFraudOutput | null>(null);
    const [isAnalyzingWhatsapp, setIsAnalyzingWhatsapp] = useState(false);

    // State for Risk Detection Map
    const [target, setTarget] = useState('example.com');
    const [isRiskMapping, setIsRiskMapping] = useState(false);
    const [riskMapError, setRiskMapError] = useState<string | null>(null);
    const [riskMapResults, setRiskMapResults] = useState<RiskDetectionMapOutput | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['Email Analysis', 'Domain WHOIS', 'Data Breach Exposure', 'Phone Number Lookup']));

    // Common Hooks
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    // SMS Analysis Data Fetching
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


    const handleSmsAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!smsFormData.message.trim() || !smsFormData.senderId.trim() || !user || !firestore) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide both Sender ID and Message text.' });
            return;
        }
        setIsAnalyzingSms(true);
        setSmsAnalysisResult(null);
        try {
            const result = await detectSmsFraud(smsFormData);
            setSmsAnalysisResult(result);
            const analysisRecord = { ...smsFormData, ...result, userId: user.uid, analyzedAt: new Date().toISOString() };
            const analysesCollection = collection(firestore, `users/${user.uid}/sms_analyses`);
            await addDocumentNonBlocking(analysesCollection, analysisRecord);
            toast({ title: 'Analysis Complete', description: `The message was rated as ${result.verdict}.` });
        } catch (error: any) {
            console.error("SMS Analysis failed:", error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message || 'The AI service may be temporarily unavailable.' });
        } finally {
            setIsAnalyzingSms(false);
        }
    };
    
    const handleEmailAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!emailFormData.body.trim() || !emailFormData.sender.trim()) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide at least a Sender and Body for the email.' });
            return;
        }
        setIsAnalyzingEmail(true);
        setEmailAnalysisResult(null);
        try {
            const result = await detectEmailPhishing(emailFormData);
            setEmailAnalysisResult(result);
            toast({ title: 'Email Analysis Complete', description: `The email was rated as ${result.verdict}. Recommended action: ${result.recommendedAction}` });
        } catch (error: any) {
            console.error("Email Analysis failed:", error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message || 'The AI service may be temporarily unavailable.' });
        } finally {
            setIsAnalyzingEmail(false);
        }
    };
    
    const handleWhatsappAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!whatsappFormData.message.trim() || !whatsappFormData.sender.trim()) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide both a Sender and Message for WhatsApp.' });
            return;
        }
        setIsAnalyzingWhatsapp(true);
        setWhatsappAnalysisResult(null);
        try {
            const result = await detectWhatsappFraud(whatsappFormData);
            setWhatsappAnalysisResult(result);
            toast({ title: 'WhatsApp Analysis Complete', description: `The message was rated as ${result.verdict}.` });
        } catch (error: any) {
            console.error("WhatsApp Analysis failed:", error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message || 'The AI service may be temporarily unavailable.' });
        } finally {
            setIsAnalyzingWhatsapp(false);
        }
    };

    const handleCategoryChange = (category: string, checked: boolean | 'indeterminate') => {
        const newSelected = new Set(selectedCategories);
        if (checked) newSelected.add(category);
        else newSelected.delete(category);
        setSelectedCategories(newSelected);
    };

    const handleOsintAnalyze = async (e: FormEvent) => {
        e.preventDefault();
        if (!target.trim()) {
            toast({ variant: 'destructive', title: 'Target Required', description: 'Please enter a target to analyze.' });
            return;
        }
        if (selectedCategories.size === 0) {
            toast({ variant: 'destructive', title: 'Categories Required', description: 'Please select at least one category to investigate.' });
            return;
        }
        setIsRiskMapping(true);
        setRiskMapError(null);
        setRiskMapResults(null);
        try {
            const analysisResults = await runRiskDetectionAnalysis({ target, categories: Array.from(selectedCategories) });
            setRiskMapResults(analysisResults);
        } catch (err: any) {
            console.error("OSINT Analysis failed:", err);
            setRiskMapError(err.message || 'The AI service may be temporarily unavailable.');
        } finally {
            setIsRiskMapping(false);
        }
    };

    const riskBadgeVariant: Record<string, 'success' | 'outline' | 'destructive' | 'default'> = {
        'Low Risk': 'success',
        'Medium Risk': 'outline',
        'High Risk': 'destructive',
        'Malicious': 'destructive',
    };
    
    const resultEntries = riskMapResults ? Object.entries(riskMapResults).filter(([key, value]) => key !== 'targetType' && value) : [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Phishing Detector Engine</h1>
             <Tabs defaultValue="sms-analysis">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sms-analysis">SMS Fraud</TabsTrigger>
                    <TabsTrigger value="email-phishing">Email Phishing</TabsTrigger>
                    <TabsTrigger value="whatsapp-analysis">WhatsApp Fraud</TabsTrigger>
                    <TabsTrigger value="risk-detection">OSINT Map</TabsTrigger>
                </TabsList>

                <TabsContent value="sms-analysis" className="mt-6">
                    <div className="space-y-6">
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Analyzed</CardTitle><Sigma className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.total}</div><p className="text-xs text-muted-foreground">transactions analyzed</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">High-Risk Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.highRisk}</div><p className="text-xs text-muted-foreground">transactions flagged</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Average Risk Score</CardTitle><BarChart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.avgScore.toFixed(1)}%</div><p className="text-xs text-muted-foreground">average calculated risk</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Potential Fraud Value</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Ksh {metrics.potentialFraudValue.toLocaleString()}</div><p className="text-xs text-muted-foreground">from high-risk transactions</p></CardContent></Card>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader><CardTitle>Analyze SMS Message</CardTitle><CardDescription>Enter an SMS message and sender ID to check for fraud.</CardDescription></CardHeader>
                                <form onSubmit={handleSmsAnalyze}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2"><Label htmlFor="senderId">Sender ID</Label><Input id="senderId" placeholder="e.g., MPESA or +254712345678" value={smsFormData.senderId} onChange={e => setSmsFormData({...smsFormData, senderId: e.target.value})} disabled={isAnalyzingSms} /></div>
                                        <div className="space-y-2"><Label htmlFor="message">Message Text</Label><Textarea id="message" placeholder="Paste the SMS message here..." className="min-h-32" value={smsFormData.message} onChange={e => setSmsFormData({...smsFormData, message: e.target.value})} disabled={isAnalyzingSms} /></div>
                                    </CardContent>
                                    <CardFooter className="flex-col items-start gap-4">
                                        <Button type="submit" disabled={isAnalyzingSms || !smsFormData.message || !smsFormData.senderId}><mrowisAnalyzingSms && <Loader className="mr-2 h-4 w-4 animate-spin" />}Analyze Message</Button>
                                        <div className="space-y-2"><Label className="text-xs text-muted-foreground">Quick Test</Label><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setSmsFormData(exampleMessages.legit)}>Load Legitimate Example</Button><Button type="button" variant="outline" size="sm" onClick={() => setSmsFormData(exampleMessages.fraud)}>Load Fraudulent Example</Button></div></div>
                                    </CardFooter>
                                </form>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Analysis Result</CardTitle><CardDescription>The AI-powered verdict on your submitted message.</CardDescription></CardHeader>
                                <CardContent className="min-h-[300px] flex items-center justify-center">
                                    {isAnalyzingSms ? <Loader className="w-8 h-8 animate-spin" /> : !smsAnalysisResult ? <p className="text-sm text-muted-foreground">Submit a message to see the analysis here.</p> :
                                    <div className="space-y-4 w-full">
                                        <div className="flex justify-between items-center"><h3 className="text-lg font-bold">{smsAnalysisResult.verdict}</h3><Badge variant={riskBadgeVariant[smsAnalysisResult.verdict] || 'secondary'}>{smsAnalysisResult.riskScore.toFixed(0)}%</Badge></div>
                                        <p className="text-sm text-muted-foreground">{smsAnalysisResult.explanation}</p>
                                        <div><h4 className="font-semibold text-sm">Indicators:</h4><ul className="list-disc list-inside text-sm text-muted-foreground">{smsAnalysisResult.indicators.map((ind, i) => <li key={i}>{ind}</li>)}</ul></div>
                                        {smsAnalysisResult.potentialFraudAmount && (<p className="text-sm font-semibold">Potential Fraudulent Amount: <span className="font-bold text-destructive">{smsAnalysisResult.currency} {smsAnalysisResult.potentialFraudAmount.toLocaleString()}</span></p>)}
                                    </div>}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="email-phishing" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Analyze Email</CardTitle><CardDescription>Enter email details to check for phishing attempts.</CardDescription></CardHeader>
                            <form onSubmit={handleEmailAnalyze}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor="emailSender">Sender</Label><Input id="emailSender" placeholder="e.g., security-update@yourbank.com" value={emailFormData.sender} onChange={e => setEmailFormData({...emailFormData, sender: e.target.value})} disabled={isAnalyzingEmail} /></div>
                                    <div className="space-y-2"><Label htmlFor="emailSubject">Subject</Label><Input id="emailSubject" placeholder="e.g., Urgent: Action Required on Your Account" value={emailFormData.subject} onChange={e => setEmailFormData({...emailFormData, subject: e.target.value})} disabled={isAnalyzingEmail} /></div>
                                    <div className="space-y-2"><Label htmlFor="emailBody">Body</Label><Textarea id="emailBody" placeholder="Paste the full email body here..." className="min-h-48" value={emailFormData.body} onChange={e => setEmailFormData({...emailFormData, body: e.target.value})} disabled={isAnalyzingEmail} /></div>
                                </CardContent>
                                <CardFooter><Button type="submit" disabled={isAnalyzingEmail || !emailFormData.body}><mrowisAnalyzingEmail && <Loader className="mr-2 h-4 w-4 animate-spin" />}Analyze Email</Button></CardFooter>
                            </form>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Email Analysis Result</CardTitle><CardDescription>The AI-powered verdict on the submitted email.</CardDescription></CardHeader>
                            <CardContent className="min-h-[300px] flex items-center justify-center">
                                {isAnalyzingEmail ? <Loader className="w-8 h-8 animate-spin" /> : !emailAnalysisResult ? <p className="text-sm text-muted-foreground">Submit an email to see the analysis here.</p> :
                                <div className="space-y-4 w-full">
                                    <div className="flex justify-between items-center"><h3 className="text-lg font-bold">{emailAnalysisResult.verdict}</h3><Badge variant={riskBadgeVariant[emailAnalysisResult.verdict] || 'secondary'}>{emailAnalysisResult.riskScore.toFixed(0)}%</Badge></div>
                                    <p className="text-sm text-muted-foreground">{emailAnalysisResult.explanation}</p>
                                    <div><h4 className="font-semibold text-sm">Indicators:</h4><ul className="list-disc list-inside text-sm text-muted-foreground">{emailAnalysisResult.indicators.map((ind, i) => <li key={i}>{ind}</li>)}</ul></div>
                                    <p className="text-sm font-semibold">Recommended Action: <span className="font-bold text-primary">{emailAnalysisResult.recommendedAction}</span></p>
                                </div>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="whatsapp-analysis" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Analyze WhatsApp Message</CardTitle><CardDescription>Enter a WhatsApp message to check for scams.</CardDescription></CardHeader>
                            <form onSubmit={handleWhatsappAnalyze}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor="waSender">Sender Number</Label><Input id="waSender" placeholder="e.g., +254712345678" value={whatsappFormData.sender} onChange={e => setWhatsappFormData({...whatsappFormData, sender: e.target.value})} disabled={isAnalyzingWhatsapp} /></div>
                                    <div className="space-y-2"><Label htmlFor="waMessage">Message Text</Label><Textarea id="waMessage" placeholder="Paste the WhatsApp message here..." className="min-h-32" value={whatsappFormData.message} onChange={e => setWhatsappFormData({...whatsappFormData, message: e.target.value})} disabled={isAnalyzingWhatsapp} /></div>
                                </CardContent>
                                <CardFooter><Button type="submit" disabled={isAnalyzingWhatsapp || !whatsappFormData.message}><mrowisAnalyzingWhatsapp && <Loader className="mr-2 h-4 w-4 animate-spin" />}Analyze Message</Button></CardFooter>
                            </form>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>WhatsApp Analysis Result</CardTitle><CardDescription>The AI-powered verdict on the submitted message.</CardDescription></CardHeader>
                            <CardContent className="min-h-[300px] flex items-center justify-center">
                                {isAnalyzingWhatsapp ? <Loader className="w-8 h-8 animate-spin" /> : !whatsappAnalysisResult ? <p className="text-sm text-muted-foreground">Submit a message to see the analysis here.</p> :
                                <div className="space-y-4 w-full">
                                    <div className="flex justify-between items-center"><h3 className="text-lg font-bold">{whatsappAnalysisResult.verdict}</h3><Badge variant={riskBadgeVariant[whatsappAnalysisResult.verdict] || 'secondary'}>{whatsappAnalysisResult.riskScore.toFixed(0)}%</Badge></div>
                                    <p className="text-sm text-muted-foreground">{whatsappAnalysisResult.explanation}</p>
                                    <div><h4 className="font-semibold text-sm">Indicators:</h4><ul className="list-disc list-inside text-sm text-muted-foreground">{whatsappAnalysisResult.indicators.map((ind, i) => <li key={i}>{ind}</li>)}</ul></div>
                                </div>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="risk-detection" className="mt-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><GitBranch />Risk Detection Map</CardTitle>
                                <CardDescription>Enter a target and select categories to generate a simulated Open-Source Intelligence report.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleOsintAnalyze}>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="osint-target">Target</Label>
                                            <div className="flex gap-2">
                                                <Input id="osint-target" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g., example.com, user@test.com, or +254712345678" disabled={isRiskMapping} />
                                                <Button type="submit" disabled={isRiskMapping} className="w-32">{isRiskMapping ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}<span className="ml-2 hidden sm:inline">Analyze</span></Button>
                                            </div>
                                        </div>
                                        <Accordion type="single" collapsible><AccordionItem value="item-1"><AccordionTrigger>Investigation Categories ({selectedCategories.size} selected)</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex gap-2 mb-4 px-2"><Button type="button" size="sm" variant="outline" onClick={() => setSelectedCategories(new Set(osintCategories))}>Select All</Button><Button type="button" size="sm" variant="outline" onClick={() => setSelectedCategories(new Set())}>Deselect All</Button></div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">{osintCategories.map(category => (<div key={category} className="flex items-center space-x-2"><Checkbox id={category} checked={selectedCategories.has(category)} onCheckedChange={(checked) => handleCategoryChange(category, checked)} /><Label htmlFor={category} className="text-sm font-normal cursor-pointer">{category}</Label></div>))}</div>
                                            </AccordionContent>
                                        </AccordionItem></Accordion>
                                    </div>
                                </CardContent>
                            </form>
                        </Card>

                        {isRiskMapping && (<Card><CardContent className="p-8 flex flex-col items-center justify-center gap-4"><Loader className="w-10 h-10 animate-spin text-primary" /><p className="text-muted-foreground">AI is running the analysis...</p></CardContent></Card>)}
                        {riskMapError && (<Card className="bg-destructive/10 border-destructive"><CardHeader><CardTitle>Analysis Failed</CardTitle></CardHeader><CardContent><p>{riskMapError}</p></CardContent></Card>)}
                        {riskMapResults && (
                            <div className="relative min-h-[500px] flex items-center justify-center">
                                <MindMapNode title={target} isCentral><p className="text-xs text-center text-muted-foreground capitalize">Target: {riskMapResults.targetType}</p></MindMapNode>
                                <div className="absolute inset-0 w-full h-full">
                                    {resultEntries.map(([key, value], index) => {
                                        const angle = (index / resultEntries.length) * 2 * Math.PI;
                                        const x = 50 + 40 * Math.cos(angle);
                                        const y = 50 + 35 * Math.sin(angle);
                                        const Icon = (iconMap as any)[key] || GitBranch;
                                        return (
                                            <div key={key} className="absolute" style={{left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)'}}>
                                                <MindMapNode title={key.replace(/([A-Z])/g, ' $1')} icon={Icon}>
                                                    <p className="text-xs font-semibold italic text-muted-foreground mb-2">&quot;{value.summary}&quot;</p>
                                                    <ul className="text-xs list-disc list-inside space-y-1">{value.data.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
                                                </MindMapNode>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
