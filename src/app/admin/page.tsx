'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader, Wand2 } from 'lucide-react';
import {
  generateAndStoreTrainingCampaigns,
  GenerateAndStoreTrainingCampaignsOutput,
} from '@/ai/flows/generate-training-campaigns';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { TrainingCampaign } from '@/app/training/data';
import { useMemoFirebase } from '@/firebase/provider';
import Link from 'next/link';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [generationResult, setGenerationResult] =
    useState<GenerateAndStoreTrainingCampaignsOutput | null>(null);

  const firestore = useFirestore();
  const campaignsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'trainingCampaigns') : null),
    [firestore]
  );
  const { data: campaigns, isLoading: campaignsLoading } =
    useCollection<TrainingCampaign>(campaignsCollection);

  const handleGenerateCampaigns = async () => {
    setLoading(true);
    setGenerationResult(null);
    try {
      const result = await generateAndStoreTrainingCampaigns({});
      setGenerationResult(result);
    } catch (error) {
      console.error('Failed to generate campaigns:', error);
      setGenerationResult({
        success: false,
        message: 'An error occurred during campaign generation.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s training and security posture.
          </p>
        </div>
        <Button onClick={handleGenerateCampaigns} disabled={loading}>
          {loading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Training Campaigns
        </Button>
      </div>

      {generationResult && (
        <Card
          className={
            generationResult.success
              ? 'bg-success/10 border-success'
              : 'bg-destructive/10 border-destructive'
          }
        >
          <CardHeader>
            <CardTitle
              className={
                generationResult.success ? 'text-success' : 'text-destructive'
              }
            >
              {generationResult.success
                ? 'Generation Successful'
                : 'Generation Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{generationResult.message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Available Training Campaigns
          </CardTitle>
          <CardDescription>
            These are the current campaigns stored in Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="bg-background hover:bg-accent/50 transition-colors flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-headline">
                      {campaign.title}
                    </CardTitle>
                    <CardDescription className="text-xs h-10">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/training`}>View Campaign</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              No campaigns found. Generate them to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
