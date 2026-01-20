
'use client';
import { addDocumentNonBlocking } from '@/firebase';
import { collection, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export type ChallengeAttempt = {
    userId: string;
    tenantId: string;
    challengeType: 'escape-room' | 'vuln-challenge' | 'api-lab' | 'threat-scenario';
    challengeName: string; // e.g., "Phishing Awareness" or "API1: IDOR"
    score: number;
    maxScore: number;
    percentage: number;
    completedAt: string;
};

export function saveChallengeAttempt(firestore: Firestore, user: User, attempt: Omit<ChallengeAttempt, 'userId' | 'tenantId' | 'completedAt'>) {
    if (!firestore || !user) {
        console.error("Firestore or user not available for saving challenge attempt.");
        return;
    };
    const tenantId = (user as any).tenantId; // Assume tenantId is on the user object from AuthProvider
    if (!tenantId) {
        console.error("Could not determine tenantId for user.");
        return;
    }

    const attemptData: ChallengeAttempt = {
        ...attempt,
        userId: user.uid,
        tenantId,
        completedAt: new Date().toISOString(),
    };

    const attemptsCollection = collection(firestore, 'user_challenge_attempts');
    addDocumentNonBlocking(attemptsCollection, attemptData);
}

    