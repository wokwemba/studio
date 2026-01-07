'use client';
import { useState, type FormEvent } from 'react';
import {
  generateTrainingCampaigns,
  type GenerateTrainingCampaignsOutput,
} from '@/ai/flows/generate-training-campaigns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, GitPullRequest, List, CheckCircle, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminCampaignsPage() {
  const [topic, setTopic] = useState('Social Engineering Fundamentals');
  const [campaign, setCampaign] = useState<GenerateTrainingCampaignsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setCampaign(null);
    setError(null);

    try {
      const result = await generateTrainingCampaigns({ topic });
      setCampaign(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate campaign. The AI service may be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <GitPullRequest />
            <span>AI Training Campaign Generator</span>
          </CardTitle>
          <CardDescription>
            Enter a topic and let AI create a structured, multi-week training campaign for your organization.
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
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating Campaign...' : 'Generate Campaign'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="mt-6 text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
      )}

      {campaign && (
        <Card className="mt-6 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{campaign.title}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
            <div className="flex flex-wrap gap-4 pt-2 text-sm">
                <Badge variant="secondary">Duration: {campaign.duration}</Badge>
                <Badge variant="secondary">Audience: {campaign.audience}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><List /> Modules</h3>
              <div className="space-y-3">
                {campaign.modules.map((module) => (
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
                        {campaign.activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><BarChart /> KPIs</h3>
                    <p className="text-muted-foreground">{campaign.kpis}</p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Campaign</Button>
          </CardFooter>
        </Card>
      )}

    </div>
  );
}
