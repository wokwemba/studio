'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Privacy Policy</CardTitle>
            <CardDescription>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="font-headline text-2xl mb-2">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to CyberGuard Studio. Your privacy is important to us. This policy explains how we collect, use, and protect your data.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">2. Google Advertising Cookies</h2>
              <p className="text-muted-foreground">
                We use Google advertising cookies to serve ads on our site. Google and its partners may place cookies on your browser when you visit our site or other websites. These cookies allow ads to be tailored based on your previous visits to our website or other sites on the Internet. You can learn more about how Google uses this data in their <a href="https://www.google.com/policies/technologies/ads/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">3. Third-Party Vendors</h2>
              <p className="text-muted-foreground">
                Other third-party vendors and ad networks may also serve ads on our site. These vendors may use cookies to personalize ads and track user behavior.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">4. Opting Out</h2>
              <p className="text-muted-foreground">
                You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Ads Settings</a>. To opt out of other third-party vendor's use of cookies for personalized advertising, visit <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutads.info</a>.
              </p>
            </section>
             <section>
              <h2 className="font-headline text-2xl mb-2">5. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy, you can contact us at <a href="mailto:wokwemba@safaricom.co.ke" className="text-primary hover:underline">wokwemba@safaricom.co.ke</a>.
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
