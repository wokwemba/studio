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
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<RoleName | null>(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Fetch user role from Firestore
      try {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
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
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
