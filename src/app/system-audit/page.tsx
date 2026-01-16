
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicForm } from '@/app/simulations/dynamic-form';
import { type FormField } from '@/app/simulations/data';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader, Send, ClipboardCheck } from 'lucide-react';

const formFields: FormField[] = [
    { name: 'systemToAudit', label: 'System/Application/Process to Audit', type: 'text', placeholder: 'e.g., "Customer Authentication Service"' },
    { name: 'auditFramework', label: 'Audit Framework', type: 'select', options: ['ISO 27001', 'SOC 2 (Type II)', 'HIPAA', 'PCI-DSS', 'Internal Security Policy'] },
    { name: 'auditObjective', label: 'Primary Objective of Audit', type: 'textarea', placeholder: 'e.g., "Verify compliance for annual certification", "Assess data handling processes for PII."' },
    { name: 'systemOwner', label: 'System Owner/Primary Contact', type: 'text', placeholder: 'Email of the main point of contact for the system.' },
    { name: 'accessRequirements', label: 'Auditor Access Requirements', type: 'textarea', placeholder: 'Describe the level of access auditors will need (e.g., read-only access to production database, access to code repository).' },
    { name: 'consent', label: 'I confirm I am authorized to request an audit of this system.', type: 'checkbox' },
];

const requestType = "System Audit Request";

export default function SystemAuditPage() {
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

            toast({ title: 'Request Submitted', description: `Your ${requestType} has been successfully submitted for review.` });
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
                        <ClipboardCheck />
                        <span>{requestType}</span>
                    </CardTitle>
                    <CardDescription>
                        Request a formal audit of a system, application, or process against a specific framework.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                        Submit Request
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
