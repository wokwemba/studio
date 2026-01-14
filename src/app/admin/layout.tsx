
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

const adminNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users & Roles' },
    { href: '/admin/campaigns', label: 'Campaigns' },
    { href: '/admin/simulations', label: 'Simulations' },
    { href: '/admin/content', label: 'Content Library' },
    { href: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

  return (
    <div className="space-y-6">
        <Card>
            <Menubar className="border-none">
                {adminNavLinks.map(link => (
                    <MenubarMenu key={link.href}>
                        <MenubarTrigger asChild className={cn("cursor-pointer", pathname === link.href && "text-primary font-semibold")}>
                            <Link href={link.href}>{link.label}</Link>
                        </MenubarTrigger>
                    </MenubarMenu>
                ))}
            </Menubar>
        </Card>
        {children}
    </div>
  );
}
