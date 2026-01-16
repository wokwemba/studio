'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import { Loader } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
}: Props) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
