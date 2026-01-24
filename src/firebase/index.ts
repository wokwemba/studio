// This file is now a neutral barrel file. It should NOT contain 'use client'.
// It re-exports modules, some of which are client-side. Webpack and Next.js
// will tree-shake correctly, ensuring server components don't import client code.

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
