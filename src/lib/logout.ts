
'use client';
import { signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { logAuditEvent } from './audit';
import { useAuthContext } from '@/components/auth/AuthProvider';

export async function logout(router: AppRouterInstance) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, role } = useAuthContext();
  
  if (auth && user) {
    await logAuditEvent(firestore, {
        action: 'USER_LOGOUT',
        actor: { uid: user.uid, email: user.email, role: role },
    });
    await signOut(auth);
  }
  router.replace('/'); 
}
