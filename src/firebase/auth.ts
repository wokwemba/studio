'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously as signInAnonymouslyFromFirebase,
  User,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { setDoc, doc, getDoc, getDocs, getFirestore, Firestore, updateDoc, collection, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';
import { ROLE_DOMAIN_ADMIN, ROLE_CLIENT_USER, ROLE_ANONYMOUS, ALL_ROLES } from '@/lib/roles';
import type { Role } from '@/app/admin/users/page';
import { logAuditEvent } from '@/lib/audit';

const DEFAULT_TENANT_ID = 'default-tenant-ccyberguard';

/**
 * Given a list of role IDs, finds the highest-tier role (tier 0 is highest).
 * @param roleIds - Array of role IDs.
 * @returns The Role object for the highest-tier role.
 */
const getPrimaryRole = (roleIds: string[]): Role | undefined => {
  if (!roleIds || roleIds.length === 0) return undefined;

  return roleIds
    .map(id => ALL_ROLES.find(r => r.id === id))
    .filter((r): r is Role => !!r)
    .sort((a, b) => a.tier - b.tier)[0];
};

/**
 * Creates user profile and role documents if they don't exist.
 * This is the single source of truth for user creation logic post-authentication.
 */
const createUserProfileAndRoles = async (user: User): Promise<string> => {
    const db = getFirestore(user.auth.app);
    const userDocRef = doc(db, 'users', user.uid);
    const userRolesRef = doc(db, 'user_roles', user.uid);

    const isAdminEmail = user.email === 'wokwemba@safaricom.co.ke';

    const userDocSnap = await getDoc(userDocRef);
    const userRolesSnap = await getDoc(userRolesRef);

    // If roles already exist, we assume the profile does too.
    // We just ensure the admin role is present if needed.
    if (userRolesSnap.exists()) {
        const currentRoleIds = userRolesSnap.data()?.roles || [];
        let roleIdsToUpdate = [...currentRoleIds];
        
        if (isAdminEmail && !roleIdsToUpdate.includes(ROLE_DOMAIN_ADMIN)) {
            roleIdsToUpdate.push(ROLE_DOMAIN_ADMIN);
            await setDoc(userRolesRef, { roles: roleIdsToUpdate }, { merge: true });
        }
        
        // Also update photoURL if it has changed from the provider
        if (userDocSnap.exists() && user.photoURL && userDocSnap.data()?.photoURL !== user.photoURL) {
            await updateDoc(userDocRef, { photoURL: user.photoURL });
        }

        const primaryRole = getPrimaryRole(roleIdsToUpdate);
        return primaryRole?.name || 'User';
    }

    // New user: create both profile and roles docs.
    let targetRoleIds = [ROLE_CLIENT_USER];
    if (isAdminEmail) {
        targetRoleIds.push(ROLE_DOMAIN_ADMIN);
    } else if (user.isAnonymous) {
        targetRoleIds = [ROLE_ANONYMOUS];
    }
    
    const newUserProfile: any = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || `Anonymous User`,
        tenantId: DEFAULT_TENANT_ID,
        status: 'Active',
        risk: 'Low',
        photoURL: user.photoURL || null,
        avatarId: user.photoURL ? null : `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
        createdAt: new Date().toISOString(),
    };
    if (user.isAnonymous) {
        newUserProfile.displayName = `Anonymous User ${user.uid.substring(0, 5)}`;
    }

    try {
        await setDoc(userDocRef, newUserProfile);
        await setDoc(userRolesRef, { roles: targetRoleIds });
        const primaryRole = getPrimaryRole(targetRoleIds);
        return primaryRole?.name || 'User';
    } catch (error) {
        console.error("Failed to create user profile/roles:", error);
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
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in window was closed. Please try again.';
    default:
      console.error('Unhandled Firebase Auth Error:', error);
      return 'An unexpected error occurred. Please try again.';
  }
}

export async function signInAnonymously(auth: Auth): Promise<{ success: boolean; role?: string; error?: string }> {
  const firestore = getFirestore(auth.app);
  try {
    const userCredential = await signInAnonymouslyFromFirebase(auth);
    const roleName = await createUserProfileAndRoles(userCredential.user);
    await logAuditEvent(firestore, {
        action: 'USER_LOGIN',
        actor: { uid: userCredential.user.uid, email: userCredential.user.email, role: 'Anonymous' },
        metadata: { method: 'anonymous' },
    });
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
  const firestore = getFirestore(auth.app);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const roleName = await createUserProfileAndRoles(userCredential.user);
     await logAuditEvent(firestore, {
        action: 'USER_LOGIN',
        actor: { uid: userCredential.user.uid, email, role: roleName },
        metadata: { method: 'email' },
    });
    return { success: true, role: roleName };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        const usersRef = collection(firestore, 'users');
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
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email), where("status", "==", "Invited"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, error: "No invited user found with this email, or account is already active." };
    }
    
    const invitedUserDoc = querySnapshot.docs[0];
    const invitedUserData = invitedUserDoc.data();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, newPassword);
        const user = userCredential.user;
        
        // Now that we have a real UID, create the final docs
        const userDocRef = doc(db, 'users', user.uid);
        const userRolesRef = doc(db, 'user_roles', user.uid);

        // Copy data from invited doc to new permanent doc
        await setDoc(userDocRef, {
            ...invitedUserData,
            status: 'Active',
            email: user.email,
            createdAt: new Date().toISOString(),
        });
        
        // Create the roles doc for the new UID
        await setDoc(userRolesRef, {
            roles: invitedUserData.roleIds || [ROLE_CLIENT_USER]
        });

        // Clean up the temporary invited user doc
        await deleteDoc(invitedUserDoc.ref);
        
        const primaryRole = getPrimaryRole(invitedUserData.roleIds || [ROLE_CLIENT_USER]);
        
        await logAuditEvent(db, {
            action: 'USER_SIGNUP',
            actor: { uid: user.uid, email: user.email, role: primaryRole?.name },
            metadata: { method: 'invited' },
        });

        return { success: true, role: primaryRole?.name };
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
  const firestore = getFirestore(auth.app);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const roleName = await createUserProfileAndRoles(userCredential.user);
    await logAuditEvent(firestore, {
        action: 'USER_SIGNUP',
        actor: { uid: userCredential.user.uid, email, role: roleName },
        metadata: { method: 'email' },
    });
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function signInWithGoogle(
  auth: Auth
): Promise<{ success: boolean; role?: string; error?: string }> {
  const firestore = getFirestore(auth.app);
  try {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const roleName = await createUserProfileAndRoles(userCredential.user);
     await logAuditEvent(firestore, {
        action: 'USER_LOGIN',
        actor: { uid: userCredential.user.uid, email: userCredential.user.email, role: roleName },
        metadata: { method: 'google.com' },
    });
    return { success: true, role: roleName };
  } catch (error: any) {
    return { success: false, error: mapFirebaseError(error) };
  }
}

export async function inviteUserByEmail(
    firestore: Firestore,
    email: string,
    roleIds: string[],
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
            displayName: email.split('@')[0],
            tenantId: tenantId,
            status: 'Invited',
            risk: 'Low',
            avatarId: `user-avatar-${Math.floor(Math.random() * 5) + 1}`,
            createdAt: new Date().toISOString(),
            // Temporarily store roles here until user accepts invite
            roleIds: roleIds 
        };
        
        const newDocRef = await addDoc(collection(firestore, "users"), newUserProfile);

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if(currentUser) {
            const primaryAdminRole = getPrimaryRole(ALL_ROLES.map(r => r.id));
            await logAuditEvent(firestore, {
                action: 'USER_INVITED',
                actor: { uid: currentUser.uid, email: currentUser.email, role: primaryAdminRole?.name },
                target: { type: 'USER', id: newDocRef.id },
                metadata: { invitedEmail: email, roleIds: roleIds }
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error inviting user:", error);
        const permissionError = new FirestorePermissionError({
            path: `users/[new_user_id]`,
            operation: 'create',
            requestResourceData: { email, roleIds, tenantId },
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
    
    // Also delete their roles document
    const userRolesRef = doc(firestore, 'user_roles', userId);
    await deleteDoc(userRolesRef);

    // Note: This does NOT delete the user from Firebase Authentication.
    // That requires a backend function (e.g., Cloud Function) for security reasons.
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user document:", error);
    return { success: false, error: "Failed to delete user data." };
  }
}
