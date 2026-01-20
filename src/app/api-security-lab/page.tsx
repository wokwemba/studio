
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader, Blocks, CheckCircle, XCircle, Wand2, Repeat } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateApiLab, type GenerateApiLabOutput } from '@/ai/flows/generate-api-lab-flow';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Combobox } from '@/components/ui/combobox';
import { roles } from '@/app/training/roles';
import { industries } from '@/app/training/industries';
import { useFirestore, useUser } from '@/firebase';
import { saveChallengeAttempt } from '@/lib/scoring';


const owaspApiCategories = [
    { group: "API1: Broken Object Level Authorization", value: "API1:2023 - Broken Object Level Authorization (General)" },
    { group: "API1: Broken Object Level Authorization", value: "API1: IDOR allowing unauthorized data access" },
    { group: "API2: Broken Authentication", value: "API2:2023 - Broken Authentication (General)" },
    { group: "API2: Broken Authentication", value: "API2: Insecure JWT implementation or validation" },
    { group: "API2: Broken Authentication", value: "API2: No rate limiting on authentication endpoints" },
    { group: "API3: Broken Object Property Level Authorization", value: "API3:2023 - Broken Object Property Level Authorization (General)" },
    { group: "API3: Broken Object Property Level Authorization", value: "API3: Mass Assignment vulnerability" },
    { group: "API4: Unrestricted Resource Consumption", value: "API4:2023 - Unrestricted Resource Consumption (General)" },
    { group: "API4: Unrestricted Resource Consumption", value: "API4: API Denial of Service via resource exhaustion" },
    { group: "API5: Broken Function Level Authorization", value: "API5:2023 - Broken Function Level Authorization (General)" },
    { group: "API5: Broken Function Level Authorization", value: "API5: User accessing admin-only API function" },
    { group: "API6: Unrestricted Access to Sensitive Business Flows", value: "API6:2023 - Unrestricted Access to Sensitive Business Flows (General)" },
    { group: "API7: Server Side Request Forgery", value: "API7:2023 - Server Side Request Forgery (General)" },
    { group: "API8: Security Misconfiguration", value: "API8:2023 - Security Misconfiguration (General)" },
    { group: "API9: Improper Inventory Management", value: "API9:2023 - Improper Inventory Management (General)" },
    { group: "API10: Unsafe Consumption of APIs", value: "API10:2023 - Unsafe Consumption of APIs (General)" },
];

