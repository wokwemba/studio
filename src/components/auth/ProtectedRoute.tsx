'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import LoadingSkeleton from './LoadingSkeleton';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  requireRole?: 'Admin' | 'SuperAdmin' | 'User';
};

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireRole,
}: Props) {
  const { user, roles, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.replace(redirectTo);
      return;
    }
    
    if (requireRole) {
      let hasRequiredRole = false;
      if (requireRole === 'Admin') {
        hasRequiredRole = roles?.some(r => 
            r.name === 'Domain Administrator' || 
            r.name === 'Security Administrator' ||
            r.name === 'Tenant Administrator'
        ) || false;
      } else {
        hasRequiredRole = roles?.some(r => r.name === requireRole) || false;
      }

      if (!hasRequiredRole) {
        router.replace('/training'); // Redirect to a safe default page
      }
    }

  }, [user, roles, loading, router, redirectTo, requireRole]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return null; 
  }
  
  if (requireRole) {
      let hasRequiredRole = false;
      if (requireRole === 'Admin') {
         hasRequiredRole = roles?.some(r => 
            r.name === 'Domain Administrator' || 
            r.name === 'Security Administrator' ||
            r.name === 'Tenant Administrator'
        ) || false;
      } else {
        hasRequiredRole = roles?.some(r => r.name === requireRole) || false;
      }

      if (!hasRequiredRole) return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
