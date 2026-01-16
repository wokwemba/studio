
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import type { Role } from '@/app/admin/users/page';

type RoleName = 'SuperAdmin' | 'Admin' | 'User';

type AuthContextType = {
  user: User | null;
  role: RoleName | null;
  permissions: string[] | null;
  loading: boolean;
  isImpersonating: boolean;
  realUser: User | null; // The admin's actual user object during impersonation
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  permissions: null,
  loading: true,
  isImpersonating: false,
  realUser: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleName | null>(null);
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setPermissions(null);
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

      if (impersonationSnap.exists()) {
          const impersonationData = impersonationSnap.data();
          targetUserId = impersonationData.targetUserId;
          setIsImpersonating(true);
          const impersonatedUserObject = { ...firebaseUser, uid: targetUserId, email: impersonationData.targetUserEmail };
          setUser(impersonatedUserObject as User);
      } else {
          setUser(firebaseUser);
          setIsImpersonating(false);
      }

      // Fetch role and permissions for the effective user (either real or impersonated)
      try {
        const userDocRef = doc(firestore, 'users', targetUserId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.roleId) {
            const roleDocRef = doc(firestore, 'roles', userData.roleId);
            const roleDocSnap = await getDoc(roleDocRef);
            if (roleDocSnap.exists()) {
              const roleData = roleDocSnap.data() as Role;
              setRole(roleData.name as RoleName || 'User');
              setPermissions(roleData.permissions || []);
            } else {
              setRole('User');
              setPermissions([]);
            }
          } else {
            setRole('User');
            setPermissions([]);
          }
        } else {
           setRole('User');
           setPermissions([]);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
        setPermissions(null);
      }


      setLoading(false);
    });

    return unsubscribe;
  }, [auth, firestore]);

  return (
    <AuthContext.Provider value={{ user, realUser, role, permissions, loading, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
