'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';

// This is a simplification. In a real app, you'd fetch this dynamically
// or have it configured.
const DEFAULT_TENANT_ID = 'default-tenant-cyberaegis';

const createUserProfile = async (userCredential: UserCredential): Promise<UserCredential> => {
    const user = userCredential.user;
    const db = getFirestore(user.auth.app);
    const userDocRef = doc(db, 'users', user.uid);

    // Assign role based on email
    let roleId = ROLES.USER;
    if (user.email === 'wokwemba@safaricom.co.ke') {
        roleId = ROLES.ADMIN;
    } else if (user.email === 'super@admin.com') { // Example for super admin
        roleId = ROLES.SUPER_ADMIN;
    }


    const newUserProfile = {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'New User',
        tenantId: DEFAULT_TENANT_ID,
        roleId: roleId,
        status: 'Active',
        risk: 'Low',
        avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`, // Assign a random avatar
    };

    try {
        // Use a non-blocking write for the user profile
        setDoc(userDocRef, newUserProfile).catch(error => {
            console.error("Non-blocking profile creation failed:", error);
            // Even though it's non-blocking, we can still report the error
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        return userCredential; // Return immediately
    } catch (error) {
        console.error("Failed to initiate user profile creation:", error);
        // This synchronous catch might not be hit if setDoc is fully async,
        // but it's good practice to keep it.
        throw error;
    }
};

/** Creates a new user with email and password and sets up their profile. */
export async function signUpWithEmail(auth: Auth, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential);
    return { success: true };
  } catch (error: any) {
    console.error("Email sign-up failed:", error);
    if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email is already registered. Please sign in instead.' };
    }
    return { success: false, error: 'An unexpected error occurred during sign up.' };
  }
}

/** Signs in an existing user with email and password. */
export async function signInWithEmail(auth: Auth, email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email sign-in failed:", error);
    throw error;
  }
}
