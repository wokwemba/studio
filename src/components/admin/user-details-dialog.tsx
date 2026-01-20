'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, Edit, Check, UserCheck } from 'lucide-react';
import type { UserProfile, Role } from '@/app/admin/users/page';
import type { Tenant } from '@/app/admin/tenants/page';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { useAuthContext } from '../auth/AuthProvider';
import { startImpersonation } from '@/lib/impersonation';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile & { roles: Role[] };
  isSuperAdmin: boolean;
}

const FormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  department: z.string().optional(),
  risk: z.enum(['Low', 'Medium', 'High']),
});

export function UserDetailsDialog({ isOpen, onOpenChange, user, isSuperAdmin }: UserDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { realUser: adminUser, roles: adminRoles } = useAuthContext();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
        displayName: user.displayName, 
        risk: user.risk,
        department: user.department || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore) {
        setIsEditing(false);
        return;
    };
    setIsSaving(true);
    
    try {
        const userDocRef = doc(firestore, 'users', user.id);
        const updates: Partial<UserProfile> = {};
        if (data.displayName !== user.displayName) updates.displayName = data.displayName;
        if (data.risk !== user.risk) updates.risk = data.risk;
        if (data.department !== user.department) updates.department = data.department;

        if (Object.keys(updates).length > 0) {
            updateDocumentNonBlocking(userDocRef, updates);
            toast({
                title: 'User Updated',
                description: `Successfully updated profile for ${data.displayName}.`,
            });
        }
        onOpenChange(false);
    } catch(error) {
        console.error("Error updating user:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update user profile. Please check permissions."
        })
    } finally {
        setIsSaving(false);
        setIsEditing(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setIsEditing(false);
        form.reset({ displayName: user.displayName, risk: user.risk, department: user.department || '' });
    }, 200);
  }
  
  const handleImpersonate = async () => {
    if (!firestore || !adminUser) return;
    await startImpersonation(firestore, { uid: adminUser.uid, email: adminUser.email, roles: adminRoles?.map(r => r.name) }, user);
  }

  const userAvatar = user.photoURL || PlaceHolderImages.find(p => p.id === user.avatarId)?.imageUrl || '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={userAvatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl font-headline">{form.watch('displayName')}</DialogTitle>
                <DialogDescription>{user.email}</DialogDescription>
            </div>
        </DialogHeader>

        {isEditing ? (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                              <Input placeholder="Enter user's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Finance, IT" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="risk"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Risk Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a risk level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <DialogFooter className='pt-4'>
                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        ) : (
            <>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Status</Label>
                        <div className="col-span-2"><Badge variant={user.status === 'Active' ? 'success' : user.status === 'Invited' ? 'secondary' : 'destructive'}>{user.status}</Badge></div>
                    </div>
                     <div className="grid grid-cols-3 items-start gap-4">
                        <Label className="text-right text-muted-foreground pt-1">Roles</Label>
                        <div className="col-span-2 flex flex-wrap gap-1">
                            {user.roles.map(role => <Badge key={role.id} variant="outline">{role.name}</Badge>)}
                            {user.roles.length === 0 && <span className="text-sm">No roles assigned</span>}
                        </div>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Department</Label>
                        <p className="col-span-2 font-medium">{user.department || 'N/A'}</p>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Risk Level</Label>
                         <div className="col-span-2">
                             <Badge variant={user.risk === 'Low' ? 'success' : user.risk === 'Medium' ? 'outline' : 'destructive'}>{user.risk}</Badge>
                         </div>
                    </div>
                     <div className="space-y-1">
                        <Label className="text-muted-foreground">User ID</Label>
                        <p className="font-mono text-xs bg-muted p-1 rounded break-all">{user.id}</p>
                    </div>
                </div>

                <DialogFooter>
                    {isSuperAdmin && (
                        <>
                        <Button variant="secondary" onClick={handleImpersonate}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Impersonate
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                        </>
                    )}
                    <Button onClick={handleClose}>Close</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
