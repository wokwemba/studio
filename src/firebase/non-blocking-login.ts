'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
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
        await setDoc(userDocRef, newUserProfile);
        return userCredential; // Pass through the user credential on success
    } catch (error) {
        console.error("Failed to create user profile:", error);
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUserProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw to allow the caller to handle the profile creation failure
        throw error;
    }
};


/** Initiate anonymous sign-in (non-blocking). Returns a promise that resolves on success or rejects on error. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {}).catch(error => {
    console.error("Anonymous sign-in failed:", error);
    throw error;
  });
}

/** Initiate email/password sign-up (non-blocking). Returns a promise. */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    await createUserProfile(userCredential);
  } catch (error) {
    console.error("Email sign-up failed:", error);
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). Returns a promise. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {}).catch(error => {
    console.error("Email sign-in failed:", error);
    throw error;
  });
}
