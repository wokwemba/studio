
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCard, BadgeCardSkeleton } from '@/components/training/badge-card';
import { badges, type Badge } from './data';
import { CheckCircle } from 'lucide-react';

export default function AchievementsPage() {
  // In a real app, this would come from the user's profile in Firestore
  const earnedBadges = ['first-module', 'quiz-master', 'phishing-spotter'];
  const isLoading = false; // Simulate loading state if needed

  const userBadges = badges.map(badge => ({
    ...badge,
    isEarned: earnedBadges.includes(badge.id),
  }));

  const earnedCount = userBadges.filter(b => b.isEarned).length;
  const totalCount = userBadges.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            My Achievements
          </CardTitle>
          <CardDescription>
            You have earned {earnedCount} out of {totalCount} badges. Keep learning to collect them all!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <BadgeCardSkeleton key={i} />)
              : userBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
