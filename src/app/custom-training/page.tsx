
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicForm } from '@/app/simulations/dynamic-form';
import { type FormField, trainingTopics } from '@/app/simulations/data';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader, Send, BookUser } from 'lucide-react';

const formFields: FormField[] = [
    { name: 'trainingTopics', label: 'Select Training Topics', type: 'checkbox-group', options: trainingTopics },
    { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., "Senior DevOps Engineers"' },
    { name: 'numberOfStaff', label: 'Number of Staff', type: 'text', placeholder: 'e.g., 25' },
    { name: 'deliveryMethod', label: 'Delivery Method', type: 'select', options: ['Online', 'Virtual', 'Physical'] },
    { name: 'venue', label: 'Venue (if Physical)', type: 'text', placeholder: 'e.g., "Company HQ, Boardroom A"' },
    { name: 'duration', label: 'Proposed Duration', type: 'text', placeholder: 'e.g., "2 hours", "3 days"' },
    { name: 'proposedDate', label: 'Proposed Date', type: 'date', placeholder: 'Select a proposed date' },
    { name: 'timePeriod', label: 'Time Period', type: 'text', placeholder: 'e.g., "9am - 11am EAT"' },
    { name: 'learningObjectives', label: 'Key Learning Objectives', type: 'textarea', placeholder: 'List 3-5 things the learners should be able to do after the training.' },
    { name: 'requestedBy', label: 'Requesting Department/Team', type: 'text', placeholder: 'e.g., "Platform Engineering"' },
    { name: 'consent', label: 'I confirm this is a formal request for new training content.', type: 'checkbox' },
];

const requestType = "Cyber Security Awareness Training Request";

export default function CustomTrainingPage() {
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
            const value = formData[field.name];
            const isMissing = field.type === 'checkbox' ? !value : !value || (Array.isArray(value) && value.length === 0);
            if (isMissing) {
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
                        <BookUser />
                        <span>{requestType}</span>
                    </CardTitle>
                    <CardDescription>
                        Request a new, specific training module or campaign to be created.
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