function ApiSecurityLabPage() {
    const [lab, setLab] = useState<GenerateApiLabOutput | null>(null);
    const [setupConfig, setSetupConfig] = useState({
        category: owaspApiCategories[0].value,
        profession: 'Software Developer',
        industry: 'Technology',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLabStarted, setIsLabStarted] = useState(false);

    const [selectedOption, setSelectedOption] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    
    const { user } = useUser();
    const firestore = useFirestore();

    const handleStartLab = async () => {
        setIsGenerating(true);
        setError(null);
        setLab(null);
        try {
            const result = await generateApiLab(setupConfig);
            setLab(result);
            setIsLabStarted(true);
        } catch (err: any) {
            console.error("Failed to generate API lab:", err);
            setError("Sorry, we couldn't generate the lab. The AI service might be busy. Please try again.");
            setIsLabStarted(false);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmitAnswer = () => {
        if (!lab || !user || !firestore) return;
        const chosenOption = lab.options.find(opt => opt.text === selectedOption);
        if (!chosenOption) return;

        const correct = chosenOption.isCorrect;
        setIsCorrect(correct);
        setIsAnswered(true);

        saveChallengeAttempt(firestore, user, {
            challengeType: 'api-lab',
            challengeName: lab.title,
            score: correct ? 1 : 0,
            maxScore: 1,
            percentage: correct ? 100 : 0,
        });
    };

    const handleRestart = () => {
        setLab(null);
        setIsLabStarted(false);
        setError(null);
        setSelectedOption('');
        setIsAnswered(false);
        setIsCorrect(false);
    };

    const chosenOption = lab?.options.find(opt => opt.text === selectedOption);
    
    const renderSetup = () => (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Blocks className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">API Security Lab</CardTitle>
                </div>
                <CardDescription>
                    Select an OWASP API Security Top 10 vulnerability to generate a hands-on lab.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="category">Vulnerability Category</Label>
                    <Select
                        value={setupConfig.category}
                        onValueChange={(value) => setSetupConfig(prev => ({ ...prev, category: value }))}
                        disabled={isGenerating}
                    >
                        <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                        <SelectContent>
                             {Object.entries(owaspApiCategories.reduce((acc, item) => {
                                (acc[item.group] = acc[item.group] || []).push(item);
                                return acc;
                            }, {} as Record<string, typeof owaspApiCategories>)).map(([group, items]) => (
                                <SelectGroup key={group}>
                                    <Label className="px-2 py-1.5 text-xs font-semibold">{group}</Label>
                                    {items.map(item => <SelectItem key={item.value} value={item.value}>{item.value.split(' - ')[1]}</SelectItem>)}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="industry">Your Industry</Label>
                        <Combobox
                            items={industries.map(i => ({ label: i, value: i }))}
                            value={setupConfig.industry}
                            onChange={(value) => setSetupConfig(prev => ({ ...prev, industry: value }))}
                            placeholder="Select an industry..."
                            searchPlaceholder="Search industries..."
                            notfoundText="No industry found."
                            disabled={isGenerating}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="profession">Your Profession</Label>
                        <Combobox
                            items={roles.map(r => ({ label: r, value: r }))}
                            value={setupConfig.profession}
                            onChange={(value) => setSetupConfig(prev => ({ ...prev, profession: value }))}
                            placeholder="Select a profession..."
                            searchPlaceholder="Search professions..."
                            notfoundText="No profession found."
                            disabled={isGenerating}
                        />
                    </div>
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button onClick={handleStartLab} disabled={isGenerating}>
                    {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isGenerating ? 'Generating Lab...' : 'Start Lab'}
                </Button>
            </CardFooter>
        </Card>
    );
    
    const renderLab = () => (
        <Card className="max-w-4xl mx-auto overflow-hidden">
             <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Blocks className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">{lab?.title}</CardTitle>
                </div>
                <CardDescription>{setupConfig.category}</CardDescription>
            </CardHeader>
             <AnimatePresence mode="wait">
                <motion.div
                    key={lab?.title}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-muted/50 border-l-4 border-primary rounded-r-lg space-y-2">
                            <h3 className="font-headline text-lg">Scenario</h3>
                            <p className="text-muted-foreground text-sm">{lab?.scenario}</p>
                        </div>
                        
                        <div>
                             <h3 className="font-headline text-lg mb-2">Vulnerable Code</h3>
                             <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto font-code">
                                <code>{lab?.vulnerableCode}</code>
                             </pre>
                        </div>
                        
                        <div>
                             <h3 className="font-headline text-lg mb-2">Your Mission</h3>
                             <p className="text-muted-foreground text-sm">{lab?.mission}</p>
                        </div>

                        <div className="p-4 border rounded-lg">
                             <h3 className="font-headline text-lg mb-4">{lab?.question}</h3>
                             <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={isAnswered}>
                                {lab?.options.map(option => (
                                    <div key={option.text} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.text} id={option.text} />
                                        <Label htmlFor={option.text} className="cursor-pointer">{option.text}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        
                        {isAnswered && chosenOption && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className={isCorrect ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}>
                                        <CardHeader className="flex-row items-center gap-2 p-3 space-y-0">
                                            {isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
                                            <CardTitle className="text-base">{isCorrect ? 'Correct!' : 'Incorrect'}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <p className="text-sm">{chosenOption.feedback}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                    </CardContent>
                </motion.div>
             </AnimatePresence>
             <CardFooter className="bg-muted/50 p-4 justify-between">
                 <Button onClick={handleRestart} variant="ghost">
                    <Repeat className="mr-2 h-4 w-4" />
                    New Lab
                </Button>
                 {!isAnswered && (
                    <Button onClick={handleSubmitAnswer} disabled={!selectedOption}>
                        Submit Answer
                    </Button>
                 )}
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6">
            {(isGenerating) && (
                 <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is building your personal API lab...</p>
                    </CardContent>
                </Card>
            )}
            {!isGenerating && (isLabStarted ? renderLab() : renderSetup())}
        </div>
    );
}

export default function ProtectedApiSecurityLabPage() {
    return (
        <ProtectedRoute>
            <ApiSecurityLabPage />
        </ProtectedRoute>
    );
}

    