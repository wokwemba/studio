'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  UserCredential,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getFirestore } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';
import type { Role } from '@/app/admin/users/page';


// This is a simplification. In a real app, you'd fetch this dynamically
// or have it configured.
const DEFAULT_TENANT_ID = 'default-tenant-cyberaegis';

async function setSessionCookie(token: string, role: string) {
  await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, role }),
  });
}

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

const createUserProfile = async (userCredential: UserCredential): Promise<string> => {
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
        await setDoc(userDocRef, newUserProfile);
        return roleId;
    } catch (error) {
        console.error("Failed to initiate user profile creation:", error);
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: newUserProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the error to be caught by the calling function
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


const getRoleNameFromId = async (firestore: any, roleId: string): Promise<string> => {
    const roleDocRef = doc(firestore, 'roles', roleId);
    const roleDocSnap = await getDoc(roleDocRef);
    if (roleDocSnap.exists()) {
        return (roleDocSnap.data() as Role).name || 'User';
    }
    return 'User'; // Default role if not found
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
  role?: string;
  error?: string;
}> {
  try {
    const db = getFirestore(auth.app);
    const exists = await checkEmailExists(auth, email);

    let userCredential: UserCredential;
    let isNewUser = false;

    if (exists) {
      // User exists, so sign them in
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      // User does not exist, so create a new account
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Create the user profile document in Firestore and get their roleId
      await createUserProfile(userCredential);
      isNewUser = true;
    }

    // Now that user is authenticated, get their token and role
    const token = await userCredential.user.getIdToken();
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    let roleName = 'User'; // Default role
    if (userDocSnap.exists()) {
        const roleId = userDocSnap.data()?.roleId;
        if (roleId) {
            roleName = await getRoleNameFromId(db, roleId);
        }
    }

    // Set the session cookie with the role
    await setSessionCookie(token, roleName);

    return { success: true, isNewUser, role: roleName };

  } catch (error: any) {
    return {
      success: false,
      error: mapFirebaseError(error),
    };
  }
}
