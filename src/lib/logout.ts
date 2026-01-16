'use client';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function logout(router: AppRouterInstance) {
  const auth = useAuth();
  if (auth) {
    await signOut(auth);
  }
  router.replace('/'); 
}
