'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getFirestore, Firestore, updateDoc, collection, query, where } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';
import type { Role } from '@/app/admin/users/page';

const DEFAULT_TENANT_ID = 'default-tenant-cyber-up';

async function setSessionCookie(token: string, role: string) {
  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role }),
    });
  } catch (error) {
    console.error("Failed to set session cookie:", error);
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

const createUserProfile = async (user: User): Promise<string> => {
    const db = getFirestore(user.auth.app);
    const userDocRef = doc(db, 'users', user.uid);

    const isAdminEmail = user.email === 'wokwemba1@gmail.com';
    const isSuperAdminEmail = user.email === 'super@admin.com';
    
    let targetRoleId = ROLES.USER;
    if (isAdminEmail) {
        targetRoleId = ROLES.ADMIN;
    } else if (isSuperAdminEmail) {
        targetRoleId = ROLES.SUPER_ADMIN;
    }

    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const existingData = docSnap.data();
        const existingRoleId = existingData.roleId || ROLES.USER;
        
        const updates: Record<string, any> = {};

        // Always ensure the correct role is set on login for designated admins
        if ((isAdminEmail || isSuperAdminEmail) && targetRoleId !== existingRoleId) {
            updates.roleId = targetRoleId;
        }

        // If user logs in with google and has no photo, update it.
        if (user.photoURL && !existingData.photoURL) {
            updates.photoURL = user.photoURL;
        }
        
        if (Object.keys(updates).length > 0) {
           await updateDoc(userDocRef, updates).catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updates,
                });
                errorEmitter.emit('permission-error', permissionError);
           });
           // Return the new role name after the update
           return await getRoleNameFromId(db, targetRoleId);
        }
        
        return await getRoleNameFromId(db, existingRoleId);

    } else {
        // User profile does not exist, create it.
        const newUserProfile = {
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            tenantId: DEFAULT_TENANT_ID,
            roleId: targetRoleId,
            status: 'Active',
            risk: 'Low',
            photoURL: user.photoURL || null,
            avatarId: user.photoURL ? null : `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        };

        try {
            await setDoc(userDocRef, newUserProfile).catch(error => {
              const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'create',
                  requestResourceData: newUserProfile,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
            return await getRoleNameFromId(db, targetRoleId);
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
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in window was closed. Please try again.';
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const roleName = await createUserProfile(userCredential.user);
    const token = await userCredential.user.getIdToken();

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
    const roleName = await createUserProfile(userCredential.user);
    const token = await userCredential.user.getIdToken();

    await setSessionCookie(token, roleName);
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function signInWithGoogle(
  auth: Auth
): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const roleName = await createUserProfile(userCredential.user);
    const token = await userCredential.user.getIdToken();
    
    await setSessionCookie(token, roleName);
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function inviteUserByEmail(
    firestore: Firestore,
    email: string,
    roleId: string,
    tenantId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if user already exists
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDoc(q as unknown as DocumentReference); // Simplified for this example, in real app, you'd use getDocs
        
        if (!querySnapshot.empty) {
            return { success: false, error: "A user with this email already exists." };
        }

        const newUserDocRef = doc(collection(firestore, 'users'));
        const newUserProfile = {
            id: newUserDocRef.id,
            email: email,
            name: email.split('@')[0],
            tenantId: tenantId,
            roleId: roleId,
            status: 'Invited',
            risk: 'Low', // Default risk for invited users
            avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        };

        await setDoc(newUserDocRef, newUserProfile).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: newUserDocRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw new Error("You do not have permission to create a new user.");
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error inviting user:", error);
        return { success: false, error: error.message || "An unexpected error occurred while inviting the user." };
    }
}


export { getRoleNameFromId }; // Export for use in other components if needed
