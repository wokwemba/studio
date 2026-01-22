
'use client';
import { doc, updateDoc, setDoc, arrayUnion, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export type ChallengeAttemptEntry = {
    challengeType: 'escape-room' | 'vuln-challenge' | 'api-lab' | 'threat-scenario';
    challengeName: string; // e.g., "Phishing Awareness" or "API1: IDOR"
    score: number;
    maxScore: number;
    percentage: number;
    completedAt: string;
};

export function saveChallengeAttempt(firestore: Firestore, user: User, attempt: Omit<ChallengeAttemptEntry, 'completedAt'>) {
    if (!firestore || !user) {
        console.error("Firestore or user not available for saving challenge attempt.");
        return;
    };
    const tenantId = (user as any).tenantId; // Assume tenantId is on the user object from AuthProvider
    if (!tenantId) {
        console.error("Could not determine tenantId for user.");
        return;
    }

    const attemptData: ChallengeAttemptEntry = {
        ...attempt,
        completedAt: new Date().toISOString(),
    };
    
    const userAttemptsDocRef = doc(firestore, 'user_challenge_attempts', user.uid);

    // Use setDoc with merge to create the document if it doesn't exist,
    // or update it if it does. arrayUnion ensures we add to the array without duplicates.
    setDoc(userAttemptsDocRef, {
        userId: user.uid,
        tenantId: tenantId,
        attempts: arrayUnion(attemptData),
        lastAttemptAt: attemptData.completedAt,
    }, { merge: true }).catch(error => {
        console.error("Failed to save challenge attempt:", error);
        // Optionally, you can emit a global error here if needed
    });
}
