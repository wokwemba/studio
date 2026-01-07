'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, ShieldAlert, TrendingUp, Crosshair, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

type AttackType = 'DDoS' | 'SQL Injection' | 'Cross-Site Scripting' | 'Phishing' | 'Malware' | 'Ransomware' | 'Zero-day Exploit';
type Country = 'China' | 'Russia' | 'USA' | 'Brazil' | 'India' | 'Germany' | 'North Korea' | 'Iran' | 'UK' | 'Nigeria';

type Threat = {
  id: number;
  type: AttackType;
  source: Country;
  target: Country;
  timestamp: string;
};

const attackTypes: AttackType[] = ['DDoS', 'SQL Injection', 'Cross-Site Scripting', 'Phishing', 'Malware', 'Ransomware', 'Zero-day Exploit'];
const countries: Country[] = ['China', 'Russia', 'USA', 'Brazil', 'India', 'Germany', 'North Korea', 'Iran', 'UK', 'Nigeria'];
const networkVectors = ["TCP SYN Flood", "UDP Flood", "ICMP Flood", "HTTP GET Flood", "DNS Amplification"];

const generateRandomThreat = (id: number): Threat => {
    const source = countries[Math.floor(Math.random() * countries.length)];
    let target = countries[Math.floor(Math.random() * countries.length)];
    // Ensure source and target are different
    while (source === target) {
        target = countries[Math.floor(Math.random() * countries.length)];
    }

    return {
        id,
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        source,
        target,
        timestamp: new Date().toLocaleTimeString(),
    };
};

const attackColors: Record<AttackType, 'destructive' | 'secondary' | 'default' | 'outline'> = {
    'DDoS': 'destructive',
    'SQL Injection': 'secondary',
    'Cross-Site Scripting': 'default',
    'Phishing': 'outline',
    'Malware': 'destructive',
    'Ransomware': 'destructive',
    'Zero-day Exploit': 'secondary',
};

const CountryFlag: React.FC<{ country: Country }> = ({ country }) => {
    const countryCode = {
        'China': 'CN', 'Russia': 'RU', 'USA': 'US', 'Brazil': 'BR', 'India': 'IN', 'Germany': 'DE', 'North Korea': 'KP', 'Iran': 'IR', 'UK': 'GB', 'Nigeria': 'NG'
    }[country];
    return <img src={`https://flagsapi.com/${countryCode}/flat/24.png`} alt={country} className="inline-block mr-2" />;
};


export default function ThreatIntelPage() {
  const [threats, setThreats] = useState<Threat[]>(() => Array.from({ length: 20 }, (_, i) => generateRandomThreat(i)));
  const [lastId, setLastId] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prevThreats => {
        const newId = lastId + 1;
        const newThreat = generateRandomThreat(newId);
        setLastId(newId);
        const updatedThreats = [newThreat, ...prevThreats];
        if (updatedThreats.length > 50) { // Keep a larger history for stats
          return updatedThreats.slice(0, 50);
        }
        return updatedThreats;
      });
    }, 2000); // Add a new threat every 2 seconds

    return () => clearInterval(interval);
  }, [lastId]);

  const topAttackers = useMemo(() => {
    const counts: Record<string, number> = {};
    threats.forEach(t => counts[t.source] = (counts[t.source] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [threats]);

  const topAttacked = useMemo(() => {
    const counts: Record<string, number> = {};
    threats.forEach(t => counts[t.target] = (counts[t.target] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [threats]);

  const attackTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    attackTypes.forEach(at => counts[at] = 0);
    threats.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1);
    const total = threats.length;
    return Object.entries(counts).map(([type, count]) => ({
      type: type as AttackType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }, [threats]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Live Threat Intelligence</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Threat Alerts</CardTitle>
              <CardDescription>
                A live stream of simulated cyber attacks occurring globally.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border h-[600px]">
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
                      {threats.slice(0, 20).map((threat) => (
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
                          <TableCell className="font-medium flex items-center"><CountryFlag country={threat.source} />{threat.source}</TableCell>
                          <TableCell className="font-medium flex items-center"><CountryFlag country={threat.target} />{threat.target}</TableCell>
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
        {/* Sidebar Column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-base"><TrendingUp /> Top Attackers</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {topAttackers.map(([country, count]) => (
                            <li key={country} className="flex items-center justify-between text-sm">
                                <span className="flex items-center"><CountryFlag country={country as Country} />{country}</span>
                                <span className="font-mono text-muted-foreground">{count}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-base"><Crosshair /> Top Attacked</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {topAttacked.map(([country, count]) => (
                            <li key={country} className="flex items-center justify-between text-sm">
                                <span className="flex items-center"><CountryFlag country={country as Country} />{country}</span>
                                <span className="font-mono text-muted-foreground">{count}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-base"><BarChart3 /> Attack Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {attackTypeDistribution.map(({type, percentage}) => (
                           <li key={type} className="text-sm">
                                <div className="flex justify-between mb-1">
                                    <span>{type}</span>
                                    <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                                </div>
                               <Progress value={percentage} className="h-2" />
                           </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-base">Top Vectors</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-wrap gap-2">
                        {networkVectors.map((vector) => (
                          <Badge key={vector} variant="secondary">{vector}</Badge>
                        ))}
                      </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
