'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Cookie Policy</CardTitle>
            <CardDescription>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="font-headline text-2xl mb-2">1. What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit a website. They are used to remember your preferences and actions over a period of time.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">2. How We Use Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies for several purposes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> To remember your cookie consent preferences.</li>
                <li><strong>Advertising Cookies:</strong> To serve personalized advertisements through third-party vendors like Google AdSense. These cookies track your visits across websites to provide you with relevant ads.</li>
                <li><strong>Analytics Cookies:</strong> To understand how you interact with our website, which helps us improve our services.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-headline text-2xl mb-2">3. Managing Cookies</h2>
              <p className="text-muted-foreground">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
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
