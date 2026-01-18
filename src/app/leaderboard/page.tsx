
'use client';

import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { DepartmentLeaderboardTable } from '@/components/dashboard/department-leaderboard-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Rankings</TabsTrigger>
          <TabsTrigger value="department">Department Rankings</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-6">
          <LeaderboardTable />
        </TabsContent>
        <TabsContent value="department" className="mt-6">
            <DepartmentLeaderboardTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
