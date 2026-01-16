'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

// This page now simply redirects to the phishing engine dashboard.
export default function PhishingEngineRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/phishing-engine/dashboard');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="h-8 w-8 animate-spin" />
    </div>
  );
}
