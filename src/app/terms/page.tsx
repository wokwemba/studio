'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Terms of Service</CardTitle>
            <CardDescription>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="font-headline text-2xl mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using CyberGuard Studio (the "Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Our service provides AI-powered cybersecurity training and simulation tools. You understand and agree that the Service is provided "AS-IS" and that we assume no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">3. User Conduct</h2>
              <p className="text-muted-foreground">
                You agree not to use the Service to upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">4. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                You expressly understand and agree that CyberGuard Studio shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses.
              </p>
            </section>
            <div className="border-t pt-6">
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
