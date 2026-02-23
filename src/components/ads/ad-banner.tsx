
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

/**
 * @fileOverview AdBanner Component
 * Intelligently displays ads ONLY for free users.
 * For paid users, it renders null to ensure a clean experience.
 */
export function AdBanner() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isVisible, setIsVisible] = useState(true);

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userData, isLoading: isDataLoading } = useDoc<any>(userDocRef);

  // If we are loading or the user is "paid", hide the ad completely.
  if (isUserLoading || isDataLoading || (userData && userData.accountType === 'paid')) {
    return null;
  }

  // Allow users to dismiss the specific banner instance, but it will return on next load
  // unless they upgrade.
  if (!isVisible) return null;

  return (
    <Card className="bg-primary/5 border-primary/20 relative group overflow-hidden">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm font-headline">Hate these ads?</p>
            <p className="text-xs text-muted-foreground">Upgrade to <span className="text-primary font-bold">PRO</span> for an ad-free experience and premium tools.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="default">
            <Link href="/checkout/paypal">
              Upgrade Now
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      </CardContent>
    </Card>
  );
}
