'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addPackage } from "firebase/firestore";

type AttackType = 'DDoS' | 'SQL Injection' | 'Cross-Site Scripting' | 'Phishing' | 'Malware';
type Country = 'China' | 'Russia' | 'USA' | 'Brazil' | 'India' | 'Germany' | 'North Korea' | 'Iran';

type Threat = {
  id: number;
  type: AttackType;
  source: Country;
  target: Country;
  timestamp: string;
};

const attackTypes: AttackType[] = ['DDoS', 'SQL Injection', 'Cross-Site Scripting', 'Phishing', 'Malware'];
const countries: Country[] = ['China', 'Russia', 'USA', 'Brazil', 'India', 'Germany', 'North Korea', 'Iran'];

const generateRandomThreat = (id: number): Threat => ({
  id,
  type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
  source: countries[Math.floor(Math.random() * countries.length)],
  target: countries[Math.floor(Math.random() * countries.length)],
  timestamp: new Date().toLocaleTimeString(),
});

const attackColors: Record<AttackType, 'destructive' | 'secondary' | 'default' | 'outline'> = {
    'DDoS': 'destructive',
    'SQL Injection': 'secondary',
    'Cross-Site Scripting': 'default',
    'Phishing': 'outline',
    'Malware': 'destructive',
};

export default function ThreatIntelPage() {
  const [threats, setThreats] = useState<Threat[]>(() => Array.from({ length: 10 }, (_, i) => generateRandomThreat(i)));
  const [lastId, setLastId] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prevThreats => {
        const newId = lastId + 1;
        const newThreat = generateRandomThreat(newId);
        setLastId(newId);
        const updatedThreats = [newThreat, ...prevThreats];
        if (updatedThreats.length > 20) {
          return updatedThreats.slice(0, 20);
        }
        return updatedThreats;
      });
    }, 2000); // Add a new threat every 2 seconds

    return () => clearInterval(interval);
  }, [lastId]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Live Threat Intelligence</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Real-Time Attack Feed</CardTitle>
          <CardDescription>
            A live stream of simulated cyber attacks occurring globally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attack Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <AnimatePresence initial={false}>
                 <TableBody>
                  {threats.map((threat) => (
                     <motion.tr
                        key={threat.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="hover:bg-muted/50"
                      >
                      <TableCell>
                        <Badge variant={attackColors[threat.type]}>{threat.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{threat.source}</TableCell>
                      <TableCell className="font-medium">{threat.target}</TableCell>
                      <TableCell className="text-right text-muted-foreground font-mono text-xs">{threat.timestamp}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </AnimatePresence>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
