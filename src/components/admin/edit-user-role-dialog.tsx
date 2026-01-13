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

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.id);
      
      updateDocumentNonBlocking(userDocRef, { roleId: selectedRoleId });

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
