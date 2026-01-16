
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DynamicForm } from '@/app/simulations/dynamic-form';
import { type FormField } from '@/app/simulations/data';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader, Send, ShieldCheck, Building } from 'lucide-react';
import Link from 'next/link';
import { industries } from '@/app/training/industries';

const formFields: FormField[] = [
    { name: 'companyName', label: 'Company/Organization Name', type: 'text', placeholder: 'e.g., Acme Corporation' },
    { name: 'industry', label: 'Industry', type: 'select', options: industries },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'e.g., Kenya' },
    { name: 'contactPersonName', label: 'Contact Person Name', type: 'text', placeholder: 'e.g., Jane Doe' },
    { name: 'contactPersonTitle', label: 'Contact Person Title / Role', type: 'text', placeholder: 'e.g., Head of IT Security' },
    { name: 'email', label: 'Official Email Address', type: 'text', placeholder: 'e.g., jane.doe@acme.com' },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: '+254 712 345 678' },
    { name: 'message', label: 'Message (Optional)', type: 'textarea', placeholder: 'Tell us a bit about your organization and needs.' },
];

export default function PartnerRegistrationPage() {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleFormChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async () => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Service Error", description: "The database service is not available. Please try again later." });
            return;
        }

        // Validate required fields
        const requiredFields = ['companyName', 'industry', 'country', 'contactPersonName', 'contactPersonTitle', 'email', 'phone'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                const fieldLabel = formFields.find(f => f.name === field)?.label || field;
                toast({ variant: "destructive", title: "Incomplete Form", description: `Please fill out the "${fieldLabel}" field.` });
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const requestsCollection = collection(firestore, `partner_requests`);
            await addDocumentNonBlocking(requestsCollection, {
                ...formData,
                status: 'new',
                requestedAt: new Date().toISOString()
            });

            toast({ title: 'Registration Request Submitted', description: `Thank you, ${formData.contactPersonName}. We have received your request and will be in touch shortly.` });
            setFormData({}); // Clear form on successful submission
        } catch (error) {
            console.error("Error submitting partner request:", error);
            toast({ variant: "destructive", title: 'Submission Failed', description: 'There was an error submitting your request. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background p-4"
        >
             <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
                data-ai-hint="business partnership abstract"
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 flex items-center gap-2 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
                <h1 className="text-3xl font-headline font-semibold text-white">CyberGuard</h1>
            </div>

            <Card className="w-full max-w-2xl z-10 bg-card/80 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Building />
                        <span>Register as a Partner</span>
                    </CardTitle>
                    <CardDescription>
                        Register your organization to explore our corporate solutions, including customized training and advanced analytics.
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
                <CardFooter className="flex-col gap-4 items-start">
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Registration
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
