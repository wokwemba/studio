'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { simulationData } from './data';
import { Target, Send, Loader, FileText, Briefcase, GitBranch, ChevronsRight, Milestone, ClipboardCheck, Clock, Users, FileClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { DynamicForm } from './dynamic-form';
import { Badge } from '@/components/ui/badge';

type SimulationDetails = Record<string, any>;

const VaptProcessDetails = () => (
    <div className="space-y-8 text-sm my-6">
  
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <GitBranch />
            <span>Post-Discovery Process: From Questions to Action Plan</span>
          </CardTitle>
          <CardDescription>Based on your questionnaire answers, here is the structured workflow we follow to prepare for your campus VAPT.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PHASE 1 */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2"><Badge variant="secondary">PHASE 1</Badge> SCOPE FINALIZATION</h3>
            <p className="text-muted-foreground mb-3"><span className="font-semibold">Output:</span> Signed Scope of Work (SOW) Document</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><span className="font-semibold">Network Segmentation Mapping:</span> We'll map your IP ranges/subnets to logical zones (e.g., 10.0.10.0/24 = Administrative VLAN).</li>
              <li><span className="font-semibold">Asset Categorization:</span> Classify assets as Critical/High/Medium (e.g., Domain Controllers = Critical).</li>
              <li><span className="font-semibold">Exclusion Formalization:</span> Document all off-limits systems with justification.</li>
              <li><span className="font-semibold">Testing Windows Agreement:</span> Finalize exact dates/times for intrusive testing.</li>
            </ul>
          </div>
  
          {/* PHASE 2 */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2"><Badge variant="secondary">PHASE 2</Badge> RULES OF ENGAGEMENT (ROE)</h3>
            <p className="text-muted-foreground mb-3"><span className="font-semibold">Output:</span> Legally Binding ROE Document</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><span className="font-semibold">Authorized Activities:</span> Explicit list of permitted tests (e.g., "SQLi testing is authorized against the student portal").</li>
              <li><span className="font-semibold">Emergency Contact Protocol:</span> Step-by-step procedure for active breaches, critical vulnerabilities, or system instability.</li>
              <li><span className="font-semibold">Communication Channels:</span> Designated secure channels (encrypted email, Signal, etc.) for daily updates.</li>
              <li><span className="font-semibold">Data Handling Agreement:</span> How we handle any accidentally accessed sensitive data.</li>
            </ul>
          </div>
  
           {/* PHASE 3 */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2"><Badge variant="secondary">PHASE 3</Badge> TESTING PREPARATION</h3>
            <p className="text-muted-foreground mb-3"><span className="font-semibold">Output:</span> Technical Readiness for Testing</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li><span className="font-semibold">Credential Provisioning:</span> Providing user and privileged accounts for authenticated testing if agreed.</li>
                <li><span className="font-semibold">Test Harness Deployment:</span> Designating where to stage testing tools (e.g., internal VM).</li>
                <li><span className="font-semibold">Monitoring Coordination:</span> Briefing your SOC/IT team on our testing IPs to avoid false alarms.</li>
                <li><span className="font-semibold">Access Requirements:</span> Physical security badges or VPN configurations for testers.</li>
            </ul>
          </div>

          {/* PHASE 4 */}
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2"><Badge variant="secondary">PHASE 4</Badge> METHODOLOGY TAILORING</h3>
            <p className="text-muted-foreground mb-3"><span className="font-semibold">Output:</span> Custom Testing Plan</p>
            <p className="text-muted-foreground mb-3">How we adapt our testing emphasis based on your answers:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">Heavy Active Directory</p>
                    <p className="text-xs text-muted-foreground">Kerberoasting, BloodHound, GPO analysis, DC sync attacks.</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">Many IoT Devices</p>
                    <p className="text-xs text-muted-foreground">Default credential scanning, firmware analysis, segmentation testing.</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">Legacy Systems</p>
                    <p className="text-xs text-muted-foreground">Legacy protocol attacks (SMBv1), exploit research for older OS.</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">In-House Apps</p>
                    <p className="text-xs text-muted-foreground">Full OWASP Top 10, business logic testing, source code review.</p>
                </div>
            </div>
          </div>
  
          {/* PHASE 5 */}
           <div>
            <h3 className="font-bold flex items-center gap-2 mb-2"><Badge variant="secondary">PHASE 5</Badge> PRE-ENGAGEMENT CHECKLIST</h3>
            <p className="text-muted-foreground mb-3">Please confirm these items are completed before testing begins:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li><span className="font-semibold">Backups Verified:</span> Critical systems have recent, restorable backups.</li>
                <li><span className="font-semibold">Stakeholders Notified:</span> IT, security, and department heads are aware.</li>
                <li><span className="font-semibold">Monitoring Configured:</span> Your SOC can distinguish our testing from real attacks.</li>
                <li><span className="font-semibold">Point of Contact Availability:</span> Primary contact is available during testing windows.</li>
                <li><span className="font-semibold">Legal Sign-off:</span> ROE and SOW are signed by an authorized party.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <FileClock />
                <span>Deliverable Timeline (Typical)</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ol className="relative border-l border-border space-y-6">
                <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-background"><Clock className="w-3 h-3"/></span>
                    <h4 className="font-semibold">Day 1-12: Active Testing</h4>
                    <p className="text-xs text-muted-foreground">Passive reconnaissance, perimeter mapping, internal network assessment, and targeted exploitation.</p>
                </li>
                <li className="ml-6">
                     <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-background"><Users className="w-3 h-3"/></span>
                    <h4 className="font-semibold">Day 16: Executive Briefing</h4>
                    <p className="text-xs text-muted-foreground">Presentation of top findings and immediate risks to leadership.</p>
                </li>
                <li className="ml-6">
                     <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-background"><FileText className="w-3 h-3"/></span>
                    <h4 className="font-semibold">Day 20: Detailed Technical Report</h4>
                    <p className="text-xs text-muted-foreground">Comprehensive report with remediation steps, evidence, and CVSS scores.</p>
                </li>
                 <li className="ml-6">
                     <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-background"><ClipboardCheck className="w-3 h-3"/></span>
                    <h4 className="font-semibold">Day 30 (Optional): Remediation Retest</h4>
                    <p className="text-xs text-muted-foreground">Verification of critical/high vulnerability fixes.</p>
                </li>
            </ol>
        </CardContent>
      </Card>

    </div>
  );

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
    
    for (const simId of Array.from(selectedSimulations)) {
        const sim = simulationData.find(s => s.id === simId);
        if (!sim) continue;
        
        const details = simulationDetails[simId] || {};

        for (const field of sim.fields) {
            const value = details[field.name];
            const isMissing = field.type === 'checkbox' ? !value : !value || (Array.isArray(value) && value.length === 0);

            if (isMissing) {
                toast({
                    variant: "destructive",
                    title: "Incomplete Form",
                    description: `Please fill out the "${field.label}" field for the "${sim.type}" simulation.`,
                });
                return;
            }
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
                    {sim.id === 'vapt-1' && <VaptProcessDetails />}
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
