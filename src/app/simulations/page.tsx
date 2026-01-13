
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { simulationData, type Simulation } from './data';
import { Target, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SimulationRequest = {
  id: string;
  details: string;
};

export default function SimulationsPage() {
  const [selectedSimulations, setSelectedSimulations] = useState<Set<string>>(new Set());
  const [simulationDetails, setSimulationDetails] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

  const handleSubmit = () => {
    const requests: SimulationRequest[] = Array.from(selectedSimulations).map(id => ({
      id: simulationData.find(s => s.id === id)?.type || 'Unknown Simulation',
      details: simulationDetails[id] || 'No details provided.',
    }));

    console.log('Simulation Requests Submitted:', requests);
    
    toast({
      title: 'Simulations Requested',
      description: `You have requested ${requests.length} simulation(s).`,
    });

    // Reset form
    setSelectedSimulations(new Set());
    setSimulationDetails({});
  };
  
  const isSubmitDisabled = selectedSimulations.size === 0;

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
                <Send className="mr-2 h-4 w-4" />
                Submit Request ({selectedSimulations.size})
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
