'use client';

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, addYears } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CertificateTemplate } from '@/components/training/certificate';
import { useToast } from '@/hooks/use-toast';

type TrainingResult = {
  id: string;
  moduleId: string; // This is the topic/name of the course
  score: number;
  completedAt: string; // ISO string
};

export default function CertificatesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [generatingCertId, setGeneratingCertId] = useState<string | null>(null);
  const { toast } = useToast();

  const trainingResultsQuery = useMemoFirebase(
    () => (user ? query(
        collection(firestore, `users/${user.uid}/trainingResults`),
        where('score', '>=', 80) // Only fetch results where the user passed
      ) : null),
    [user, firestore]
  );
  const { data: earnedCertificates, isLoading: isLoadingCertificates } = useCollection<TrainingResult>(trainingResultsQuery);

  const handleGenerateCertificate = async (certificate: TrainingResult) => {
    if (!certificateRef.current || !user) return;
    setGeneratingCertId(certificate.id);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`CCyberGuard_Certificate_${certificate.moduleId.replace(/\s/g, '_')}.pdf`);
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been saved."
      });
    } catch(err) {
        console.error("Failed to generate certificate:", err);
        toast({
            variant: "destructive",
            title: "Certificate Generation Failed",
            description: "There was an error creating your certificate. Please try again."
        });
    } finally {
        setGeneratingCertId(null);
    }
  };
  
  const isLoading = isUserLoading || isLoadingCertificates;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* This hidden div is used for generating the PDF. It's populated with the data of the currently generating cert */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
         {user && generatingCertId && earnedCertificates && (
            <CertificateTemplate
                ref={certificateRef}
                userName={user.displayName || user.email || 'Valued User'}
                courseName={earnedCertificates.find(c => c.id === generatingCertId)?.moduleId || ''}
                completionDate={format(new Date(earnedCertificates.find(c => c.id === generatingCertId)?.completedAt || new Date()), 'MMMM d, yyyy')}
                expiryDate={format(addYears(new Date(earnedCertificates.find(c => c.id === generatingCertId)?.completedAt || new Date()), 1), 'MMMM d, yyyy')}
            />
         )}
      </div>

      <h1 className="text-3xl font-bold mb-6 font-headline">My Certificates</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Earned Certificates</CardTitle>
          <CardDescription>
            Here are the certificates you have earned by scoring 80% or higher on training quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !earnedCertificates || earnedCertificates.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <p>You haven't earned any certificates yet.</p>
              <p className="text-sm">Pass a training module quiz with a score of 80% or higher to earn one.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate Name</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnedCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.moduleId}</TableCell>
                  <TableCell>{format(new Date(cert.completedAt), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{format(addYears(new Date(cert.completedAt), 1), 'yyyy-MM-dd')}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleGenerateCertificate(cert)}
                      disabled={generatingCertId === cert.id}
                    >
                      {generatingCertId === cert.id ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      <span className="sr-only">Download Certificate</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
