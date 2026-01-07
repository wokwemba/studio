import { MetricCard } from '@/components/dashboard/metric-card';
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { metrics } from '@/app/data';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RiskTrendChart />
        </div>
        <div className="lg:col-span-2">
           <AiInsights />
        </div>
      </div>
      <LeaderboardTable />
    </div>
  );
}
