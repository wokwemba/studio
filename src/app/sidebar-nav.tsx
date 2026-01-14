
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookUser,
  ShieldCheck,
  Trophy,
  LayoutDashboard,
  Target,
  FileText,
  User,
  Globe,
  History,
  Settings,
  Copy,
  Users,
  GitPullRequest,
  Mail,
  Zap,
  ShieldAlert,
  BarChart3,
  FileBadge,
  BadgeCheck,
  BookCopy,
  Blocks,
  Bell,
  Monitor,
  Building,
  Loader,
  Wand2,
  ShieldOff,
  BookOpenCheck,
  FlaskConical,
  BrainCircuit,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const mainLinks = [
  { href: "/training", label: "My Training", icon: BookOpenCheck },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/simulations", label: "Request Simulation", icon: Target },
  { href: "/certificates", label: "My Certificates", icon: FileText },
  { href: "/profile", label: "My Profile", icon: User },
];

const trainingLinks = [
    { href: "/training/module", label: "Training Generator", icon: Wand2 },
    { href: "/tutor", label: "AI Tutor", icon: BrainCircuit },
    { href: "/flashcards", label: "Flashcards", icon: Copy },
    { href: "/training/history", label: "Training History", icon: History },
    { href: "/training/achievements", label: "Achievements", icon: Trophy },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{roleId: string}>(userDocRef);

  const userRoleDocRef = useMemoFirebase(
    () => (firestore && userData?.roleId ? doc(firestore, "roles", userData.roleId) : null),
    [firestore, userData]
  );
  const { data: roleData, isLoading: isRoleDataLoading } = useDoc<{name: 'User' | 'Admin' | 'SuperAdmin'}>(userRoleDocRef);

  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin' || user?.email === 'wokwemba@safaricom.co.ke';
  
  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") {
        return false;
    }
    if (href !== "/" && pathname.startsWith(href)) {
        return true;
    }
    return pathname === href;
  };
  
  const isLoading = isUserLoading || isUserDataLoading || isRoleDataLoading;

  return (
    <SidebarMenu>
        <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                isActive={isActive('/')}
                className="font-headline"
                tooltip="Dashboard"
            >
                <Link href="/">
                    <LayoutDashboard className="h-5 w-5" />
                    {state === 'expanded' && <span>Dashboard</span>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      {mainLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(link.href)}
            className="font-headline"
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5" />
              {state === 'expanded' && <span>{link.label}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
       <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>AI & Learning Tools</SidebarGroupLabel>
            {trainingLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive(link.href)}
                        className="font-headline"
                        tooltip={link.label}
                        size="sm"
                    >
                        <Link href={link.href}>
                            <link.icon className="h-4 w-4" />
                            {state === 'expanded' && <span>{link.label}</span>}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarGroup>
      {isLoading && state === 'expanded' && (
        <>
        <SidebarSeparator />
          <div className="p-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading Admin Console...</span>
          </div>
        </>
      )}
      {userIsAdmin && (
      <>
        <SidebarSeparator />
         <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/admin')}
                className="font-headline"
                tooltip="Admin Panel"
            >
                <Link href="/admin">
                    <ShieldCheck className="h-5 w-5" />
                    {state === 'expanded' && <span>Admin Panel</span>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
        </>
        )}
    </SidebarMenu>
  );
}
