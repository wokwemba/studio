
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { simulationData, type Simulation } from './data';
import { Target, Send, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

type SimulationRequestPayload = {
  id: string;
  details: string;
};

export default function SimulationsPage() {
  const [selectedSimulations, setSelectedSimulations] = useState<Set<string>>(new Set());
  const [simulationDetails, setSimulationDetails] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleCheckboxChange = (simulationId: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedSimulations);
    if (checked) {
      newSelected.add(simulationId);
    } else {
      newSelected.delete(simulationId);
    }
    setSelectedSimulations(newSelected);
  };

  const handleDetailsChange = (simulationId: string, value: string) => {
    setSimulationDetails(prev => ({ ...prev, [simulationId]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to submit a request.",
        });
        return;
    }

    const tenantId = (user as any).tenantId;
    if (!tenantId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not determine your tenant ID.",
        });
        return;
    }

    setIsSubmitting(true);
    
    const requests = Array.from(selectedSimulations).map(id => ({
      type: simulationData.find(s => s.id === id)?.type || 'Unknown Simulation',
      details: simulationDetails[id] || 'No details provided.',
    }));

    try {
        const requestsCollection = collection(firestore, `tenants/${tenantId}/simulationRequests`);
        
        await addDocumentNonBlocking(requestsCollection, {
            userId: user.uid,
            userName: user.displayName || user.email,
            tenantId: tenantId,
            simulations: requests,
            status: 'Pending',
            requestedAt: new Date().toISOString()
        });

        toast({
            title: 'Simulations Requested',
            description: `You have successfully requested ${requests.length} simulation(s). An admin will review your request.`,
        });

        // Reset form
        setSelectedSimulations(new Set());
        setSimulationDetails({});

    } catch (error) {
        console.error("Error submitting simulation request:", error);
        toast({
            variant: "destructive",
            title: 'Submission Failed',
            description: 'There was an error submitting your request. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isSubmitDisabled = selectedSimulations.size === 0 || isSubmitting;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span>Cyber Simulation Request Console</span>
          </CardTitle>
          <CardDescription>
            Select the simulations you want to run and provide the necessary information for each.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {simulationData.map((sim) => (
              <AccordionItem value={sim.id} key={sim.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`checkbox-${sim.id}`}
                      checked={selectedSimulations.has(sim.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(sim.id, checked)}
                      onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when clicking checkbox
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`checkbox-${sim.id}`} className="font-semibold text-base cursor-pointer">
                      {sim.type}
                    </Label>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12 pr-4 pt-2 pb-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Required Inputs:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{sim.inputsNeeded}</p>
                    </div>
                    {selectedSimulations.has(sim.id) && (
                       <div>
                         <Label htmlFor={`textarea-${sim.id}`} className="font-semibold text-sm">Provide Details</Label>
                         <Textarea
                           id={`textarea-${sim.id}`}
                           className="mt-2"
                           placeholder="Enter details here..."
                           value={simulationDetails[sim.id] || ''}
                           onChange={(e) => handleDetailsChange(sim.id, e.target.value)}
                           disabled={isSubmitting}
                         />
                       </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : `Submit Request (${selectedSimulations.size})`}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
