'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). Returns a promise that resolves on success or rejects on error. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {}).catch(error => {
    console.error("Anonymous sign-in failed:", error);
    throw error;
  });
}

/** Initiate email/password sign-up (non-blocking). Returns a promise. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(authInstance, email, password).then(() => {}).catch(error => {
    console.error("Email sign-up failed:", error);
    throw error;
  });
}

/** Initiate email/password sign-in (non-blocking). Returns a promise. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {}).catch(error => {
    console.error("Email sign-in failed:", error);
    throw error;
  });
}
