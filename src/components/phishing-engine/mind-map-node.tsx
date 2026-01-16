'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MindMapNodeProps {
    title: string;
    children: React.ReactNode;
    isCentral?: boolean;
    icon?: LucideIcon;
}

export function MindMapNode({ title, children, isCentral = false, icon: Icon }: MindMapNodeProps) {
    return (
        <Card
            className={cn(
                "w-64 animate-in fade-in zoom-in-95",
                isCentral ? "shadow-2xl border-2 border-primary" : "shadow-lg"
            )}
        >
            <CardHeader className="p-3">
                <CardTitle className="text-sm font-headline flex items-center gap-2 capitalize">
                    {Icon && <Icon className="w-4 h-4 text-primary" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {children}
            </CardContent>
        </Card>
    )
}
