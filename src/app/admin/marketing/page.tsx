'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tenant } from '../tenants/page';

export default function AdminMarketingPage() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const tenantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tenants') : null, [firestore]);
    const { data: tenants, isLoading: tenantsLoading } = useCollection<Tenant>(tenantsQuery);

    const handleSendEmail = () => {
        if (!subject || !body) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Email',
                description: 'Please provide a subject and body for the email.'
            });
            return;
        }

        setIsSending(true);
        // Simulate a network request
        setTimeout(() => {
            setIsSending(false);
            toast({
                title: "Email Campaign Sent (Simulation)",
                description: "In a real application, this would trigger a backend service to send emails to the selected audience.",
            });
            // Reset form
            setSubject('');
            setBody('');
            setAudience('all');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Mail />
                        <span>Email Marketing & Communications</span>
                    </CardTitle>
                    <CardDescription>
                        Compose and send newsletters, promotions, or announcements to your users. This is currently a simulation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="audience">Audience</Label>
                            <Select value={audience} onValueChange={setAudience} disabled={isSending || tenantsLoading}>
                                <SelectTrigger id="audience">
                                    <SelectValue placeholder="Select an audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="subscribers">Newsletter Subscribers</SelectItem>
                                    {tenants?.map(tenant => (
                                        <SelectItem key={tenant.id} value={tenant.id}>
                                            Users in {tenant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="e.g., New Feature Announcement!"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={isSending}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Email Body</Label>
                        <Textarea
                            id="body"
                            placeholder="Compose your email here. You can use Markdown for formatting."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            disabled={isSending}
                            rows={12}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendEmail} disabled={isSending || !subject || !body}>
                        {isSending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {isSending ? 'Sending...' : `Send to ${audience === 'all' ? 'All Users' : 'Selected Audience'}`}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sent Campaigns</CardTitle>
                    <CardDescription>A log of previously sent email campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No campaigns have been sent yet.</p>
                        <p className="text-sm">Sent campaigns will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
