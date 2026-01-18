'use client';

import { useState, type FormEvent } from 'react';
import {
  generateIrPlaybook,
  type GenerateIrPlaybookInput,
  type GenerateIrPlaybookOutput
} from '@/ai/flows/generate-ir-playbook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Wand2, ClipboardList, ChevronRight, GitBranch } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MindMapNode } from '@/components/phishing-engine/mind-map-node';

function IrPlaybookPage() {
    const [formData, setFormData] = useState<GenerateIrPlaybookInput>({
        incidentType: 'Ransomware Attack',
        organizationalContext: 'A mid-sized e-commerce company using a hybrid cloud environment.'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playbook, setPlaybook] = useState<GenerateIrPlaybookOutput | null>(null);

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.incidentType.trim()) return;

        setIsLoading(true);
        setError(null);
        setPlaybook(null);

        try {
            const result = await generateIrPlaybook(formData);
            setPlaybook(result);
        } catch (err: any) {
            console.error("Playbook generation failed:", err);
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
                        <Wand2 />
                        <span>AI Incident Response Playbook Generator</span>
                    </CardTitle>
                    <CardDescription>
                        Define an incident type and let AI generate a structured, best-practice playbook for your team.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleGenerate}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="incidentType">Incident Type</Label>
                                <Input 
                                    id="incidentType"
                                    value={formData.incidentType}
                                    onChange={e => setFormData({...formData, incidentType: e.target.value})}
                                    placeholder="e.g., Ransomware Attack, Data Breach"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="context">Organizational Context</Label>
                                <Input 
                                    id="context"
                                    value={formData.organizationalContext}
                                    onChange={e => setFormData({...formData, organizationalContext: e.target.value})}
                                    placeholder="e.g., A mid-sized tech company"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isLoading || !formData.incidentType}>
                            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Generating...' : 'Generate Playbook'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {isLoading && (
                 <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is drafting your playbook...</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle>Generation Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {playbook && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <ClipboardList />
                           <span>{playbook.playbookTitle}</span>
                        </CardTitle>
                        <CardDescription>{playbook.incidentSummary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="list-view">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="list-view">
                                    <ClipboardList className="mr-2" />
                                    List View
                                </TabsTrigger>
                                <TabsTrigger value="mind-map-view">
                                    <GitBranch className="mr-2" />
                                    Mind Map
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="list-view">
                                <Accordion type="multiple" defaultValue={playbook.phases.map(p => p.phaseName)} className="w-full">
                                    {playbook.phases.map((phase) => (
                                        <AccordionItem value={phase.phaseName} key={phase.phaseName}>
                                            <AccordionTrigger className="font-semibold text-lg">{phase.phaseName}</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="space-y-3 pl-4">
                                                {phase.steps.map((step, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <ChevronRight className="w-4 h-4 mt-1 text-primary" />
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                            <TabsContent value="mind-map-view">
                                <div className="relative min-h-[600px] flex items-center justify-center p-4 bg-muted/20 rounded-lg overflow-hidden">
                                    <MindMapNode title={playbook.playbookTitle} isCentral>
                                        <p className="text-xs text-center text-muted-foreground capitalize">Incident Playbook</p>
                                    </MindMapNode>
                                    <div className="absolute inset-0 w-full h-full">
                                        {playbook.phases.map((phase, index) => {
                                            const angle = (index / playbook.phases.length) * 2 * Math.PI;
                                            const x = 50 + 40 * Math.cos(angle);
                                            const y = 50 + 35 * Math.sin(angle);
                                            return (
                                                <div key={phase.phaseName} className="absolute" style={{left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)'}}>
                                                    <MindMapNode title={phase.phaseName}>
                                                        <ul className="text-xs list-disc list-inside space-y-1 text-left">
                                                            {phase.steps.map((step, i) => <li key={i}>{step}</li>)}
                                                        </ul>
                                                    </MindMapNode>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


export default function ProtectedIrPlaybookPage() {
    return (
        <ProtectedRoute>
            <IrPlaybookPage />
        </ProtectedRoute>
    );
}
