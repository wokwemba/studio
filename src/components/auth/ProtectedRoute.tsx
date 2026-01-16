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
    if (loading) return; // Wait for auth state to resolve

    if (!user) {
      router.replace(redirectTo);
      return;
    }
    
    // Handle role requirements
    if (requireRole) {
      const userIsSuperAdmin = role === 'SuperAdmin';
      const userIsAdmin = role === 'Admin';

      // If admin role is required, super admins also get access
      const hasRequiredRole = (requireRole === 'Admin') 
        ? (userIsAdmin || userIsSuperAdmin) 
        : role === requireRole;

      if (!hasRequiredRole) {
        router.replace('/'); // Redirect to a safe default page if role doesn't match
      }
    }

  }, [user, role, loading, router, redirectTo, requireRole]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    // This will be briefly visible before the redirect effect runs.
    return null; 
  }
  
  if (requireRole) {
      const userIsSuperAdmin = role === 'SuperAdmin';
      const userIsAdmin = role === 'Admin';
      const hasRequiredRole = (requireRole === 'Admin') 
        ? (userIsAdmin || userIsSuperAdmin) 
        : role === requireRole;
      if (!hasRequiredRole) return null;
  }

  return <>{children}</>;
}
