
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { simulationData } from './data';
import { Target, Send, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { DynamicForm } from './dynamic-form';

type SimulationDetails = Record<string, any>;

export default function SimulationsPage() {
  const [selectedSimulations, setSelectedSimulations] = useState<Set<string>>(new Set());
  const [simulationDetails, setSimulationDetails] = useState<Record<string, SimulationDetails>>({});
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
      // Also remove details for the deselected simulation
      setSimulationDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[simulationId];
        return newDetails;
      });
    }
    setSelectedSimulations(newSelected);
  };

  const handleDetailsChange = (simulationId: string, fieldName: string, value: any) => {
    setSimulationDetails(prev => ({
      ...prev,
      [simulationId]: {
        ...prev[simulationId],
        [fieldName]: value,
      },
    }));
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
    
    // Check for consent on all selected simulations
    for (const simId of Array.from(selectedSimulations)) {
        if (!simulationDetails[simId]?.consent) {
            const sim = simulationData.find(s => s.id === simId);
            toast({
                variant: "destructive",
                title: "Consent Required",
                description: `You must provide consent for the "${sim?.type}" simulation to proceed.`,
            });
            return;
        }
    }


    setIsSubmitting(true);
    
    const requests = Array.from(selectedSimulations).map(id => ({
      type: simulationData.find(s => s.id === id)?.type || 'Unknown Simulation',
      details: simulationDetails[id] || {},
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
                    <Label htmlFor={`checkbox-${sim.id}`} className="font-semibold text-base cursor-pointer text-left">
                      {sim.type}
                    </Label>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12 pr-4 pt-2 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{sim.description}</p>
                    {selectedSimulations.has(sim.id) && (
                       <DynamicForm 
                         fields={sim.fields}
                         formData={simulationDetails[sim.id] || {}}
                         onFormChange={(fieldName, value) => handleDetailsChange(sim.id, fieldName, value)}
                         isDisabled={isSubmitting}
                       />
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
