import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Leaderboard</h1>
      <LeaderboardTable />
    </div>
  );
}
