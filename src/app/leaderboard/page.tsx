
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trophy, Users } from 'lucide-react';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { DepartmentLeaderboardTable } from '@/components/dashboard/department-leaderboard-table';

const individualCategories = [
    { value: 'risk-score', label: 'Overall Risk Score' },
    { value: 'training-completion', label: 'Training Completion Rate' },
    { value: 'quiz-score', label: 'Average Quiz Score' },
    { value: 'compliance-score', label: 'Compliance Score' },
    { value: 'phishing-reported', label: 'Most Phishing Reports' },
    { value: 'challenges-completed', label: 'Challenges Completed' },
];

const departmentCategories = [
    { value: 'risk-score', label: 'Average Risk Score' },
    { value: 'training-completion', label: 'Average Training Completion' },
    { value: 'phishing-reported', label: 'Total Phishing Reports' },
    { value: 'compliance-score', label: 'Average Compliance Score' },
];

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState('individual_risk-score');
    
    const [leaderboardType, category] = leaderboard.split('_');

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2"><Trophy /> Leaderboards</CardTitle>
                    <CardDescription>
                        See how you and your department rank across various security metrics.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Label>Select a leaderboard to view</Label>
                    <Select value={leaderboard} onValueChange={setLeaderboard}>
                        <SelectTrigger className="w-full md:w-[400px] mt-2">
                            <SelectValue placeholder="Select a leaderboard" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <Label className="px-2 py-1.5 text-xs font-semibold flex items-center gap-2"><Trophy className="h-4 w-4" /> Individual Rankings</Label>
                                {individualCategories.map(cat => (
                                    <SelectItem key={`individual_${cat.value}`} value={`individual_${cat.value}`}>{cat.label}</SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectGroup>
                                <Label className="px-2 py-1.5 text-xs font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Department Rankings</Label>
                                {departmentCategories.map(cat => (
                                    <SelectItem key={`department_${cat.value}`} value={`department_${cat.value}`}>{cat.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="mt-6">
            {leaderboardType === 'individual' ? (
                <LeaderboardTable category={category} />
            ) : (
                <DepartmentLeaderboardTable category={category} />
            )}
            </div>
        </div>
    );
}

    