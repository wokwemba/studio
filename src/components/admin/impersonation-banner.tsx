
'use client';

import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { stopImpersonation } from '@/lib/impersonation';
import { AlertTriangle } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, realUser, user, role } = useAuthContext();
  const firestore = useFirestore();

  if (!isImpersonating || !realUser) {
    return null;
  }

  const handleStopImpersonation = async () => {
    if (!firestore) return;
    await stopImpersonation(firestore, { uid: realUser.uid, email: realUser.email, role });
  }

  return (
    <div className="bg-yellow-500 text-yellow-950 p-2 text-center text-sm flex items-center justify-center gap-4">
      <AlertTriangle className="h-5 w-5" />
      <p>
        You are currently impersonating <span className="font-bold">{user?.email}</span>.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStopImpersonation}
        className="text-yellow-950 hover:bg-yellow-600 hover:text-yellow-950 h-auto p-1 px-2"
      >
        Stop Impersonating
      </Button>
    </div>
  );
}
