'use client';

import { CorporateAdminDashboard } from '@/components/admin/corporate-admin-dashboard';
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import LoadingSkeleton from '@/components/auth/LoadingSkeleton';

export default function AdminDashboardPage() {
  const { role, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (role === 'SuperAdmin') {
    return <SuperAdminDashboard />;
  }

  return <CorporateAdminDashboard />;
}
