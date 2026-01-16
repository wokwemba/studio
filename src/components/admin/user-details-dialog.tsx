
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
import type { UserProfile } from '@/app/admin/users/page';
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
  user: UserProfile;
  roleName: string;
  isSuperAdmin: boolean;
}

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  risk: z.enum(['Low', 'Medium', 'High']),
  assignedTenants: z.array(z.string()).optional(),
});

export function UserDetailsDialog({ isOpen, onOpenChange, user, roleName, isSuperAdmin }: UserDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { realUser: adminUser, role: adminRole } = useAuthContext();


  const tenantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tenants') : null, [firestore]);
  const { data: tenants, isLoading: tenantsLoading } = useCollection<Tenant>(tenantsQuery);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
        name: user.name, 
        risk: user.risk,
        assignedTenants: user.assignedTenants || [user.tenantId]
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
        if (data.name !== user.name) updates.name = data.name;
        if (data.risk !== user.risk) updates.risk = data.risk;
        
        // Check for changes in assigned tenants
        const initialTenants = new Set(user.assignedTenants || [user.tenantId]);
        const newTenants = new Set(data.assignedTenants || []);
        if (initialTenants.size !== newTenants.size || ![...initialTenants].every(t => newTenants.has(t))) {
            updates.assignedTenants = Array.from(newTenants);
        }

        if (Object.keys(updates).length > 0) {
            updateDocumentNonBlocking(userDocRef, updates);
            toast({
                title: 'User Updated',
                description: `Successfully updated profile for ${data.name}.`,
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
        form.reset({ name: user.name, risk: user.risk, assignedTenants: user.assignedTenants || [user.tenantId] });
    }, 200);
  }
  
  const handleImpersonate = async () => {
    if (!firestore || !adminUser) return;
    await startImpersonation(firestore, { uid: adminUser.uid, email: adminUser.email, role: adminRole }, user);
  }

  const userAvatar = user.photoURL || PlaceHolderImages.find(p => p.id === user.avatarId)?.imageUrl || '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={userAvatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl font-headline">{form.watch('name')}</DialogTitle>
                <DialogDescription>{user.email}</DialogDescription>
            </div>
        </DialogHeader>

        {isEditing ? (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
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
                     {isSuperAdmin && <FormField
                        control={form.control}
                        name="assignedTenants"
                        render={() => (
                            <FormItem>
                                <FormLabel>Tenant Assignments</FormLabel>
                                <ScrollArea className="h-40 w-full rounded-md border p-4">
                                     {tenantsLoading && <Loader className="w-4 h-4 animate-spin" />}
                                     {tenants?.map((tenant) => (
                                        <FormField
                                            key={tenant.id}
                                            control={form.control}
                                            name="assignedTenants"
                                            render={({ field }) => {
                                                return (
                                                <FormItem
                                                    key={tenant.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(tenant.id)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), tenant.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== tenant.id
                                                                )
                                                            )
                                                        }}
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                    {tenant.name}
                                                    </FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                            />
                                     ))}
                                </ScrollArea>
                                <FormMessage />
                            </FormItem>
                        )}
                        />}
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
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Role</Label>
                        <p className="col-span-2 font-medium">{roleName}</p>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Risk Level</Label>
                         <div className="col-span-2">
                             <Badge variant={user.risk === 'Low' ? 'success' : user.risk === 'Medium' ? 'outline' : 'destructive'}>{user.risk}</Badge>
                         </div>
                    </div>
                    {isSuperAdmin && <div className="space-y-1">
                        <Label className="text-muted-foreground">Tenant Assignments</Label>
                        <div className="col-span-2 flex flex-wrap gap-1">
                             {tenantsLoading ? <Loader className='w-4 h-4 animate-spin' /> : (user.assignedTenants || [user.tenantId])?.map(tId => {
                                const tenantName = tenants?.find(t => t.id === tId)?.name || tId;
                                return <Badge key={tId} variant="secondary">{tenantName}</Badge>
                            })}
                        </div>
                    </div>}
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
                            Edit User
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
