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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore, inviteUserByEmail } from '@/firebase';
import { ALL_ROLES } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenantId: string;
}

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  roleIds: z.array(z.string()).min(1, { message: "Please select at least one role." }),
});

export function AddUserDialog({ isOpen, onOpenChange, tenantId }: AddUserDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        email: '',
        roleIds: ['CLIENT_USER'],
    }
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore) return;
    setIsSaving(true);
    
    const result = await inviteUserByEmail(firestore, data.email, data.roleIds, tenantId);

    if (result.success) {
      toast({
        title: 'User Invited',
        description: `An invitation has been prepared for ${data.email}. They will be prompted to set a password on their first login.`,
      });
      onOpenChange(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Invitation Failed',
        description: result.error,
      });
    }
    
    setIsSaving(false);
  };
  
  const handleClose = (open: boolean) => {
      if(!open && !isSaving) {
          form.reset();
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Invite a new user to your organization. They will be created with an 'Invited' status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                   <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                    {ALL_ROLES.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={field.value?.includes(role.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, role.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== role.id
                                  )
                                )
                          }}
                        />
                         <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">{role.name}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
                <Button variant="outline" onClick={() => handleClose(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Sending...' : 'Invite User'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
