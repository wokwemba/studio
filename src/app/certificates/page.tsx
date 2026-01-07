'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Certificate = {
  name: string;
  date: string;
  expiry: string;
};

const certificates: Certificate[] = [
  {
    name: 'Phishing Awareness Fundamentals',
    date: '2024-05-20',
    expiry: '2025-05-20',
  },
  {
    name: 'Advanced Social Engineering Defense',
    date: '2024-03-15',
    expiry: '2025-03-15',
  },
  {
    name: 'MFA and Password Security',
    date: '2024-01-10',
    expiry: '2025-01-10',
  },
];


export default function CertificatesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Certificates</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Completed Courses</CardTitle>
          <CardDescription>
            Here are the certificates you have earned.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {certificates.map((cert) => (
                <TableRow key={cert.name}>
                  <TableCell className="font-medium">{cert.name}</TableCell>
                  <TableCell>{cert.date}</TableCell>
                  <TableCell>{cert.expiry}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Certificate</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
