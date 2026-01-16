'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { LayoutDashboard, Users, Building, GitPullRequest, ClipboardList, BookCopy, ShieldAlert, BarChart3, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const adminNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/partners', label: 'Partners', icon: Building },
    { href: '/admin/campaigns', label: 'Campaigns', icon: GitPullRequest },
    { href: '/admin/simulations', label: 'Service Requests', icon: ClipboardList },
    { href: '/admin/content', label: 'Content', icon: BookCopy },
    { href: '/admin/incidents', label: 'Incidents', icon: ShieldAlert },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

  return (
    <ProtectedRoute requireRole="Admin">
      <div className="space-y-6">
          <Card>
              <Menubar className="border-none flex-wrap h-auto">
                  {adminNavLinks.map(link => (
                      <MenubarMenu key={link.href}>
                          <MenubarTrigger asChild className={cn("cursor-pointer", pathname.startsWith(link.href) && "text-primary bg-accent font-semibold")}>
                              <Link href={link.href} className='flex items-center gap-2'>
                                  <link.icon className="h-4 w-4" />
                                  {link.label}
                              </Link>
                          </MenubarTrigger>
                      </MenubarMenu>
                  ))}
              </Menubar>
          </Card>
          {children}
      </div>
    </ProtectedRoute>
  );
}
