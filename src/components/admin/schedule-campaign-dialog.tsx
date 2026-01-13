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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleCampaignDialogProps {
  campaign: { id: string; title: string, tenantId: string };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({
      required_error: "A start date is required.",
    }),
    to: z.date({
      required_error: "An end date is required.",
    }),
  }),
});

export function ScheduleCampaignDialog({
  campaign,
  isOpen,
  onOpenChange,
}: ScheduleCampaignDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!firestore) return;
    setIsSaving(true);
    
    try {
      const campaignDocRef = doc(firestore, `tenants/${campaign.tenantId}/campaigns`, campaign.id);
      
      updateDocumentNonBlocking(campaignDocRef, {
        start_date: data.dateRange.from.toISOString(),
        end_date: data.dateRange.to.toISOString(),
        status: 'scheduled',
      });

      toast({
        title: 'Campaign Scheduled',
        description: `${campaign.title} has been scheduled successfully.`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error Scheduling Campaign',
        description: 'An error occurred while scheduling the campaign.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Campaign: {campaign.title}</DialogTitle>
          <DialogDescription>
            Select a start and end date for the campaign to begin auto-enrollment and notifications.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Campaign Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={(range) => field.onChange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
