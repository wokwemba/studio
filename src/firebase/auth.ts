'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getFirestore, Firestore } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';
import type { Role } from '@/app/admin/users/page';

const DEFAULT_TENANT_ID = 'default-tenant-cyberaegis';

async function setSessionCookie(token: string, role: string) {
  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role }),
    });
  } catch (error) {
    console.error("Failed to set session cookie:", error);
    // This part runs on the client, so we can't fix headers.
    // We can show an error to the user if needed.
    throw new Error("Session setup failed. Please try again.");
  }
}

const getRoleNameFromId = async (firestore: Firestore, roleId: string): Promise<string> => {
    try {
        const roleDocRef = doc(firestore, 'roles', roleId);
        const roleDocSnap = await getDoc(roleDocRef);
        if (roleDocSnap.exists()) {
            return (roleDocSnap.data() as Role).name || 'User';
        }
        return 'User';
    } catch (error) {
        console.error("Error fetching role name:", error);
        return 'User'; // Default to 'User' on error
    }
};

const createUserProfile = async (userCredential: UserCredential): Promise<string> => {
    const user = userCredential.user;
    const db = getFirestore(user.auth.app);
    const userDocRef = doc(db, 'users', user.uid);

    let roleId = ROLES.USER;
    if (user.email === 'wokwemba@safaricom.co.ke') {
        roleId = ROLES.ADMIN;
    } else if (user.email === 'super@admin.com') {
        roleId = ROLES.SUPER_ADMIN;
    }

    const newUserProfile = {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'New User',
        tenantId: DEFAULT_TENANT_ID,
        roleId: roleId,
        status: 'Active',
        risk: 'Low',
        avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
    };

    try {
        await setDoc(userDocRef, newUserProfile);
        return await getRoleNameFromId(db, roleId);
    } catch (error) {
        console.error("Failed to create user profile:", error);
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUserProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
};

function mapFirebaseError(error: any): string {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/weak-password':
      return 'Password is too weak. It must be at least 6 characters long.';
    case 'auth/email-already-in-use':
       return 'This email is already registered. Please sign in instead.';
    default:
      console.error('Unhandled Firebase Auth Error:', error);
      return 'An unexpected error occurred. Please try again.';
  }
}

export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const db = getFirestore(auth.app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    let roleName = 'User';
    if (userDocSnap.exists()) {
        const roleId = userDocSnap.data()?.roleId;
        if (roleId) {
            roleName = await getRoleNameFromId(db, roleId);
        }
    }

    await setSessionCookie(token, roleName);
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function signUpWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const roleName = await createUserProfile(userCredential);
    const token = await userCredential.user.getIdToken();

    await setSessionCookie(token, roleName);
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}
