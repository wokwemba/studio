
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

const adminNavLinks = [
    { href: '/admin', label: 'Dashboard' },
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
        <Menubar>
            {adminNavLinks.map(link => (
                <MenubarMenu key={link.href}>
                    <MenubarTrigger asChild className={cn("cursor-pointer", pathname === link.href && "text-primary")}>
                        <Link href={link.href}>{link.label}</Link>
                    </MenubarTrigger>
                </MenubarMenu>
            ))}
        </Menubar>
        {children}
    </div>
  );
}
