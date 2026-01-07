export type Metric = {
  label: string;
  value: string;
  subValue: string;
  change?: 'increase' | 'decrease' | 'same';
};

export const metrics: Metric[] = [
  {
    label: 'Risk Score',
    value: '42',
    subValue: 'Medium',
    change: 'same',
  },
  {
    label: 'Training Completed',
    value: '68%',
    subValue: '11/16 modules',
  },
  {
    label: 'Global Rank',
    value: '#14',
    subValue: '/ 220 users',
    change: 'increase',
  },
];

export type LeaderboardUser = {
  rank: number;
  user: {
    name: string;
    avatarUrl: string;
    isCurrentUser?: boolean;
  };
  score: number;
  risk: 'Low' | 'Med' | 'High';
  trend: 'up' | 'down' | 'same';
};

export const leaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    user: { name: 'A. Kamau', avatarUrl: 'https://picsum.photos/seed/101/32/32' },
    score: 98,
    risk: 'Low',
    trend: 'up',
  },
  {
    rank: 2,
    user: { name: 'J. Otieno', avatarUrl: 'https://picsum.photos/seed/102/32/32' },
    score: 95,
    risk: 'Low',
    trend: 'same',
  },
  {
    rank: 3,
    user: {
      name: 'You',
      avatarUrl: 'https://picsum.photos/seed/100/32/32',
      isCurrentUser: true,
    },
    score: 87,
    risk: 'Med',
    trend: 'up',
  },
  {
    rank: 4,
    user: { name: 'L. Wanjiru', avatarUrl: 'https://picsum.photos/seed/103/32/32' },
    score: 85,
    risk: 'Med',
    trend: 'down',
  },
  {
    rank: 5,
    user: { name: 'M. Ochieng', avatarUrl: 'https://picsum.photos/seed/104/32/32' },
    score: 82,
    risk: 'Med',
    trend: 'up',
  },
];

export const riskTrendData = [
  { date: '2024-06-01', risk: 55 },
  { date: '2024-06-03', risk: 53 },
  { date: '2024-06-06', risk: 54 },
  { date: '2024-06-09', risk: 50 },
  { date: '2024-06-12', risk: 48 },
  { date: '2024-06-15', risk: 49 },
  { date: '2024-06-18', risk: 45 },
  { date: '2024-06-21', risk: 46 },
  { date: '2024-06-24', risk: 43 },
  { date: '2024-06-27', risk: 42 },
  { date: '2024-06-30', risk: 42 },
];
