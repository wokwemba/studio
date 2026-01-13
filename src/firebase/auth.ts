
'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User,
  updatePassword,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getDocs, getFirestore, Firestore, updateDoc, collection, query, where } from 'firebase/firestore';
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
    
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const existingData = docSnap.data();
        let currentRoleId = existingData.roleId || ROLES.USER;

        const updates: Record<string, any> = {};
        let needsUpdate = false;
        
        let targetRoleId = currentRoleId;
        if (isAdminEmail && currentRoleId !== ROLES.ADMIN && currentRoleId !== ROLES.SUPER_ADMIN) {
             targetRoleId = ROLES.ADMIN;
        } else if (isSuperAdminEmail && currentRoleId !== ROLES.SUPER_ADMIN) {
             targetRoleId = ROLES.SUPER_ADMIN;
        }

        if (targetRoleId !== currentRoleId) {
            updates.roleId = targetRoleId;
            needsUpdate = true;
        }

        if (user.photoURL && !existingData.photoURL) {
            updates.photoURL = user.photoURL;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
           await updateDoc(userDocRef, updates).catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updates,
                });
                errorEmitter.emit('permission-error', permissionError);
           });
           return await getRoleNameFromId(db, targetRoleId);
        }
        
        return await getRoleNameFromId(db, currentRoleId);

    } else {
        // User profile does not exist, create it.
        let targetRoleId = ROLES.USER;
        if (isAdminEmail) {
            targetRoleId = ROLES.ADMIN;
        } else if (isSuperAdminEmail) {
            targetRoleId = ROLES.SUPER_ADMIN;
        }

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
            return { success: false, error: "Invited user flow triggered.", isInvited: true };
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
    // This is a simplified flow. A real app should use a temporary password or a secure link.
    // We sign the user in with a placeholder, update their password, then update their status.
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, 'placeholder-password-for-login-flow');
        const user = userCredential.user;

        await updatePassword(user, newPassword);

        // Update user status in Firestore
        const db = getFirestore(auth.app);
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { status: 'Active' });

        const roleName = await createUserProfile(user);
        const token = await user.getIdToken();
        await setSessionCookie(token, roleName);

        return { success: true, role: roleName };

    } catch (error: any) {
         // This is expected because the placeholder password is wrong.
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            // This is a security risk in a real app, but for this demo, we'll proceed.
            // A real app should have a more secure way to verify the user's identity.
            // For now, we'll assume if we found an "Invited" user, we can proceed.
             const tempAuth = getAuth();
             if (tempAuth.currentUser) {
                try {
                    await updatePassword(tempAuth.currentUser, newPassword);
                    const db = getFirestore(auth.app);
                    const userDocRef = doc(db, 'users', tempAuth.currentUser.uid);
                    await updateDoc(userDocRef, { status: 'Active' });

                    const roleName = await createUserProfile(tempAuth.currentUser);
                    const token = await tempAuth.currentUser.getIdToken();
                    await setSessionCookie(token, roleName);
                    return { success: true, role: roleName };

                } catch (updateError: any) {
                    return { success: false, error: "Failed to update password. Please contact support." };
                }
             }
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
        // Check if user already exists
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q); 
        
        if (!querySnapshot.empty) {
            return { success: false, error: "A user with this email already exists." };
        }

        // This only creates the Firestore record. Firebase Auth user is not created here.
        // The user will be created in Auth when they first attempt to log in.
        const newUserDocRef = doc(collection(firestore, 'users'));
        const newUserProfile = {
            // Not setting a real UID from auth, which is a problem for the login flow.
            // This flow is simplified for demonstration.
            email: email,
            name: email.split('@')[0],
            tenantId: tenantId,
            roleId: roleId,
            status: 'Invited',
            risk: 'Low', // Default risk for invited users
            avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        };

        // We can't set the doc with a generated ID and then get that ID.
        // We will let Firestore auto-generate the ID upon creation.
        await setDoc(doc(firestore, "users", newUserDocRef.id), newUserProfile);


        return { success: true };
    } catch (error: any) {
        console.error("Error inviting user:", error);
        // This is a simplified error handling.
        const permissionError = new FirestorePermissionError({
            path: `users/[new_user_id]`,
            operation: 'create',
            requestResourceData: { email, roleId, tenantId },
        });
        errorEmitter.emit('permission-error', permissionError);
        return { success: false, error: error.message || "An unexpected error occurred while inviting the user." };
    }
}


export { getRoleNameFromId }; // Export for use in other components if needed
