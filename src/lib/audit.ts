
'use client';
import { addDocumentNonBlocking, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useAuthContext } from "@/components/auth/AuthProvider";

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_SIGNUP'
  | 'USER_ROLE_CHANGE'
  | 'USER_INVITED'
  | 'IMPERSONATION_START'
  | 'IMPERSONATION_STOP';

export interface AuditEvent {
    action: AuditAction;
    actor: {
        uid: string;
        email?: string | null;
        role?: string | null;
    };
    target?: {
        type: string;
        id: string;
    };
    metadata?: Record<string, any>;
}

export async function logAuditEvent(firestore: any, event: Omit<AuditEvent, 'timestamp'>) {
    if (!firestore) return;

    try {
        const auditCollection = collection(firestore, 'audit_logs');
        await addDocumentNonBlocking(auditCollection, {
            ...event,
            timestamp: new Date().toISOString(),
        });
    } catch(error) {
        console.error("Failed to log audit event:", error);
    }
}
