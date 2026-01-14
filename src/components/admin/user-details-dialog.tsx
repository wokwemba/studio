
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, Edit, X } from 'lucide-react';
import type { UserProfile } from '@/app/admin/users/page';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '../ui/badge';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile;
  roleName: string;
}

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

export function UserDetailsDialog({ isOpen, onOpenChange, user, roleName }: UserDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: user.name },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore || data.name === user.name) {
        setIsEditing(false);
        return;
    };
    setIsSaving(true);
    
    try {
        const userDocRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userDocRef, { name: data.name });
        toast({
            title: 'User Updated',
            description: `Successfully updated name for ${data.name}.`,
        });
        onOpenChange(false);
    } catch(error) {
        console.error("Error updating user name:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update user name. Please check permissions."
        })
    } finally {
        setIsSaving(false);
        setIsEditing(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
    // Delay resetting edit mode to avoid UI flicker
    setTimeout(() => setIsEditing(false), 200);
  }
  
  const userAvatar = user.photoURL || PlaceHolderImages.find(p => p.id === user.avatarId)?.imageUrl || '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={userAvatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl font-headline">{user.name}</DialogTitle>
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
                        <p className="col-span-2 font-medium">{user.risk}</p>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">User ID</Label>
                        <p className="col-span-2 font-mono text-xs bg-muted p-1 rounded break-all">{user.id}</p>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right text-muted-foreground">Tenant ID</Label>
                        <p className="col-span-2 font-mono text-xs bg-muted p-1 rounded break-all">{user.tenantId}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2" />
                        Edit User
                    </Button>
                    <Button onClick={handleClose}>Close</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
