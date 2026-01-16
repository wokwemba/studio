
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import type { Role, UserProfile } from '@/app/admin/users/page';

type RoleName = 'SuperAdmin' | 'Admin' | 'User';

type AuthContextType = {
  user: User | null;
  role: RoleName | null;
  loading: boolean;
  isImpersonating: boolean;
  realUser: User | null; // The admin's actual user object during impersonation
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isImpersonating: false,
  realUser: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleName | null>(null);
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
        setRealUser(null);
        setIsImpersonating(false);
        setLoading(false);
        return;
      }
      
      setRealUser(firebaseUser); // Always set the real authenticated user

      // Check for impersonation first
      const impersonationDocRef = doc(firestore, 'admin_impersonation', firebaseUser.uid);
      const impersonationSnap = await getDoc(impersonationDocRef);

      let targetUser: User | null = firebaseUser;
      let targetUserId = firebaseUser.uid;

      if (impersonationSnap.exists()) {
          const impersonationData = impersonationSnap.data();
          targetUserId = impersonationData.targetUserId;
          setIsImpersonating(true);
          // We can't get a full "User" object for another user on the client.
          // So we set the user to a mock-like object with the target UID.
          // The rest of the app will use this UID to fetch the impersonated user's data.
          // Note: This creates a partial User object for the impersonated user.
          // It's enough for `useUser` hooks to refetch based on the new UID.
          const impersonatedUserObject = { ...firebaseUser, uid: targetUserId, email: impersonationData.targetUserEmail };
          setUser(impersonatedUserObject as User);
      } else {
          setUser(firebaseUser);
          setIsImpersonating(false);
      }

      // Fetch role for the effective user (either real or impersonated)
      try {
        const userDocRef = doc(firestore, 'users', targetUserId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.roleId) {
            const roleDocRef = doc(firestore, 'roles', userData.roleId);
            const roleDocSnap = await getDoc(roleDocRef);
            if (roleDocSnap.exists()) {
              setRole((roleDocSnap.data() as Role).name as RoleName || 'User');
            } else {
              setRole('User'); // Default role if role doc not found
            }
          } else {
            setRole('User'); // Default role if roleId not on user
          }
        } else {
           setRole('User');
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      }


      setLoading(false);
    });

    return unsubscribe;
  }, [auth, firestore]);

  return (
    <AuthContext.Provider value={{ user, realUser, role, loading, isImpersonating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
