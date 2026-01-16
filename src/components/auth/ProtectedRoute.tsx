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
  const { user, role, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.replace(redirectTo);
      return;
    }
    
    if (requireRole) {
      const isSuperAdmin = role === 'SuperAdmin';
      const isAdmin = role === 'Admin';
      
      let hasRequiredRole = false;
      if (requireRole === 'Admin') {
        hasRequiredRole = isAdmin || isSuperAdmin;
      } else {
        hasRequiredRole = role === requireRole;
      }

      if (!hasRequiredRole) {
        router.replace('/'); 
      }
    }

  }, [user, role, loading, router, redirectTo, requireRole]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return null; 
  }
  
  if (requireRole) {
      const isSuperAdmin = role === 'SuperAdmin';
      const isAdmin = role === 'Admin';
      let hasRequiredRole = false;
      if (requireRole === 'Admin') {
        hasRequiredRole = isAdmin || isSuperAdmin;
      } else {
        hasRequiredRole = role === requireRole;
      }

      if (!hasRequiredRole) return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
