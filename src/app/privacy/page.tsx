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
            <CardTitle className="font-headline text-3xl">Privacy and Security Policy</CardTitle>
            <CardDescription>
              At CyberGuard Studio, your privacy is important to us. This policy explains how we collect and use cookies and data, particularly with respect to advertising.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="font-headline text-2xl mb-2">Google Advertising Cookies</h2>
              <p className="text-muted-foreground">
                We use Google advertising cookies to serve ads on our site. Google and its partners may place cookies on your browser when you visit our site or other websites. These cookies allow ads to be tailored based on your previous visits to our website or other sites on the Internet.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl mb-2">Third-Party Vendors</h2>
              <p className="text-muted-foreground">
                Other third-party vendors and ad networks may also serve ads on our site. These vendors may use cookies to personalize ads and track user behavior.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Google: <a href="https://www.google.com/policies/technologies/ads/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl mb-2">Opting Out</h2>
              <p className="text-muted-foreground">
                You may opt out of personalized advertising:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>For Google ads: <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ads Settings</a></li>
                <li>For other vendors: <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">About Ads</a></li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl mb-2">Cookie Consent</h2>
              <p className="text-muted-foreground">
                By using our site, you consent to the use of cookies for advertising and analytics purposes. You can control or delete cookies in your browser settings at any time.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl mb-2">Contact Us</h2>
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
