'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ListTodo, Activity, History, Trophy, BarChart3, CheckCircle, ListChecks } from 'lucide-react';

const trainingNavLinks = [
    { href: '/training', label: 'My Training' },
    { href: '/training/quizzes', label: 'Quizzes & Simulations', icon: ListTodo },
    { href: '/training/history', label: 'History', icon: History },
    { href: '/training/performance', label: 'Performance', icon: BarChart3 },
    { href: '/training/achievements', label: 'Achievements', icon: Trophy },
    { href: '/training/recommended', label: 'Recommendations', icon: ListChecks },
];

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === '/training') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="space-y-6">
            <Card>
                <Menubar className="border-none flex-wrap h-auto">
                    {trainingNavLinks.map(link => (
                        <MenubarMenu key={link.href}>
                            <MenubarTrigger asChild className={cn("cursor-pointer", isLinkActive(link.href) && "text-primary bg-accent font-semibold")}>
                                <Link href={link.href} className='flex items-center gap-2'>
                                    {link.icon && <link.icon className="h-4 w-4" />}
                                    {link.label}
                                </Link>
                            </MenubarTrigger>
                        </MenubarMenu>
                    ))}
                </Menubar>
            </Card>
            {children}
        </div>
    );
}
