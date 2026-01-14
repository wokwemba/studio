
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import type { Tenant } from '@/app/admin/tenants/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EditTenantDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenant: Tenant;
}

const FormSchema = z.object({
  name: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  status: z.enum(['active', 'suspended', 'trial']),
});

export function EditTenantDialog({ isOpen, onOpenChange, tenant }: EditTenantDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: tenant.name,
      status: tenant.status,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore) return;
    setIsSaving(true);
    
    const updates: Partial<Tenant> = {};
    if (data.name !== tenant.name) updates.name = data.name;
    if (data.status !== tenant.status) updates.status = data.status;

    if (Object.keys(updates).length === 0) {
        toast({
            description: "No changes were made.",
        });
        setIsSaving(false);
        onOpenChange(false);
        return;
    }

    try {
        const tenantDocRef = doc(firestore, 'tenants', tenant.id);
        updateDocumentNonBlocking(tenantDocRef, updates);

        toast({
            title: 'Tenant Updated',
            description: `The tenant "${data.name}" has been updated.`,
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Error updating tenant:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the tenant. Please check permissions."
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tenant: {tenant.name}</DialogTitle>
          <DialogDescription>
            Update the tenant's details and status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="trial">Trial</SelectItem>
                       <SelectItem value="active">Active</SelectItem>
                       <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    