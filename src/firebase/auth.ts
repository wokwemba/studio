
'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously as signInAnonymouslyFromFirebase,
  UserCredential,
  User,
  updatePassword,
  getAuth,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getDocs, getFirestore, Firestore, updateDoc, collection, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';
import type { Role } from '@/app/admin/users/page';

const DEFAULT_TENANT_ID = 'default-tenant-ccyberguard';

async function setSessionCookie(token: string, role: string, isAnonymous: boolean = false) {
  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role, isAnonymous }),
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

    const isAdminEmail = user.email === 'wokwemba@safaricom.co.ke';
    const isSuperAdminEmail = user.email === 'super@admin.com';
    
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const existingData = docSnap.data();
        let currentRoleId = existingData.roleId || ROLES.USER;
        let roleIdToUpdate = currentRoleId;
        
        if (isAdminEmail && currentRoleId !== ROLES.ADMIN && currentRoleId !== ROLES.SUPER_ADMIN) {
            roleIdToUpdate = ROLES.ADMIN;
        } else if (isSuperAdminEmail && currentRoleId !== ROLES.SUPER_ADMIN) {
            roleIdToUpdate = ROLES.SUPER_ADMIN;
        }

        const updates: Record<string, any> = {};
        if (roleIdToUpdate !== currentRoleId) {
            updates.roleId = roleIdToUpdate;
        }

        if (user.photoURL && existingData.photoURL !== user.photoURL) {
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
           // Return the name of the role we just updated to
           return await getRoleNameFromId(db, roleIdToUpdate);
        }
        
        // If no updates, return name of current role
        return await getRoleNameFromId(db, currentRoleId);

    } else {
        // User profile does not exist, create it.
        let targetRoleId = ROLES.USER;
        if (isAdminEmail) {
            targetRoleId = ROLES.ADMIN;
        } else if (isSuperAdminEmail) {
            targetRoleId = ROLES.SUPER_ADMIN;
        }

        const newUserProfile: any = {
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'New User',
            tenantId: DEFAULT_TENANT_ID,
            roleId: targetRoleId,
            status: 'Active',
            risk: 'Low',
            photoURL: user.photoURL || null,
            avatarId: user.photoURL ? null : `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        };

        if (user.isAnonymous) {
            newUserProfile.name = `Anonymous User ${user.uid.substring(0, 5)}`;
            newUserProfile.email = null;
            newUserProfile.isAnonymous = true;
        }

        try {
            await setDoc(userDocRef, newUserProfile);
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

export async function signInAnonymously(auth: Auth): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const userCredential = await signInAnonymouslyFromFirebase(auth);
    const roleName = await createUserProfile(userCredential.user);
    const token = await userCredential.user.getIdToken();
    
    await setSessionCookie(token, roleName, true); // isAnonymous = true
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<{ success: boolean; role?: string; error?: string; isInvited?: boolean }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const roleName = await createUserProfile(userCredential.user);
    const token = await userCredential.user.getIdToken();

    await setSessionCookie(token, roleName);
    return { success: true, role: roleName };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        const db = getFirestore(auth.app);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email), where("status", "==", "Invited"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, error: "This looks like an invited account. Please follow the password creation steps.", isInvited: true };
        }
    }
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function resetInvitedUserPassword(
  auth: Auth,
  email: string,
  newPassword: string
): Promise<{ success: boolean; role?: string; error?: string }> {
    const db = getFirestore(auth.app);
    // Find the invited user document to get its ID, as we don't know the UID yet
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email), where("status", "==", "Invited"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "No invited user found with this email." };
    }
    
    // In this simplified flow, we assume the user doesn't exist in Auth yet.
    // We create them, update their profile, and then they are logged in.
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, newPassword);
        const user = userCredential.user;
        
        // The user now exists in Auth. We need to find the Firestore doc and update it.
        const userDoc = querySnapshot.docs[0]; // The doc we found earlier
        
        // We'll update the existing user document with the new UID from authentication
        // This is a simplified approach. In production, you might want to handle this differently to avoid placeholder docs.
        // For this app, we'll try to update the doc if we can, or create a new one with the UID.
        try {
            const tempDocRef = doc(db, 'users', userDoc.id);
            await deleteDoc(tempDocRef); // Remove the old doc
        } catch (e) {
            console.warn("Could not clean up temporary invited user doc:", e);
        }

        const newProfileRef = doc(db, 'users', user.uid);
        const profileData = userDoc.data();
        await setDoc(newProfileRef, {
            ...profileData, // Copy data from the invited doc
            status: 'Active',
            email: user.email, // ensure email is correct
            name: profileData.name || user.displayName,
            // tenantId, roleId, etc., are carried over from profileData
        });


        const roleName = await getRoleNameFromId(db, profileData.roleId);
        const token = await user.getIdToken();
        await setSessionCookie(token, roleName);
        
        return { success: true, role: roleName };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
             return { success: false, error: "This account seems to be active already. Please try signing in normally." };
        }
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
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q); 
        
        if (!querySnapshot.empty) {
            return { success: false, error: "A user with this email already exists." };
        }

        const newUserProfile = {
            email: email,
            name: email.split('@')[0],
            tenantId: tenantId,
            roleId: roleId,
            status: 'Invited',
            risk: 'Low',
            avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        };
        
        // Let firestore auto-generate the ID. This user doc is temporary until the user signs up.
        await addDoc(collection(firestore, "users"), newUserProfile);

        return { success: true };
    } catch (error: any) {
        console.error("Error inviting user:", error);
        const permissionError = new FirestorePermissionError({
            path: `users/[new_user_id]`,
            operation: 'create',
            requestResourceData: { email, roleId, tenantId },
        });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, error: error.message || "An unexpected error occurred while inviting the user." };
    }
}

export async function updateUserStatus(
  firestore: Firestore,
  userId: string,
  status: 'Active' | 'Suspended'
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, { status });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return { success: false, error: "Failed to update user status." };
  }
}

export async function deleteUser(
  firestore: Firestore,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await deleteDoc(userDocRef);
    // Note: This does NOT delete the user from Firebase Authentication.
    // That requires a backend function (e.g., Cloud Function) for security reasons.
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user document:", error);
    return { success: false, error: "Failed to delete user data." };
  }
}

export { getRoleNameFromId };

    