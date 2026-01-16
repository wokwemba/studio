'use client';
import { signOut, type Auth } from 'firebase/auth';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { logAuditEvent } from './audit';
import type { User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type LogoutParams = {
    auth: Auth;
    firestore: Firestore;
    user: User;
    role: string | null;
    router: AppRouterInstance;
}

export async function logout({ auth, firestore, user, role, router }: LogoutParams) {
  if (auth && user) {
    await logAuditEvent(firestore, {
        action: 'USER_LOGOUT',
        actor: { uid: user.uid, email: user.email, role: role },
    });
    await signOut(auth);
  }
  router.replace('/'); 
}
