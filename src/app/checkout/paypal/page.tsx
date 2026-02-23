'use client';

import { useEffect } from 'react';
import { Loader, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * @fileOverview PayPal Redirect Page
 * Handles automatic redirection to a secure PayPal checkout session.
 */
export default function PayPalRedirectPage() {
  useEffect(() => {
    // In a real production app, you would generate a specific PayPal Checkout URL 
    // or token here via a server action or API call.
    // For this prototype, we simulate the redirection to a PayPal checkout endpoint.
    const redirectUrl = 'https://www.paypal.com/checkoutnow?token=PROTOTYPE_CHECKOUT_TOKEN';
    
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <Card className="max-w-md w-full border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl tracking-tight">Secure Checkout</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
            <Loader className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Redirecting to PayPal...</p>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Please wait while we connect you to our secure payment processor. Do not refresh this page.
            </p>
          </div>
          
          <div className="w-full pt-4 border-t border-primary/10 flex items-center justify-center gap-2 grayscale opacity-50">
            <span className="text-[10px] font-mono uppercase tracking-widest">Powered by</span>
            <svg className="h-4 fill-current" viewBox="0 0 115 26">
                <path d="M11.3 1.1c-1.6 0-2.9.1-3.9.4-.9.3-1.7.7-2.3 1.2s-1 1.1-1.3 1.8-.4 1.5-.4 2.4c0 .8.1 1.5.4 2.1s.7 1.1 1.3 1.6 1.3.8 2.2 1.1c.9.2 2 .3 3.3.3h2.1V1.1h-3.4zm-.1 9.4c-.8 0-1.5-.1-2.1-.2s-1.1-.4-1.5-.7-.7-.7-.9-1.2-.3-1.1-.3-1.8c0-.7.1-1.3.3-1.8s.5-1 .9-1.3.9-.6 1.5-.8 1.3-.2 2.1-.2h1.1v8h-1.1zm11.4-9.4c-.8 0-1.5.1-2.1.3s-1.1.4-1.5.7-.7.7-.9 1.2-.3 1.1-.3 1.8c0 .7.1 1.3.3 1.8s.5 1 .9 1.3.9.6 1.5.8 1.3.2 2.1.2h1.1V1.1h-1.1zm-.1 9.4c-.8 0-1.5-.1-2.1-.2s-1.1-.4-1.5-.7-.7-.7-.9-1.2-.3-1.1-.3-1.8c0-.7.1-1.3.3-1.8s.5-1 .9-1.3.9.6 1.5.8 1.3.2 2.1.2h1.1v8h-1.1zm11.4-9.4c-.8 0-1.5.1-2.1.3s-1.1.4-1.5.7-.7.7-.9 1.2-.3 1.1-.3 1.8c0 .7.1 1.3.3 1.8s.5 1 .9 1.3.9.6 1.5.8 1.3.2 2.1.2h1.1V1.1h-1.1zm-.1 9.4c-.8 0-1.5-.1-2.1-.2s-1.1-.4-1.5-.7-.7-.7-.9-1.2-.3-1.1-.3-1.8c0-.7.1-1.3.3-1.8s.5-1 .9-1.3.9.6 1.5.8 1.3.2 2.1.2h1.1v8h-1.1z" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
