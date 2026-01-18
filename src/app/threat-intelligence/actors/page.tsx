'use client';

import { useState, type FormEvent } from 'react';
import {
  generateThreatActorProfile,
  type GenerateThreatActorProfileInput,
  type GenerateThreatActorProfileOutput
} from '@/ai/flows/generate-threat-actor-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Wand2, Users, Shield, MapPin, Dot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const exampleActors = ["APT28 (Fancy Bear)", "FIN7", "Lazarus Group", "DarkSide"];

function ThreatActorProfilePage() {
    const [actorName, setActorName] = useState('APT28');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<GenerateThreatActorProfileOutput | null>(null);

    const handleGenerate = async (e: FormEvent) => {
        e.preventDefault();
        if (!actorName.trim()) return;

        setIsLoading(true);
        setError(null);
        setProfile(null);

        try {
            const result = await generateThreatActorProfile({ actorName });
            setProfile(result);
        } catch (err: any) {
            console.error("Profile generation failed:", err);
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
                        <Users />
                        <span>Threat Actor Profiler</span>
                    </CardTitle>
                    <CardDescription>
                        Generate a detailed profile of a known cyber threat actor using AI-powered threat intelligence.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleGenerate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="actorName">Threat Actor Name</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="actorName"
                                    value={actorName}
                                    onChange={e => setActorName(e.target.value)}
                                    placeholder="e.g., APT28, FIN7, Lazarus Group"
                                    disabled={isLoading}
                                />
                                <Button type="submit" disabled={isLoading || !actorName} className="w-40">
                                    {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    {isLoading ? 'Generating...' : 'Generate Profile'}
                                </Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Or try an example:</Label>
                            <div className="flex flex-wrap gap-2">
                                {exampleActors.map(name => (
                                    <Button key={name} type="button" size="sm" variant="outline" onClick={() => setActorName(name)} disabled={isLoading}>
                                        {name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>

            {isLoading && (
                 <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">AI is gathering threat intelligence...</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle>Generation Failed</CardTitle>
                    </CardHeader>
                    <CardContent><p>{error}</p></CardContent>
                </Card>
            )}

            {profile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{profile.actorName}</CardTitle>
                        <CardDescription>Also known as: {profile.aliases.join(', ')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground p-4 bg-muted rounded-md border">{profile.summary}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold mb-1">Motivation</p>
                                <p>{profile.motivation}</p>
                            </div>
                             <div className="p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold mb-1">Target Sectors</p>
                                <div className="flex flex-wrap gap-1">{profile.targetSectors.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                            </div>
                             <div className="p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold mb-1">Target Regions</p>
                                <div className="flex flex-wrap gap-1">{profile.targetRegions.map(r => <Badge key={r} variant="outline">{r}</Badge>)}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-headline text-lg mb-2">Key Tactics, Techniques & Procedures (TTPs)</h3>
                            <div className="space-y-3">
                                {profile.ttps.map((ttp) => (
                                    <div key={ttp.technique} className="p-4 border rounded-md">
                                        <p className="font-semibold">{ttp.technique} {ttp.mitreId && <Badge variant="destructive" className="ml-2">{ttp.mitreId}</Badge>}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{ttp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Shield/>Defensive Measures</h3>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                {profile.defensiveMeasures.map((measure, i) => (
                                    <li key={i}>{measure}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function ProtectedThreatActorProfilePage() {
    return (
        <ProtectedRoute>
            <ThreatActorProfilePage />
        </ProtectedRoute>
    );
}
