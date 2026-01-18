
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
  ScanLine,
  ClipboardList,
  ClipboardCheck,
  Key,
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
  { href: "/simulations", label: "Request Simulation", icon: FlaskConical },
  { href: "/phishing-engine/dashboard", label: "Phishing Detector", icon: ScanLine },
  { href: "/certificates", label: "My Certificates", icon: FileText },
  { href: "/profile", label: "My Profile", icon: User },
];

const servicesLinks = [
    { href: "/custom-training", label: "Custom Training", icon: BookUser },
    { href: "/vapt", label: "VAPT Console", icon: ScanLine },
    { href: "/incident-response", label: "Incident Response", icon: ClipboardList },
    { href: "/system-audit", label: "System Audit", icon: ClipboardCheck },
]

const trainingLinks = [
    { href: "/training/module", label: "Training Generator", icon: Wand2 },
    { href: "/tutor", label: "AI Tutor", icon: BrainCircuit },
    { href: "/flashcards", label: "Flashcards", icon: Copy },
    { href: "/training/history", label: "Training History", icon: History },
    { href: "/training/achievements", label: "Achievements", icon: Trophy },
]

const threatIntelLinks = [
    { href: "/dark-web-monitor", label: "Dark Web Monitor", icon: ShieldOff },
];

const gamesLinks = [
    { href: "/escape-room", label: "Escape Room", icon: Key },
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
  const { data: roleData, isLoading: isRoleDataLoading } = useDoc<{name: 'User' | 'Admin' | 'SuperAdmin'}>(userDocRef);

  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin' || user?.email === 'wokwemba@safaricom.co.ke';
  
  const isActive = (href: string) => {
    // Admin is a parent route, so it should be active for all sub-routes
    if (href === "/admin") {
      return pathname.startsWith("/admin");
    }
    // The "My Training" link should only be active for its main page and direct sub-pages, not other top-level links that also start with /training.
    if (href === "/training") {
        return pathname === '/training' || pathname.startsWith('/training/');
    }
    // For all other links, we want an exact match to avoid highlighting parent links incorrectly.
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const isLoading = isUserLoading || isUserDataLoading || isRoleDataLoading;

  return (
    <SidebarMenu>
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
            <SidebarGroupLabel>Other Services</SidebarGroupLabel>
            {servicesLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
       <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>AI &amp; Learning Tools</SidebarGroupLabel>
            {trainingLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>Games &amp; Challenges</SidebarGroupLabel>
            {gamesLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>Threat Intelligence</SidebarGroupLabel>
            {threatIntelLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
                isActive={isActive('/admin')}
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
