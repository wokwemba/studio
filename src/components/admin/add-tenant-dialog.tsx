'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface AddTenantDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FormSchema = z.object({
  name: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  region: z.string().min(2, { message: "Region is required." }),
});

export function AddTenantDialog({ isOpen, onOpenChange }: AddTenantDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      region: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore) return;
    setIsSaving(true);

    try {
        const tenantsCollection = collection(firestore, 'tenants');
        await addDocumentNonBlocking(tenantsCollection, data);

        toast({
            title: 'Tenant Created',
            description: `The tenant "${data.name}" has been created successfully.`,
        });
        onOpenChange(false);
        form.reset({ name: '', region: '' });
    } catch (error) {
        console.error("Error creating tenant:", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "Could not create the tenant. Please check permissions and try again."
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
    if (!isSaving) {
        form.reset({ name: '', region: '' });
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Create a new corporate entity on the platform.
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
                    <Input placeholder="e.g., Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., North America" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='pt-4'>
                <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Creating...' : 'Create Tenant'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
