
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
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, Role } from '@/app/admin/users/page';
import { useToast } from '@/hooks/use-toast';
import { Loader, UserCog } from 'lucide-react';
import { useAuthContext } from '../auth/AuthProvider';
import { logAuditEvent } from '@/lib/audit';
import { ALL_ROLES, ROLE_CLIENT_USER } from '@/lib/roles';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

interface EditUserRolesDialogProps {
  user: (UserProfile & { roles: any[] }) | null;
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
    if (user) {
      const roleIds = user.roles.map(r => r.id);
      
      // If the user has no roles, default them to CLIENT_USER in the dialog
      if (roleIds.length === 0) {
        setSelectedRoles([ROLE_CLIENT_USER]);
      } else {
        setSelectedRoles(roleIds);
      }
      
      setInitialRoles(roleIds); // For audit logging purposes
    } else {
      setSelectedRoles([]);
      setInitialRoles([]);
    }
  }, [user, isOpen]);


  const handleSave = () => {
    if (!firestore || !actor || !user) return;
    setIsSaving(true);

    const userRolesDocRef = doc(firestore, 'user_roles', user.id);
    
    // Use the non-blocking fire-and-forget pattern
    setDocumentNonBlocking(userRolesDocRef, { roles: selectedRoles }, { merge: true });
    
    logAuditEvent(firestore, {
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
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
        prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  }
  
  const groupedRoles = ALL_ROLES.sort((a, b) => a.tier - b.tier).reduce((acc, role) => {
      const tierName = `Tier ${role.tier}`;
      if (!acc[tierName]) {
          acc[tierName] = [];
      }
      acc[tierName].push(role);
      return acc;
  }, {} as Record<string, typeof ALL_ROLES>);


  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCog /> Edit Roles for {user.displayName}</DialogTitle>
          <DialogDescription>
            Assign or unassign roles to this user. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
                {Object.entries(groupedRoles).map(([tier, rolesInTier]) => (
                    <div key={tier}>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground border-b pb-1">{tier}</h4>
                        <div className="space-y-3 pl-2">
                            {rolesInTier.map((role) => (
                                <div key={role.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoles.includes(role.id)}
                                        onCheckedChange={() => handleRoleToggle(role.id)}
                                        className="mt-1"
                                    />
                                    <div className='grid gap-1.5 leading-none'>
                                        <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">{role.name}</Label>
                                        <p className="text-xs text-muted-foreground">{role.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
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
