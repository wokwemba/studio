
'use client';

import { useMemo } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { type UserProfile, type Role } from '@/app/admin/users/page';
import { Loader } from 'lucide-react';
import { CorporateAdminDashboard } from '@/components/admin/corporate-admin-dashboard';
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';
import { ROLES } from '@/lib/roles';

export default function AdminDashboardPage() {
  const { user: currentUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const adminUserDocRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, "users", currentUser.uid) : null),
    [currentUser, firestore]
  );
  const { data: adminUserData, isLoading: isAdminUserDataLoading } = useDoc<UserProfile>(adminUserDocRef);

  const userRoleDocRef = useMemoFirebase(
    () => (firestore && adminUserData?.roleId ? doc(firestore, "roles", adminUserData.roleId) : null),
    [firestore, adminUserData]
  );
  const { data: roleData, isLoading: isRoleDataLoading } = useDoc<Role>(userRoleDocRef);

  const isLoading = isAuthLoading || isAdminUserDataLoading || isRoleDataLoading;

  const isSuperAdmin = useMemo(() => {
    if (currentUser?.email === 'wokwemba@safaricom.co.ke') return true;
    return roleData?.id === ROLES.SUPER_ADMIN;
  }, [currentUser, roleData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return <CorporateAdminDashboard />;
}
