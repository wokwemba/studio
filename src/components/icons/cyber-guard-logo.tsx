'use client';

import { type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CyberGuardLogo({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M12 2a9.5 9.5 0 0 0-9.5 9.5v3c0 1.4 1.1 2.5 2.5 2.5h14c1.4 0 2.5-1.1 2.5-2.5v-3A9.5 9.5 0 0 0 12 2z" />
      <rect x="7" y="10" width="10" height="3" rx="1" />
      <circle cx="12" cy="18.5" r="1.5" />
      <path d="M9.5 18.5h-2" />
      <path d="M14.5 18.5h2" />
      <path d="M12 17v-4" />
    </svg>
  );
}
