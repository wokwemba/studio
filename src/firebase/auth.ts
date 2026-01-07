'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  UserCredential,
} from 'firebase/auth';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';

// This is a simplification. In a real app, you'd fetch this dynamically
// or have it configured.
const DEFAULT_TENANT_ID = 'default-tenant-cyberaegis';

/**
 * Checks if an email is already registered in Firebase Auth.
 * @param auth The Firebase Auth instance.
 * @param email The email to check.
 * @returns {Promise<boolean>} True if the email exists, false otherwise.
 */
export async function checkEmailExists(auth: Auth, email: string): Promise<boolean> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    // In case of an error, assume the email doesn't exist to allow signup attempt,
    // which will then be caught by more specific error handling.
    return false;
  }
}

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
        setDoc(userDocRef, newUserProfile).catch(error => {
            console.error("Non-blocking profile creation failed:", error);
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        return userCredential;
    } catch (error) {
        console.error("Failed to initiate user profile creation:", error);
        throw error;
    }
};

/**
 * Maps common Firebase auth errors to user-friendly messages.
 * @param error The Firebase error object.
 * @returns A user-friendly error string.
 */
function mapFirebaseError(error: any): string {
  switch (error.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      // This case should technically not be hit with our check, but is good for robustness
      return 'No account found with this email. A new account will be created.';
    case 'auth/weak-password':
      return 'Password is too weak. It must be at least 6 characters long.';
    case 'auth/email-already-in-use':
       return 'This email is already in use. Please sign in.';
    default:
      console.error('Unhandled Firebase Auth Error:', error);
      return 'An unexpected error occurred. Please try again.';
  }
}


/**
 * Smart authentication function that either signs a user in if they exist,
 * or creates a new account if they don't.
 * @param auth The Firebase Auth instance.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An object indicating success, whether the user is new, and any error message.
 */
export async function smartAuth(
  auth: Auth,
  email: string,
  password: string
): Promise<{
  success: boolean;
  isNewUser?: boolean;
  error?: string;
}> {
  try {
    const exists = await checkEmailExists(auth, email);

    if (exists) {
      // User exists, so sign them in
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, isNewUser: false };
    } else {
      // User does not exist, so create a new account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create the user profile document in Firestore
      await createUserProfile(userCredential);
      return { success: true, isNewUser: true };
    }
  } catch (error: any) {
    return {
      success: false,
      error: mapFirebaseError(error),
    };
  }
}
