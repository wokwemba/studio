'use client';

import { CorporateAdminDashboard } from '@/components/admin/corporate-admin-dashboard';
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import LoadingSkeleton from '@/components/auth/LoadingSkeleton';

export default function AdminDashboardPage() {
  const { user, role, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Allow a specific user email to always be super admin
  const isSuperAdmin = role === 'SuperAdmin' || user?.email === 'wokwemba@safaricom.co.ke';
  
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return <CorporateAdminDashboard />;
}
