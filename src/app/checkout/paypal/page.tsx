
'use client';

import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Lock, ShieldCheck, CreditCard, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

/**
 * @fileOverview PayPal Checkout Page
 * Renders the official PayPal buttons for the "Pro" plan subscription.
 */
export default function PayPalCheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture",
  };

  const handleApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      toast({
        title: "Payment Successful!",
        description: `Thank you, ${details.payer.name.given_name}. Your account has been upgraded to Pro.`,
      });
      // In a real app, you would call a server action here to update the user's role in Firestore
      router.push('/training');
    });
  };

  const handleError = (err: any) => {
    console.error("PayPal Error:", err);
    toast({
      variant: "destructive",
      title: "Payment Error",
      description: "There was an issue processing your payment. Please try again.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Order Summary */}
        <div className="space-y-6">
          <Button variant="ghost" asChild className="-ml-4">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to plans
            </Link>
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline tracking-tight">Upgrade to Pro</h1>
            <p className="text-muted-foreground text-lg">Unleash full protection for your digital life.</p>
          </div>

          <Card className="bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">CyberGuard Pro Plan</p>
                    <p className="text-xs text-muted-foreground">Monthly Subscription</p>
                  </div>
                </div>
                <p className="font-bold font-mono">$19.99</p>
              </div>
              <div className="border-t border-primary/10 pt-4 flex justify-between items-center text-lg">
                <p className="font-bold">Total Details</p>
                <p className="font-bold font-headline text-primary">$19.99</p>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 text-[10px] text-muted-foreground p-3 rounded-b-lg flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Your transaction is secure and encrypted.
            </CardFooter>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Satisfaction Guaranteed
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl tracking-tight">Payment Method</CardTitle>
            <CardDescription>Choose how you'd like to pay</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <PayPalScriptProvider options={paypalOptions}>
              <div className="space-y-4">
                <PayPalButtons 
                  style={{ 
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'pay'
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          description: "CyberGuard Pro Plan Subscription",
                          amount: {
                            currency_code: "USD",
                            value: "19.99",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={handleApprove}
                  onError={handleError}
                />
              </div>
            </PayPalScriptProvider>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-primary/10 pt-6">
            <div className="flex items-center justify-center gap-4 grayscale opacity-50">
              <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
              <img src="https://www.paypalobjects.com/webstatic/mktg/logo/visa_37x23.jpg" alt="Visa" className="h-6" />
              <img src="https://www.paypalobjects.com/webstatic/mktg/logo/mastercard_37x23.jpg" alt="Mastercard" className="h-6" />
            </div>
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              By completing your purchase, you agree to our Terms of Service and Privacy Policy. Your subscription will renew automatically every month unless cancelled.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
