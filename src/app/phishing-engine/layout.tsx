
'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, AlertTriangle, FileText, Menu, Settings } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

const navLinks = [
    { href: '/phishing-engine/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/phishing-engine/transactions', label: 'Transactions', icon: FileText },
    { href: '/phishing-engine/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/phishing-engine/reports', label: 'Reports', icon: FileText },
];

function SidebarNav() {
    const pathname = usePathname();
    return (
        <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
                <Button 
                    key={link.href} 
                    variant={pathname === link.href ? 'secondary' : 'ghost'} 
                    className="justify-start" 
                    asChild
                >
                    <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}


export default function PhishingEngineLayout({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        if (auth) {
            auth.signOut();
        }
        router.push('/login');
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <h1 className="text-lg font-bold">SecureSMS ML</h1>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <SidebarNav />
                    </div>
                     <div className="mt-auto p-4">
                        <Card>
                            <CardContent className="p-2 flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} alt="User" />
                                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Anonymous User'}</p>
                                    <p className="text-xs text-muted-foreground leading-none">{user?.uid}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <SidebarNav />
                             <div className="mt-auto p-4">
                                <Card>
                                    <CardContent className="p-2 flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.photoURL || undefined} alt="User" />
                                            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{user?.displayName || 'Anonymous User'}</p>
                                            <p className="text-xs text-muted-foreground leading-none">{user?.uid}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Can add a search bar here if needed */}
                    </div>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
