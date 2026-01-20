'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/app/admin/users/page';
import { useToast } from '@/hooks/use-toast';
import { Loader, Check, UserCog } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import { logAuditEvent } from '@/lib/audit';
import { ALL_ROLES } from '@/lib/roles';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface EditUserRolesDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditUserRoleDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialRoles, setInitialRoles] = useState<string[]>([]);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: actor } = useAuthContext();

  useEffect(() => {
    if (user && firestore) {
      const userRolesRef = doc(firestore, 'user_roles', user.id);
      getDoc(userRolesRef).then(docSnap => {
        if (docSnap.exists()) {
          const roles = docSnap.data()?.roles || [];
          setSelectedRoles(roles);
          setInitialRoles(roles);
        } else {
          setSelectedRoles([]);
          setInitialRoles([]);
        }
      });
    }
  }, [user, firestore, isOpen]);


  const handleSave = async () => {
    if (!firestore || !actor || !user) return;
    setIsSaving(true);
    try {
      const userRolesDocRef = doc(firestore, 'user_roles', user.id);
      
      updateDocumentNonBlocking(userRolesDocRef, { roles: selectedRoles });
      
      await logAuditEvent(firestore, {
          action: 'USER_ROLE_CHANGE',
          actor: { uid: actor.uid, email: actor.email },
          target: { type: 'USER', id: user.id },
          metadata: { 
              oldRoles: initialRoles.map(rId => ALL_ROLES.find(r => r.id === rId)?.name || rId),
              newRoles: selectedRoles.map(rId => ALL_ROLES.find(r => r.id === rId)?.name || rId)
          }
      });


      toast({
        title: 'Roles Updated',
        description: `${user.displayName}'s roles have been changed.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating roles',
        description: 'An error occurred while updating the user roles.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
        prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCog /> Edit Roles for {user.displayName}</DialogTitle>
          <DialogDescription>
            Assign one or more roles to this user. This will change their permissions across the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {ALL_ROLES.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                    id={role.id}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                />
                <Label htmlFor={role.id} className="font-normal cursor-pointer">{role.name}</Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
