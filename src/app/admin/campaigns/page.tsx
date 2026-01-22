
'use client';
import { useState, type FormEvent, useMemo } from 'react';
import {
  generateTrainingCampaigns,
  type GenerateTrainingCampaignsOutput,
} from '@/ai/flows/generate-training-campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, GitPullRequest, List, CheckCircle, BarChart, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { ScheduleCampaignDialog } from '@/components/admin/schedule-campaign-dialog';
import { format } from 'date-fns';
import { useLocale } from '@/context/LocaleContext';

type Campaign = GenerateTrainingCampaignsOutput & {
    id: string;
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    start_date?: string;
    end_date?: string;
    tenantId: string;
    type: 'training';
}

const statusVariant: Record<Campaign['status'], 'secondary' | 'outline' | 'success' | 'default'> = {
  draft: 'secondary',
  scheduled: 'outline',
  active: 'success',
  completed: 'default',
};


export default function AdminCampaignsPage() {
  const [topic, setTopic] = useState('Social Engineering Fundamentals');
  const [generatedCampaign, setGeneratedCampaign] = useState<GenerateTrainingCampaignsOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignToSchedule, setCampaignToSchedule] = useState<Campaign | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { locale } = useLocale();

  // Memoize tenantId to avoid re-renders. This assumes tenantId on user does not change during the session.
  const tenantId = useMemo(() => (user as any)?.tenantId, [user]);

  const campaignsQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, `tenants/${tenantId}/campaigns`)) : null,
    [firestore, tenantId]
  );
  const { data: campaigns, isLoading: campaignsLoading } = useCollection<Campaign>(campaignsQuery);


  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedCampaign(null);
    setError(null);

    try {
      const result = await generateTrainingCampaigns({ topic, region: locale });
      setGeneratedCampaign(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate campaign. The AI service may be busy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!generatedCampaign || !firestore || !tenantId) return;

    setIsSaving(true);
    setError(null);
    
    try {
        const campaignCollection = collection(firestore, `tenants/${tenantId}/campaigns`);
        const newCampaign: Omit<Campaign, 'id'> = {
            ...generatedCampaign,
            status: 'draft',
            tenantId,
            type: 'training',
        }
        await addDocumentNonBlocking(campaignCollection, newCampaign);
        setGeneratedCampaign(null);
    } catch (err: any) {
        console.error('Failed to save campaign:', err);
        setError('Failed to save the campaign. Please check your permissions and try again.');
    } finally {
        setIsSaving(false);
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <GitPullRequest />
            <span>AI Training Campaign Generator</span>
          </CardTitle>
          <CardDescription>
            Enter a topic and let AI create a structured training campaign. You can then save and schedule it.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="topic">Campaign Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Advanced Phishing Defense, Supply Chain Security..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating || !topic.trim()}>
              {isGenerating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? 'Generating...' : 'Generate Campaign'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
      )}

      {generatedCampaign && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{generatedCampaign.title}</CardTitle>
            <CardDescription>{generatedCampaign.description}</CardDescription>
            <div className="flex flex-wrap gap-4 pt-2 text-sm">
                <Badge variant="secondary">Duration: {generatedCampaign.duration}</Badge>
                <Badge variant="secondary">Audience: {generatedCampaign.audience}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><List /> Modules</h3>
              <div className="space-y-3">
                {generatedCampaign.modules.map((module) => (
                  <div key={module.id} className="p-3 border rounded-md bg-muted/50">
                    <p className="font-semibold">{module.id}: {module.title}</p>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><CheckCircle /> Activities</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {generatedCampaign.activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><BarChart /> KPIs</h3>
                    <p className="text-muted-foreground">{generatedCampaign.kpis}</p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveCampaign} disabled={isSaving}>
              {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Saved Campaigns</CardTitle>
            <CardDescription>Manage your drafted and active campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
            {campaignsLoading ? (
                <div className="flex justify-center items-center h-40"><Loader className="w-8 h-8 animate-spin" /></div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Audience</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns?.map(campaign => (
                            <TableRow key={campaign.id}>
                                <TableCell className="font-medium">{campaign.title}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
                                </TableCell>
                                <TableCell>{campaign.audience}</TableCell>
                                <TableCell>
                                    {campaign.start_date && campaign.end_date ? (
                                        `${format(new Date(campaign.start_date), 'MMM d')} - ${format(new Date(campaign.end_date), 'MMM d, yyyy')}`
                                    ) : 'Not Scheduled'}
                                </TableCell>
                                <TableCell className='text-right'>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => alert('View details for ' + campaign.title)}>View Details</DropdownMenuItem>
                                            {campaign.status === 'draft' && <DropdownMenuItem onSelect={() => setCampaignToSchedule(campaign)}>Schedule</DropdownMenuItem>}
                                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>

      {campaignToSchedule && (
        <ScheduleCampaignDialog
            campaign={campaignToSchedule}
            isOpen={!!campaignToSchedule}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setCampaignToSchedule(null);
                }
            }}
        />
      )}
    </div>
  );
}
