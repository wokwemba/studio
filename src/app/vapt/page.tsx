
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicForm } from '@/app/simulations/dynamic-form';
import { type FormField } from '@/app/simulations/data';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader, Send, ScanLine, GitBranch, ChevronsRight, Milestone, ClipboardCheck, Clock, Users, FileClock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const formFields: FormField[] = [
    { name: 'vaptObjective', label: 'Primary Business Objectives', type: 'textarea', placeholder: 'e.g., Achieve PCI-DSS compliance, reduce risk, prepare for an audit.' },
    { name: 'physicalBoundaries', label: 'Physical Boundaries of Campus/Scope', type: 'textarea', placeholder: 'List all buildings, addresses, or physical locations in scope.' },
    { name: 'remoteScope', label: 'Off-Campus or Remote Scope', type: 'textarea', placeholder: 'Are there any off-campus facilities, branches, or remote worker networks to include or exclude?' },
    { name: 'internalIPs', label: 'Internal IP Address Range(s)', type: 'textarea', placeholder: 'e.g., 10.0.0.0/16, 192.168.1.0/24' },
    { name: 'publicIPs', label: 'Public IP Address Range(s) & Associated Domains', type: 'textarea', placeholder: 'List all public-facing IPs and domain names.' },
    { name: 'networkDiagram', label: 'High-Level Network Diagram (Link or Description)', type: 'textarea', placeholder: 'Provide a link to or describe your network architecture (Firewalls, VLANs, DMZ, Wi-Fi).' },
    { name: 'networkSegmentation', label: 'Network Segmentation Strategy', type: 'textarea', placeholder: 'How are networks segmented? (e.g., VLANs for staff, students, labs, IoT, guests)' },
    { name: 'criticalServers', label: 'Critical Servers List', type: 'textarea', placeholder: 'List servers like Domain Controllers, file servers, databases, ERPs with roles and IPs.' },
    { name: 'remoteAccess', label: 'Remote Access Solutions', type: 'textarea', placeholder: 'VPN gateways, Citrix/VDI portals, RDP gateways.' },
    { name: 'operatingSystems', label: 'Major Operating Systems in Use', type: 'textarea', placeholder: 'e.g., Windows Server 2022, Ubuntu 22.04, macOS Sonoma' },
    { name: 'criticalApps', label: 'Business-Critical Applications', type: 'textarea', placeholder: 'e.g., Student Information System, Finance/Payroll, LMS like Moodle.' },
    { name: 'internalApps', label: 'Internally Developed Applications', type: 'textarea', placeholder: 'List any custom-built web or desktop applications in scope.' },
    { name: 'iotSystems', label: 'IoT/OT Systems in Scope', type: 'textarea', placeholder: 'e.g., CCTV, building access control, lab equipment, smart boards.' },
    { name: 'authorizedSoftware', label: 'Authorized/Standard Software List', type: 'textarea', placeholder: 'Do you have a list of standard software for endpoints? If so, provide a link or description.' },
    { name: 'identityProvider', label: 'Identity Provider & User Count', type: 'text', placeholder: 'e.g., Active Directory (~500 users), Azure AD (~1200 users).' },
    { name: 'userGroups', label: 'Main User Groups', type: 'textarea', placeholder: 'e.g., administration, teaching staff, students, guests, contractors.' },
    { name: 'passwordPolicy', label: 'Password Policy Details', type: 'textarea', placeholder: 'Describe complexity, length, and expiry requirements.' },
    { name: 'publicWebsites', label: 'Public-Facing Websites & Portals', type: 'textarea', placeholder: 'List all known public web assets.' },
    { name: 'publicAPIs', label: 'Exposed API Endpoints', type: 'textarea', placeholder: 'List all public-facing API gateways or endpoints.' },
    { name: 'cloudServices', label: 'Cloud Services in Scope', type: 'textarea', placeholder: 'e.g., AWS/Azure tenants, SaaS like Office 365, Google Workspace. Are they in scope?' },
    { name: 'legacySystems', label: 'Known Legacy or Decommissioned Systems', type: 'textarea', placeholder: 'Are there any old systems that might still be accessible?' },
    { name: 'pastAssessments', label: 'Previous Security Assessments', type: 'textarea', placeholder: 'Have you had a VAPT before? Can past reports be shared?' },
    { name: 'pastIncidents', label: 'Recent Security Incidents', type: 'textarea', placeholder: 'Describe any security incidents in the last 24 months.' },
    { name: 'securityControls', label: 'Current Security Controls', type: 'textarea', placeholder: 'e.g., EDR/XDR, SIEM, WAF, IPS/IDS, DLP.' },
    { name: 'vulnManagement', label: 'Vulnerability Management Program', type: 'textarea', placeholder: 'Is there an existing program? What tools are used (e.g., Nessus, Qualys)?' },
    { name: 'outOfScope', label: 'Explicitly Out-of-Scope Systems/IPs', type: 'textarea', placeholder: 'e.g., "Do not test the live production SCADA network."' },
    { name: 'testingWindow', label: 'Acceptable Testing Windows', type: 'text', placeholder: 'e.g., "Weekends only", "After 6 PM local time".' },
    { name: 'socialEngineeringRules', label: 'Permitted Level of Social Engineering', type: 'textarea', placeholder: 'e.g., Phishing is okay, but no vishing or physical attempts.' },
    { name: 'exploitRules', label: 'Permitted Level of Exploit Testing', type: 'textarea', placeholder: 'e.g., Proof-of-concept only, no DoS, no data exfiltration.' },
    { name: 'emergencyContacts', label: 'Primary Technical & 24/7 Emergency Contacts', type: 'textarea', placeholder: 'Provide names, roles, emails, and phone numbers.' },
    { name: 'consent', label: 'I confirm that I am authorized to request this security assessment on the specified scope.', type: 'checkbox' },
];

const requestType = "Vulnerability Assessment & Penetration Testing (VAPT)";

export default function VaptPage() {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const handleFormChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async () => {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to submit a request." });
            return;
        }
        const tenantId = (user as any).tenantId;
        if (!tenantId) {
            toast({ variant: "destructive", title: "Tenant ID Error", description: "Could not determine your tenant ID." });
            return;
        }

        for (const field of formFields) {
            if (!formData[field.name]) {
                toast({ variant: "destructive", title: "Incomplete Form", description: `Please fill out the "${field.label}" field.` });
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const requestsCollection = collection(firestore, `tenants/${tenantId}/simulationRequests`);
            await addDocumentNonBlocking(requestsCollection, {
                userId: user.uid,
                userName: user.displayName || user.email,
                tenantId: tenantId,
                simulations: [{ type: requestType, details: formData }],
                status: 'Pending',
                requestedAt: new Date().toISOString()
            });

            toast({ title: 'Request Submitted', description: `Your ${requestType} request has been successfully submitted for review.` });
            setFormData({});
        } catch (error) {
            console.error("Error submitting request:", error);
            toast({ variant: "destructive", title: 'Submission Failed', description: 'There was an error submitting your request. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <ScanLine />
                        <span>{requestType}</span>
                    </CardTitle>
                    <CardDescription>
                        A comprehensive security assessment to identify and exploit vulnerabilities in a defined scope.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <VaptProcessDetails />
                    <DynamicForm
                        fields={formFields}
                        formData={formData}
                        onFormChange={handleFormChange}
                        isDisabled={isSubmitting}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit VAPT Request
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
