'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks();
  }

  // Directly initialize with the config to ensure connection to production services
  // and avoid potential emulator auto-detection issues in this environment.
  const firebaseApp = initializeApp(firebaseConfig);

  return getSdks();
}

export function getSdks() {
  const firebaseApp = getApps().length ? getApp() : undefined;
  // If firebaseApp is not defined, we are in a server-side context where we can't initialize it
  // Return stubs to avoid crashing the app
  if (!firebaseApp) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    } as unknown as { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore };
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export { 
    signInWithEmail,
    signUpWithEmail, 
    signInWithGoogle, 
    signInAnonymously, 
    inviteUserByEmail,
    resetInvitedUserPassword,
    updateUserStatus,
    deleteUser
} from './auth';
export * from './errors';
export * from './error-emitter';
