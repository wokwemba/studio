'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { type Role } from '@/app/admin/users/page';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuthContext } from '../auth/AuthProvider';
import { logAuditEvent } from '@/lib/audit';

interface EditUserRoleDialogProps {
  user: { id: string; name: string };
  currentRoleId: string;
  roles: Role[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditUserRoleDialog({
  user,
  currentRoleId,
  roles,
  isOpen,
  onOpenChange,
}: EditUserRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: actor, role: actorRole } = useAuthContext();

  const handleSave = async () => {
    if (!firestore || !actor) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.id);
      
      updateDocumentNonBlocking(userDocRef, { roleId: selectedRoleId });

      const oldRoleName = roles.find(r => r.id === currentRoleId)?.name;
      const newRoleName = roles.find(r => r.id === selectedRoleId)?.name;

      await logAuditEvent(firestore, {
          action: 'USER_ROLE_CHANGE',
          actor: { uid: actor.uid, email: actor.email, role: actorRole },
          target: { type: 'USER', id: user.id },
          metadata: { oldRole: oldRoleName, newRole: newRoleName }
      });


      toast({
        title: 'Role Updated',
        description: `${user.name}'s role has been changed.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: 'An error occurred while updating the user role.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role for {user.name}</DialogTitle>
          <DialogDescription>
            Select a new role for this user. This will change their permissions across the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || selectedRoleId === currentRoleId}>
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
