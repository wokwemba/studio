'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Badge } from '@/app/training/achievements/data';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface BadgeCardProps {
  badge: Badge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = badge.icon;
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        badge.isEarned ? 'bg-card border-primary/50' : 'bg-muted/50 text-muted-foreground'
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Icon className={cn('h-10 w-10', badge.isEarned ? 'text-primary' : 'text-muted-foreground')} />
        <CardTitle className={cn('text-lg font-headline', !badge.isEarned && 'text-muted-foreground')}>
          {badge.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs">{badge.description}</p>
      </CardContent>
    </Card>
  );
}

export function BadgeCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  );
}
