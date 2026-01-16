
'use client';
import { doc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { logAuditEvent } from './audit';
import type { UserProfile } from '@/app/admin/users/page';

export async function startImpersonation(
  firestore: Firestore,
  admin: { uid: string, email?: string | null, role?: string | null },
  targetUser: UserProfile
) {
  if (!firestore || !admin.uid) return;

  const impersonationRef = doc(firestore, 'admin_impersonation', admin.uid);

  await setDoc(impersonationRef, {
    targetUserId: targetUser.id,
    targetUserEmail: targetUser.email,
    startedAt: new Date().toISOString(),
  });
  
  await logAuditEvent(firestore, {
      action: 'IMPERSONATION_START',
      actor: admin,
      target: {
          type: 'USER',
          id: targetUser.id,
      },
      metadata: {
          targetEmail: targetUser.email,
      }
  });

  window.location.reload();
}

export async function stopImpersonation(firestore: Firestore, admin: { uid: string, email?: string | null, role?: string | null }) {
    if (!firestore || !admin.uid) return;
  const impersonationRef = doc(firestore, 'admin_impersonation', admin.uid);
  
  await deleteDoc(impersonationRef);

  await logAuditEvent(firestore, {
      action: 'IMPERSONATION_STOP',
      actor: admin
  });

  window.location.reload();
}
