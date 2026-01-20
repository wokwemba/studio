
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { ALL_ROLES } from '@/lib/roles';
import type { Role as RoleType } from '@/app/admin/users/page';

type AuthContextType = {
  user: User | null;
  roles: RoleType[] | null; // Changed from single role to array
  loading: boolean;
  isImpersonating: boolean;
  realUser: User | null; // The admin's actual user object during impersonation
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: null,
  loading: true,
  isImpersonating: false,
  realUser: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  useEffect(() => {
    // Apply theme from local storage on initial load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(savedTheme);

    if (!auth || !firestore) {
      setLoading(false);
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRoles(null);
        setRealUser(null);
        setIsImpersonating(false);
        setLoading(false);
        return;
      }
      
      setRealUser(firebaseUser); // Always set the real authenticated user

      // Check for impersonation first
      const impersonationDocRef = doc(firestore, 'admin_impersonation', firebaseUser.uid);
      const impersonationSnap = await getDoc(impersonationDocRef);

      let targetUserId = firebaseUser.uid;
      let effectiveUser = firebaseUser;

      if (impersonationSnap.exists()) {
          const impersonationData = impersonationSnap.data();
          targetUserId = impersonationData.targetUserId;
          setIsImpersonating(true);
          // Create a mock user object for the impersonated user
          const impersonatedUserObject = { ...firebaseUser, uid: targetUserId, email: impersonationData.targetUserEmail };
          setUser(impersonatedUserObject as User);
          effectiveUser = impersonatedUserObject as User;
      } else {
          setUser(firebaseUser);
          setIsImpersonating(false);
      }
      
      try {
        const userRolesRef = doc(firestore, 'user_roles', targetUserId);
        const userRolesSnap = await getDoc(userRolesRef);
        
        if (userRolesSnap.exists()) {
          const userRolesData = userRolesSnap.data();
          const roleIds = userRolesData.roles || [];
          const userRolesList = roleIds.map((id: string) => ALL_ROLES.find(r => r.id === id)).filter(Boolean) as RoleType[];
          setRoles(userRolesList.length > 0 ? userRolesList : null);
        } else {
           setRoles(null);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles(null);
      }


      setLoading(false);
    });

    return unsubscribe;
  }, [auth, firestore]);

  // Derive a single "primary" role for display/legacy components
  const primaryRole = roles?.[0]?.name || 'User';

  return (
    <AuthContext.Provider value={{ user, realUser, roles, loading, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  // For backward compatibility, we can derive a single 'role'
  const primaryRole = context.roles?.[0]?.name || 'User';

  return { ...context, role: primaryRole as any };
}

  